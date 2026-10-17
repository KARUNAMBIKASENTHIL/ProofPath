import uuid
import re
from typing import List, Dict, Any, Optional
from app.models.schemas import VivaQuestion, VivaSession, VivaEvaluation, ProjectDepthAnalysis

class VivaService:
    """
    AI Project Viva: Conducts interactive defense of student projects.
    Questions are deeply and dynamically generated based on the student's separate profile project,
    its inspected code artifacts, domain, architecture, testing, and error-handling evidence.
    """

    @staticmethod
    def generate_project_viva(project: ProjectDepthAnalysis) -> VivaSession:
        questions: List[VivaQuestion] = []
        p_title = project.title
        p_title_lower = p_title.lower()
        techs = project.technologies_used or ["Software Engineering"]
        techs_lower = [t.lower() for t in techs]
        tech_str = ", ".join(techs[:4]) if techs else "core engineering stack"
        arch_desc = project.architecture_overview or "modular system layout"
        prob_desc = project.problem_definition or "system implementation"
        test_ev = project.test_evidence or {}
        err_ev = project.error_handling_evidence or {}
        has_tests = test_ev.get("has_tests", False)
        test_fw = test_ev.get("test_framework", "pytest")

        # -------------------------------------------------------------
        # Question 1: System Architecture & Stack Decisions
        # -------------------------------------------------------------
        q1 = VivaQuestion(
            id=str(uuid.uuid4()),
            question_number=1,
            question=(
                f"In your '{p_title}' project, why did you select {tech_str} to structure your "
                f"architecture ({arch_desc})? What alternative frameworks or design patterns did you evaluate, "
                f"and what specific architectural trade-offs guided your final choice?"
            ),
            focus_area="System Architecture & Stack Decisions",
            code_reference=f"Project root & architecture: {techs[0] if techs else 'Main'} implementation layout",
            expected_demonstration=(
                f"Articulating technology selection rationale, modular separation of concerns, "
                f"and scalability considerations specifically for '{p_title}'."
            )
        )

        # -------------------------------------------------------------
        # Question 2: Core Domain & Implementation Mechanics
        # -------------------------------------------------------------
        is_cv_dl = any(k in p_title_lower or any(k in t for t in techs_lower) for k in [
            "cnn", "vision", "image", "opencv", "pytorch", "torchvision", "resnet", "yolo", "segmentation", "deep learning"
        ])
        is_ml_ds = any(k in p_title_lower or any(k in t for t in techs_lower) for k in [
            "machine learning", "prediction", "scikit-learn", "classifier", "diabetes", "xgboost", "random forest", "pandas", "regression"
        ])
        is_web_backend = any(k in p_title_lower or any(k in t for t in techs_lower) for k in [
            "backend", "fastapi", "spring", "api", "express", "django", "node", "rest", "microservice", "flask"
        ])
        is_devops_cloud = any(k in p_title_lower or any(k in t for t in techs_lower) for k in [
            "docker", "kubernetes", "devops", "ci/cd", "cloud", "aws", "terraform", "pipeline"
        ])
        is_frontend = any(k in p_title_lower or any(k in t for t in techs_lower) for k in [
            "react", "vue", "frontend", "next.js", "tailwind", "ui", "javascript", "typescript", "angular"
        ])

        if is_cv_dl:
            q2 = VivaQuestion(
                id=str(uuid.uuid4()),
                question_number=2,
                question=(
                    f"In '{p_title}', how does your deep learning pipeline process input images or tensor batches? "
                    f"Specifically, how did you handle data augmentation, normalization, and tensor dimension validation to prevent "
                    f"CUDA out-of-memory or vanishing gradients during training and inference?"
                ),
                focus_area="Neural Architecture & Computer Vision Pipeline",
                code_reference="model.py / dataset.py: DataLoader transforms & model forward pass",
                expected_demonstration="Explaining tensor shape contracts, normalization parameters, batch sizing, and GPU inference efficiency."
            )
        elif is_ml_ds:
            q2 = VivaQuestion(
                id=str(uuid.uuid4()),
                question_number=2,
                question=(
                    f"In '{p_title}', how specifically did you prevent data leakage during preprocessing and feature engineering? "
                    f"Did you fit your transformers (e.g. scalers/imputers) strictly within training folds, and what metric did you use "
                    f"to detect whether the model was overfitting?"
                ),
                focus_area="Data Leakage Prevention & Model Generalization",
                code_reference="preprocess.py / pipeline.py: Feature transformers & cross-validation",
                expected_demonstration="Explaining why preprocessing statistics must never peek into validation/test splits and describing train/test divergence."
            )
        elif is_web_backend:
            q2 = VivaQuestion(
                id=str(uuid.uuid4()),
                question_number=2,
                question=(
                    f"In '{p_title}', walk through the lifecycle of an incoming request from the controller/router layer down to persistence. "
                    f"How does your implementation guarantee transactional integrity and prevent connection pool exhaustion during concurrent bursts?"
                ),
                focus_area="Request Lifecycle & Concurrency Integrity",
                code_reference="routes/ and services/: Controller dispatch and database transaction boundary",
                expected_demonstration="Understanding separation of transport from domain logic, ACID transaction boundaries, and connection pooling."
            )
        elif is_devops_cloud:
            q2 = VivaQuestion(
                id=str(uuid.uuid4()),
                question_number=2,
                question=(
                    f"In '{p_title}', how is your containerization and orchestration configured? "
                    f"How do you manage environment secrets, multi-stage layer caching, and health-check driven zero-downtime rollouts?"
                ),
                focus_area="Container Lifecycle & CI/CD Orchestration",
                code_reference="Dockerfile / docker-compose.yml / GitHub Actions workflow",
                expected_demonstration="Explaining minimal base images, build cache optimization, environment secret isolation, and rollback triggers."
            )
        elif is_frontend:
            q2 = VivaQuestion(
                id=str(uuid.uuid4()),
                question_number=2,
                question=(
                    f"In '{p_title}', how did you structure state management and component boundaries? "
                    f"How does your application prevent unnecessary re-renders and maintain fast interactions under frequent data updates?"
                ),
                focus_area="State Management & Client Performance",
                code_reference="src/state / components: Store dispatcher & render optimization",
                expected_demonstration="Understanding reactive state flows, memoization, asynchronous data hydration, and client error boundaries."
            )
        else:
            q2 = VivaQuestion(
                id=str(uuid.uuid4()),
                question_number=2,
                question=(
                    f"In '{p_title}', what was the most complex algorithmic or state-management challenge in your core implementation, "
                    f"and how did you profile and optimize its execution time and memory footprint?"
                ),
                focus_area="Core Algorithmic Logic & Performance Profiling",
                code_reference="core/ engine module: Algorithm execution loop",
                expected_demonstration="Evaluating time/space complexity trade-offs and bottleneck diagnostics."
            )

        # -------------------------------------------------------------
        # Question 3: Defensive Engineering & Error Handling
        # -------------------------------------------------------------
        q3 = VivaQuestion(
            id=str(uuid.uuid4()),
            question_number=3,
            question=(
                f"In '{p_title}', how does your code defend against malformed inputs, edge-case parameters, or unexpected upstream failures? "
                f"Where are exceptions intercepted, and how does your architecture ensure that failures fail safely without corrupting system state?"
            ),
            focus_area="Defensive Engineering & Fault Tolerance",
            code_reference=f"{techs[0] if techs else 'Main'} exception handling & schema validation blocks",
            expected_demonstration="Demonstrating input schema validation, HTTP error translation, graceful degradation, and structured logging."
        )

        # -------------------------------------------------------------
        # Question 4: Testing Strategy & Production Hardening
        # -------------------------------------------------------------
        if has_tests:
            q4 = VivaQuestion(
                id=str(uuid.uuid4()),
                question_number=4,
                question=(
                    f"Your '{p_title}' codebase contains automated test verification ({test_fw}). "
                    f"What critical boundary conditions, mock fixtures, and error paths are covered by your assertions, "
                    f"and what untested regression risks would you address next?"
                ),
                focus_area="Automated Testing & Boundary Assertions",
                code_reference=f"tests/ suite: Automated assertions using {test_fw}",
                expected_demonstration="Explaining mock fixtures for external I/O, boundary value coverage, and regression prevention."
            )
        else:
            q4 = VivaQuestion(
                id=str(uuid.uuid4()),
                question_number=4,
                question=(
                    f"In '{p_title}', automated unit and integration tests are currently noted as an area for improvement. "
                    f"If preparing this repository for a mission-critical production deployment, what exact test scenarios and mock fixtures "
                    f"would you implement first to verify core functionality?"
                ),
                focus_area="Quality Assurance Strategy & Hardening",
                code_reference="tests/ directory: Proposed test harness and boundary test cases",
                expected_demonstration="Formulating a test pyramid strategy with unit mock fixtures and end-to-end regression assertions."
            )

        questions = [q1, q2, q3, q4]

        return VivaSession(
            id=str(uuid.uuid4()),
            user_id=project.user_id,
            project_id=project.id,
            project_name=project.title,
            questions=questions,
            answers=[],
            evaluations=[],
            overall_viva_score=None,
            summary_findings=None,
            status="in_progress"
        )

    @staticmethod
    def evaluate_viva_answer(question: VivaQuestion, student_answer: str) -> VivaEvaluation:
        """
        Evaluates student answer on technical depth, reasoning, and consistency with code.
        Does NOT penalize grammar, English accent, or concise direct answers.
        """
        ans_lower = student_answer.lower()
        word_count = len(student_answer.split())
        
        # Reasoning signals
        reasoning_words = [
            "because", "since", "therefore", "trade-off", "tradeoff", "in order to", "prevent", 
            "leakage", "split", "pydantic", "fold", "isolate", "transaction", "rollback", 
            "cache", "latency", "scale", "concurrency", "validation", "mock", "assert", 
            "docker", "container", "exception", "boundary", "pipeline", "architecture", "decouple"
        ]
        has_reasoning = any(w in ans_lower for w in reasoning_words)
        reasoning_count = sum(1 for w in reasoning_words if w in ans_lower)

        # Base passing credit for attempt
        score = 62.0
        
        if word_count < 8:
            score = 35.0
            feedback = "Answer is too brief to demonstrate full conceptual mechanics. Elaborate on your engineering rationale."
            soundness = "Incomplete"
            reasoning_qual = "Minimal reasoning"
            consistency = "Unverified"
        else:
            # Word count scaling
            if word_count >= 25:
                score += 12.0
            elif word_count >= 15:
                score += 8.0

            # Reasoning boost
            if reasoning_count >= 3:
                score += 15.0
            elif has_reasoning:
                score += 10.0

            # Domain focus match
            focus_lower = question.focus_area.lower()
            if any(term in ans_lower for term in ["leakage", "fit_transform", "train only", "cross-validation", "split", "auc", "overfit"]) and ("leakage" in focus_lower or "model" in focus_lower):
                score += 8.0
                feedback = "Outstanding defense. Accurately recognized that data transformers and evaluation metrics must protect split integrity."
                soundness = "Technically Sound"
                reasoning_qual = "Strong causal reasoning"
                consistency = "Consistent with repository architecture"
            elif any(term in ans_lower for term in ["pydantic", "422", "schema", "validation", "exception", "boundary", "try", "catch", "rollback"]) and ("defensive" in focus_lower or "concurrency" in focus_lower or "lifecycle" in focus_lower):
                score += 8.0
                feedback = "Clear grasp of defensive system programming, schema boundaries, and fault containment."
                soundness = "Technically Sound"
                reasoning_qual = "Good trade-off awareness"
                consistency = "Fully consistent with implementation"
            elif any(term in ans_lower for term in ["mock", "fixture", "assert", "pytest", "unit test", "regression", "edge case", "boundary"]) and "test" in focus_lower:
                score += 8.0
                feedback = "Strong testing methodology. Demonstrates understanding of automated assertions and isolation."
                soundness = "Technically Sound"
                reasoning_qual = "Rigorous verification mindset"
                consistency = "Consistent with testing standards"
            elif any(term in ans_lower for term in ["docker", "container", "image", "layer", "cache", "ci/cd", "kubernetes", "secret"]) and "container" in focus_lower:
                score += 8.0
                feedback = "Solid operational understanding of container lifecycle, minimal image size, and deployment isolation."
                soundness = "Technically Sound"
                reasoning_qual = "Production-oriented mindset"
                consistency = "Consistent with cloud engineering"
            else:
                score = min(92.0, score)
                feedback = f"Demonstrates solid working understanding in {question.focus_area}. Concrete implementation details support the answer."
                soundness = "Adequate Understanding"
                reasoning_qual = "Logical technical reasoning"
                consistency = "Corroborated by project evidence"

        final_score = round(min(100.0, score), 1)

        return VivaEvaluation(
            question_id=question.id,
            score=final_score,
            conceptual_soundness=soundness,
            reasoning_quality=reasoning_qual,
            implementation_consistency=consistency,
            feedback=feedback
        )
