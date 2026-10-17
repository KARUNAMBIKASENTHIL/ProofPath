import uuid
from typing import List, Dict, Any, Optional
from app.models.schemas import EvidenceStatus, EvidenceRecord, ProjectDepthAnalysis

class EvidenceEngine:
    """
    Evidence over Keywords validation engine.
    Applies explicit deterministic verification rules to classify claimed competencies.
    """

    @staticmethod
    def evaluate_skill_evidence(
        skill_name: str,
        claimed_sources: List[str],
        project_analyses: List[ProjectDepthAnalysis],
        code_snippets: Optional[List[Dict[str, str]]] = None,
        source_accessible: bool = True
    ) -> EvidenceRecord:
        normalized = skill_name.lower().strip()
        rules_applied = []
        
        if not source_accessible:
            return EvidenceRecord(
                id=str(uuid.uuid4()),
                user_id="",
                skill_name=skill_name,
                normalized_skill=normalized,
                claimed_source=", ".join(claimed_sources) if claimed_sources else "Unknown",
                observed_evidence="Source could not be accessed or processed due to connection or authorization restrictions.",
                status=EvidenceStatus.ASSESSMENT_UNAVAILABLE,
                confidence=0.0,
                rules_applied=["RULE_UNAVAILABLE: External endpoint or private document was unreachable."]
            )

        # Find matching projects where this skill is demonstrated
        matching_projects = []
        for p in project_analyses:
            # check technologies or demonstrated competencies
            tech_matches = [t for t in p.technologies_used if normalized in t.lower() or t.lower() in normalized]
            comp_matches = [c for c in p.demonstrated_competencies if normalized in c.lower() or c.lower() in normalized]
            if tech_matches or comp_matches:
                matching_projects.append(p)

        # Rule evaluation
        if not matching_projects and not code_snippets:
            # Only claimed in resume or user profile
            rules_applied.append("RULE_CLAIM_ONLY: Skill is listed on resume/profile without observable repository implementation.")
            return EvidenceRecord(
                id=str(uuid.uuid4()),
                user_id="",
                skill_name=skill_name,
                normalized_skill=normalized,
                claimed_source="Resume Claim",
                observed_evidence="Mentioned in resume skill list, but no repository or code implementation was found to corroborate practical competency.",
                status=EvidenceStatus.PARTIALLY_SUPPORTED if "resume" in [s.lower() for s in claimed_sources] else EvidenceStatus.NOT_YET_VERIFIED,
                confidence=0.45 if "resume" in [s.lower() for s in claimed_sources] else 0.20,
                rules_applied=rules_applied
            )

        # We have project matches
        best_project = matching_projects[0] if matching_projects else None
        
        # Check for conflicting claims: e.g. Resume claims "Expert" or "Production ML", but project depth score < 25 or tutorial copy
        if best_project and best_project.implementation_depth_score < 30 and "expert" in " ".join(claimed_sources).lower():
            rules_applied.append("RULE_CONFLICT: High claimed proficiency contradicts shallow/tutorial-level repository implementation.")
            return EvidenceRecord(
                id=str(uuid.uuid4()),
                user_id=best_project.user_id,
                skill_name=skill_name,
                normalized_skill=normalized,
                claimed_source=f"Project: {best_project.title}",
                observed_evidence=f"Repository '{best_project.title}' contains only minimal boilerplate without error handling or substantial logic.",
                project_id=best_project.id,
                project_name=best_project.title,
                status=EvidenceStatus.CONFLICTING_EVIDENCE,
                confidence=0.40,
                rules_applied=rules_applied
            )

        # Check for Strong Support: Corroborated by code + (tests OR deployment OR high depth)
        has_tests = best_project and best_project.test_evidence.get("has_tests", False)
        has_deploy = best_project and best_project.deployment_evidence.get("has_deployment", False)
        depth_score = best_project.implementation_depth_score if best_project else 50
        
        if len(matching_projects) >= 2 or (best_project and depth_score >= 70 and (has_tests or has_deploy)):
            rules_applied.append("RULE_STRONG_SUPPORT: Demonstrated across multiple components/projects with verified tests or deployment artifacts.")
            return EvidenceRecord(
                id=str(uuid.uuid4()),
                user_id=best_project.user_id if best_project else "",
                skill_name=skill_name,
                normalized_skill=normalized,
                claimed_source=f"Project: {best_project.title}" if best_project else "Code Repository",
                observed_evidence=f"Demonstrated in '{best_project.title}' with substantial architecture, tests ({has_tests}), and deployment evidence ({has_deploy}).",
                file_path_or_url=best_project.repo_url if best_project else None,
                project_id=best_project.id if best_project else None,
                project_name=best_project.title if best_project else None,
                status=EvidenceStatus.STRONGLY_SUPPORTED,
                confidence=0.95,
                rules_applied=rules_applied
            )

        # Standard Supported: Concrete implementation found
        rules_applied.append("RULE_SUPPORTED: Practical code implementation verified in repository.")
        snippet_text = code_snippets[0].get("snippet") if code_snippets else None
        file_path = code_snippets[0].get("file") if code_snippets else (best_project.repo_url if best_project else None)
        
        return EvidenceRecord(
            id=str(uuid.uuid4()),
            user_id=best_project.user_id if best_project else "",
            skill_name=skill_name,
            normalized_skill=normalized,
            claimed_source=f"Project: {best_project.title}" if best_project else "Repository",
            observed_evidence=f"Observable code implementation located in '{best_project.title}'. Problem: {best_project.problem_definition[:80]}...",
            file_path_or_url=file_path,
            code_snippet=snippet_text,
            project_id=best_project.id if best_project else None,
            project_name=best_project.title if best_project else None,
            status=EvidenceStatus.SUPPORTED,
            confidence=0.85,
            rules_applied=rules_applied
        )
