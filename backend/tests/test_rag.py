import unittest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.services.rag_engine import rag_engine

class TestRAGEngine(unittest.TestCase):
    def test_knowledge_base_ingestion(self):
        rag_engine.ingest_knowledge_base()
        self.assertTrue(rag_engine.is_indexed)
        self.assertGreater(len(rag_engine.chunks), 5)
        print(f"\n[RAG TEST] Ingested {len(rag_engine.chunks)} chunks from curated knowledge base.")

    def test_retrieval_for_deployment_gap(self):
        rag_engine.ingest_knowledge_base()
        results = rag_engine.retrieve("deploy model docker container", target_role="Machine Learning Engineer", top_k=3)
        self.assertGreater(len(results), 0)
        top = results[0]
        self.assertTrue(any(w in top.content.lower() for w in ["deploy", "docker", "api", "model"]))
        print(f"[RAG TEST] Top retrieved chunk: {top.title} ({top.source_file})")

    def test_personalized_roadmap_generation(self):
        roadmap = rag_engine.generate_personalized_roadmap(
            user_id="demo-alex-chen",
            target_role="Machine Learning Engineer",
            verified_strengths=["Python Programming", "Machine Learning Algorithms & Training"],
            not_yet_verified_gaps=["Containerization & Deployment", "Automated Testing & Code Quality"]
        )
        self.assertEqual(roadmap.target_role, "Machine Learning Engineer")
        self.assertGreaterEqual(len(roadmap.milestones), 2)
        # Check first milestone targets the deployment gap
        m1 = roadmap.milestones[0]
        self.assertIn("Container", m1.title)
        self.assertGreater(len(m1.tasks), 2)
        self.assertIsNotNone(m1.verification_criteria)
        print(f"[RAG TEST] Generated Milestone 1: '{m1.title}' with {len(m1.tasks)} tasks and {len(m1.source_files)} source files.")

if __name__ == "__main__":
    unittest.main()
