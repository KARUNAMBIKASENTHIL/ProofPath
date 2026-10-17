import unittest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.models.schemas import EvidenceStatus
from app.services.evidence_engine import EvidenceEngine
from app.services.repo_analyzer import ProjectDepthAnalyzer

class TestEvidenceEngine(unittest.TestCase):
    def test_claim_without_code_is_partially_supported(self):
        ev = EvidenceEngine.evaluate_skill_evidence(
            skill_name="Kubernetes",
            claimed_sources=["Resume"],
            project_analyses=[],
            code_snippets=None
        )
        self.assertEqual(ev.status, EvidenceStatus.PARTIALLY_SUPPORTED)
        self.assertIn("RULE_CLAIM_ONLY", ev.rules_applied[0])

    def test_strong_support_with_tests_and_deployment(self):
        analysis = ProjectDepthAnalyzer.analyze_repository(
            title="Diabetes Risk Prediction Service",
            repo_url="https://github.com/alexchen-ml/diabetes-prediction-service",
            files={
                "main.py": "from fastapi import FastAPI\napp = FastAPI()\n@app.get('/health')\ndef h(): return {'status': 'ok'}",
                "tests/test_api.py": "def test_h():\n    assert 1 == 1\n    assert 2 == 2\n    assert 3 == 3",
                "Dockerfile": "FROM python:3.11\nWORKDIR /app",
                "requirements.txt": "fastapi\npytest\nscikit-learn\npandas\nuvicorn",
                "README.md": "# Readme\n" + ("Installation guide and architecture." * 60)
            }
        )
        ev = EvidenceEngine.evaluate_skill_evidence(
            skill_name="FastAPI",
            claimed_sources=["GitHub Repository"],
            project_analyses=[analysis]
        )
        self.assertEqual(ev.status, EvidenceStatus.STRONGLY_SUPPORTED)

    def test_inaccessible_source_is_assessment_unavailable(self):
        ev = EvidenceEngine.evaluate_skill_evidence(
            skill_name="AWS Cloud",
            claimed_sources=["Private AWS Account"],
            project_analyses=[],
            source_accessible=False
        )
        self.assertEqual(ev.status, EvidenceStatus.ASSESSMENT_UNAVAILABLE)
        self.assertIn("RULE_UNAVAILABLE", ev.rules_applied[0])

if __name__ == "__main__":
    unittest.main()
