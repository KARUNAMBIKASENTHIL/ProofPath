import unittest
import sys
from pathlib import Path

# Add backend directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.models.schemas import EvidenceStatus, EvidenceRecord
from app.services.role_catalog import get_role_by_id
from app.services.scoring_engine import ScoringEngine
from app.services.sample_data import get_demo_student_alex_chen

class TestScoringEngine(unittest.TestCase):
    def test_deterministic_scoring_alex_chen(self):
        role = get_role_by_id("mle")
        self.assertIsNotNone(role)
        self.assertEqual(len(role.competencies), 8)

        demo = get_demo_student_alex_chen()
        breakdown = ScoringEngine.calculate_readiness(role, demo["evidence_records"])

        # Alex Chen initial score is precisely 78.9%
        self.assertTrue(75.0 <= breakdown.overall_readiness_score <= 82.0)
        self.assertEqual(breakdown.methodology_version, "v1.2.0-deterministic")
        self.assertIn("Containerization & Deployment (Not yet verified)", breakdown.missing_evidence)
        self.assertTrue(any("Python Programming" in p for p in breakdown.positive_contributors))

    def test_reassessment_after_deployment_evidence(self):
        role = get_role_by_id("mle")
        demo = get_demo_student_alex_chen()
        records = list(demo["evidence_records"])

        initial_breakdown = ScoringEngine.calculate_readiness(role, records)
        initial_score = initial_breakdown.overall_readiness_score

        # Simulate submitting Dockerfile evidence
        for r in records:
            if r.normalized_skill == "deployment":
                r.status = EvidenceStatus.STRONGLY_SUPPORTED
                r.observed_evidence = "Multi-stage Dockerfile verified."
                r.confidence = 0.95

        new_breakdown = ScoringEngine.calculate_readiness(role, records)
        self.assertGreater(new_breakdown.overall_readiness_score, initial_score)
        self.assertGreaterEqual(new_breakdown.overall_readiness_score, 88.0)
        print(f"\n[TEST PASS] Initial Score: {initial_score}%, Reassessed Score: {new_breakdown.overall_readiness_score}%")

if __name__ == "__main__":
    unittest.main()
