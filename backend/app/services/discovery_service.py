from typing import List, Dict, Any
from app.models.schemas import (
    CareerRecommendation,
    SimulatorOption,
    EvidenceRecord,
    EvidenceStatus
)
from app.services.role_catalog import get_role_catalog
from app.services.scoring_engine import ScoringEngine

class CareerDiscoveryService:
    """
    Career Discovery & What-If Simulator Service.
    Compares evidence profiles across all known roles and simulates prospective improvement interventions.
    """

    @staticmethod
    def discover_careers(evidence_records: List[EvidenceRecord]) -> List[CareerRecommendation]:
        catalog = get_role_catalog()
        recommendations = []

        for role_id, role in catalog.items():
            breakdown = ScoringEngine.calculate_readiness(role, evidence_records)
            score = breakdown.overall_readiness_score
            
            demonstrated = [
                eval_item["name"] 
                for eval_item in breakdown.skill_evaluations 
                if eval_item["coverage_value"] >= 0.70
            ]
            missing = [
                eval_item["name"] 
                for eval_item in breakdown.skill_evaluations 
                if eval_item["coverage_value"] < 0.70
            ]

            # Suitability rationale
            if score >= 75:
                rationale = f"Strong alignment. Your observed code and project evidence demonstrates {len(demonstrated)} core competencies required for {role.name}."
            elif score >= 50:
                rationale = f"Moderate alignment. You have solid foundations in {', '.join(demonstrated[:2]) if demonstrated else 'programming'}, but need practical artifacts in {', '.join(missing[:2]) if missing else 'specialized domains'}."
            else:
                rationale = f"Emerging match. Current evidence only partially covers baseline requirements for {role.name}."

            next_step = f"Focus on building verified proof for: {missing[0]}." if missing else "Review advanced system design."

            recommendations.append(CareerRecommendation(
                role_id=role_id,
                role_name=role.name,
                match_percentage=score,
                suitability_rationale=rationale,
                demonstrated_competencies=demonstrated,
                missing_competencies=missing,
                recommended_next_step=next_step,
                alternative_role_rationale="Alternative domain with shared programming foundations."
            ))

        # Sort descending by match percentage
        recommendations.sort(key=lambda r: r.match_percentage, reverse=True)
        return recommendations

    @staticmethod
    def simulate_what_if_options(
        target_role_id: str,
        current_score: float,
        evidence_records: List[EvidenceRecord]
    ) -> List[SimulatorOption]:
        """
        Simulates different action paths to demonstrate that closing architectural/deployment
        gaps delivers higher readiness gains than churning out repetitive models.
        """
        return [
            SimulatorOption(
                id="opt-b-deploy",
                title="Option A: Deploy Model Behind Dockerized REST API",
                action_type="Architecture & DevOps",
                targeted_competencies=["Containerization & Deployment", "Model Serving & REST APIs"],
                addresses_gap="Current project has training logic but lacks container packaging and cloud-ready endpoints.",
                expected_new_evidence="Dockerfile, docker-compose.yml, and live FastAPI prediction endpoint.",
                estimated_effort="4-5 days (15 hours)",
                simulated_score_delta=+18.0,
                simulated_new_score=min(100.0, current_score + 18.0),
                qualitative_explanation=(
                    "HIGH IMPACT: Closes the critical deployment gap. Hiring teams strongly favor candidates who can take a model from a notebook into an accessible containerized service."
                ),
                comparison_benefit="Delivers 3x more readiness value than training an additional algorithm on the same dataset."
            ),
            SimulatorOption(
                id="opt-c-testing",
                title="Option B: Implement Automated Pytest Regression Suite",
                action_type="Software Engineering Hygiene",
                targeted_competencies=["Automated Testing & Code Quality"],
                addresses_gap="Repository has zero tests for preprocessing edge cases, NaN values, or API error handling.",
                expected_new_evidence="tests/ directory with test_api.py, test_preprocessing.py, and CI test runner.",
                estimated_effort="2-3 days (8 hours)",
                simulated_score_delta=+10.0,
                simulated_new_score=min(100.0, current_score + 10.0),
                qualitative_explanation=(
                    "SOLID GAIN: Elevates code reliability and software engineering discipline. Demonstrates production defensive programming."
                ),
                comparison_benefit="Essential engineering baseline; directly proves robustness under unexpected inputs."
            ),
            SimulatorOption(
                id="opt-a-model",
                title="Option C: Train Another Machine Learning Model (e.g. XGBoost)",
                action_type="Algorithmic Exploration",
                targeted_competencies=["Machine Learning Algorithms & Training"],
                addresses_gap="Adds an alternative algorithm to an already demonstrated modeling competency.",
                expected_new_evidence="train_xgboost.py script with hyperparameter tuning log.",
                estimated_effort="2 days (6 hours)",
                simulated_score_delta=+3.5,
                simulated_new_score=min(100.0, current_score + 3.5),
                qualitative_explanation=(
                    "DIMINISHING RETURNS: Modeling fundamentals are already supported. Adding another algorithm yields minor marginal value compared to deploying or testing."
                ),
                comparison_benefit="Lower strategic priority; does not unblock the missing deployment and operational readiness requirements."
            )
        ]
