from typing import Dict, List, Any, Optional
from app.models.schemas import (
    EvidenceStatus,
    JobRoleDefinition,
    AssessmentScoreBreakdown,
    EvidenceRecord
)

METHODOLOGY_VERSION = "v1.2.0-deterministic"

# Explicit coverage mapping
STATUS_COVERAGE_MAP = {
    EvidenceStatus.STRONGLY_SUPPORTED: 1.00,
    EvidenceStatus.SUPPORTED: 0.85,
    EvidenceStatus.PARTIALLY_SUPPORTED: 0.45,
    EvidenceStatus.CONFLICTING_EVIDENCE: 0.15,
    EvidenceStatus.NOT_YET_VERIFIED: 0.00,
    EvidenceStatus.ASSESSMENT_UNAVAILABLE: 0.00,
}

class ScoringEngine:
    """
    Deterministic Job Readiness Scoring Engine.
    Executes pure Python calculation without LLM hallucinations.
    Follows: Score = 100 * sum(w_i * coverage_i) / sum(w_i)
    """
    
    @staticmethod
    def calculate_readiness(
        role: JobRoleDefinition,
        evidence_records: List[EvidenceRecord],
        viva_score: Optional[float] = None
    ) -> AssessmentScoreBreakdown:
        # Group evidence by normalized skill
        evidence_by_skill: Dict[str, List[EvidenceRecord]] = {}
        for ev in evidence_records:
            norm = ev.normalized_skill.lower().strip()
            if norm not in evidence_by_skill:
                evidence_by_skill[norm] = []
            evidence_by_skill[norm].append(ev)

        skill_evaluations: List[Dict[str, Any]] = []
        positive_contributors: List[str] = []
        missing_evidence: List[str] = []
        
        weighted_coverage_sum = 0.0
        total_weight_sum = 0.0
        assessed_competencies_count = 0
        total_confidence_sum = 0.0

        for req in role.competencies:
            w = req.importance_weight
            total_weight_sum += w
            
            # Find evidence matches
            matched_evidence = []
            # Check direct skill_id match or aliases
            for norm_key, records in evidence_by_skill.items():
                if norm_key == req.skill_id or norm_key in req.name.lower() or req.skill_id in norm_key:
                    matched_evidence.extend(records)

            if not matched_evidence:
                status = EvidenceStatus.NOT_YET_VERIFIED
                coverage = STATUS_COVERAGE_MAP[status]
                confidence = 0.0
                reason = f"No observable evidence found in uploaded resumes or connected repositories for {req.name}."
                missing_evidence.append(req.name)
            else:
                # Determine status from highest evidence or corroboration
                statuses = [e.status for e in matched_evidence]
                confidences = [e.confidence for e in matched_evidence]
                avg_conf = sum(confidences) / len(confidences)
                
                # Rule: Multiple independent sources promote to strongly supported
                sources = set(e.claimed_source for e in matched_evidence)
                if len(sources) > 1 and any(s in [EvidenceStatus.SUPPORTED, EvidenceStatus.STRONGLY_SUPPORTED] for s in statuses):
                    status = EvidenceStatus.STRONGLY_SUPPORTED
                elif EvidenceStatus.STRONGLY_SUPPORTED in statuses:
                    status = EvidenceStatus.STRONGLY_SUPPORTED
                elif EvidenceStatus.SUPPORTED in statuses:
                    status = EvidenceStatus.SUPPORTED
                elif EvidenceStatus.PARTIALLY_SUPPORTED in statuses:
                    status = EvidenceStatus.PARTIALLY_SUPPORTED
                elif EvidenceStatus.CONFLICTING_EVIDENCE in statuses:
                    status = EvidenceStatus.CONFLICTING_EVIDENCE
                else:
                    status = EvidenceStatus.NOT_YET_VERIFIED

                # Viva boost rule: If AI viva score is high (>= 80%) on this project, elevate partial to supported
                if viva_score and viva_score >= 80.0 and status == EvidenceStatus.PARTIALLY_SUPPORTED:
                    status = EvidenceStatus.SUPPORTED
                    matched_evidence[0].rules_applied.append(f"Elevated to Supported via strong Viva defense ({viva_score:.1f}%)")

                coverage = STATUS_COVERAGE_MAP[status]
                confidence = avg_conf
                assessed_competencies_count += 1
                total_confidence_sum += confidence
                
                if coverage >= 0.70:
                    positive_contributors.append(f"{req.name} ({status.value})")
                elif status in [EvidenceStatus.NOT_YET_VERIFIED, EvidenceStatus.PARTIALLY_SUPPORTED]:
                    missing_evidence.append(f"{req.name} ({status.value})")
                
                reason = f"Evaluated across {len(matched_evidence)} artifact(s). Status: {status.value}."

            weighted_coverage_sum += w * coverage

            skill_evaluations.append({
                "skill_id": req.skill_id,
                "name": req.name,
                "category": req.category,
                "importance_weight": w,
                "status": status.value,
                "coverage_value": coverage,
                "confidence": round(confidence, 2),
                "evidence_count": len(matched_evidence),
                "artifacts": [
                    {
                        "source": e.claimed_source,
                        "observed": e.observed_evidence,
                        "file_path": e.file_path_or_url,
                        "code_snippet": e.code_snippet
                    } for e in matched_evidence
                ],
                "evaluation_reason": reason
            })

        # Calculate scores
        overall_score = round(100.0 * (weighted_coverage_sum / total_weight_sum), 1) if total_weight_sum > 0 else 0.0
        demonstrated_coverage = round(weighted_coverage_sum / total_weight_sum, 2) if total_weight_sum > 0 else 0.0
        
        total_competencies = len(role.competencies)
        evidence_completeness = round(100.0 * (assessed_competencies_count / total_competencies), 1) if total_competencies > 0 else 0.0
        assessment_confidence = round((total_confidence_sum / assessed_competencies_count) * 100.0, 1) if assessed_competencies_count > 0 else 30.0

        formula_explanation = (
            f"Deterministic Formula: Score = 100 × (Σ w_i × c_i) / (Σ w_i). "
            f"Evaluated {total_competencies} competencies with total weight {total_weight_sum:.2f}. "
            f"Sum of weighted coverage is {weighted_coverage_sum:.2f}, resulting in {overall_score}%. "
            f"Evidence completeness is {evidence_completeness}% ({assessed_competencies_count}/{total_competencies} role requirements examined). "
            f"Scoring Methodology Version: {METHODOLOGY_VERSION}."
        )

        return AssessmentScoreBreakdown(
            overall_readiness_score=overall_score,
            demonstrated_coverage=demonstrated_coverage,
            evidence_completeness=evidence_completeness,
            assessment_confidence=assessment_confidence,
            methodology_version=METHODOLOGY_VERSION,
            role_id=role.id,
            role_name=role.name,
            skill_evaluations=skill_evaluations,
            positive_contributors=positive_contributors,
            missing_evidence=missing_evidence,
            formula_explanation=formula_explanation
        )
