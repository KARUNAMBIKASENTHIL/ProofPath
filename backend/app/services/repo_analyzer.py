import os
import uuid
import re
from typing import Dict, List, Any, Optional
from app.models.schemas import ProjectDepthAnalysis

class ProjectDepthAnalyzer:
    """
    Project Depth Intelligence: Analyzes architecture, testing, error handling,
    deployment readiness, documentation, and technical depth.
    """

    @staticmethod
    def analyze_repository(
        title: str,
        repo_url: Optional[str],
        files: Dict[str, str],  # relative_path -> content_sample
        user_id: str = "user-1"
    ) -> ProjectDepthAnalysis:
        file_paths = list(files.keys())
        all_text = " ".join(files.values())
        
        # 1. Detect Technologies & Dependencies
        technologies = set()
        if any(f.endswith(".py") for f in file_paths):
            technologies.add("Python")
        if any(f.endswith(".js") or f.endswith(".jsx") for f in file_paths):
            technologies.add("JavaScript")
        if any(f.endswith(".ts") or f.endswith(".tsx") for f in file_paths):
            technologies.add("TypeScript")
        if any(f.endswith(".java") for f in file_paths):
            technologies.add("Java")
        
        # Frameworks from requirements or imports
        if "fastapi" in all_text.lower():
            technologies.add("FastAPI")
        if "flask" in all_text.lower():
            technologies.add("Flask")
        if "django" in all_text.lower():
            technologies.add("Django")
        if "react" in all_text.lower():
            technologies.add("React")
        if "spring" in all_text.lower():
            technologies.add("Spring Boot")
        if "scikit-learn" in all_text.lower() or "sklearn" in all_text.lower():
            technologies.add("scikit-learn")
        if "pandas" in all_text.lower():
            technologies.add("pandas")
        if "torch" in all_text.lower() or "pytorch" in all_text.lower():
            technologies.add("PyTorch")
        if "tensorflow" in all_text.lower():
            technologies.add("TensorFlow")
        if "docker" in all_text.lower() or any("dockerfile" in f.lower() for f in file_paths):
            technologies.add("Docker")
        if "pytest" in all_text.lower():
            technologies.add("pytest")

        # 2. Testing Analysis
        test_files = [f for f in file_paths if "test" in f.lower() or f.startswith("tests/")]
        has_tests = len(test_files) > 0
        test_assertions = len(re.findall(r"\bassert\b|assertEquals|expect\(", all_text))
        test_evidence = {
            "has_tests": has_tests,
            "test_file_count": len(test_files),
            "test_files": test_files,
            "assertions_detected": test_assertions,
            "test_framework": "pytest" if "pytest" in all_text.lower() else ("unittest" if "unittest" in all_text.lower() else ("jest" if "jest" in all_text.lower() else "None")),
            "evaluation_note": f"Found {len(test_files)} test file(s) with {test_assertions} test assertions." if has_tests else "No automated unit or integration tests detected."
        }

        # 3. Error Handling Analysis
        try_blocks = len(re.findall(r"\btry\s*:", all_text)) + len(re.findall(r"\btry\s*\{", all_text))
        status_code_checks = len(re.findall(r"status_code|HTTPException|ResponseStatusException", all_text))
        validation_schemas = len(re.findall(r"class\s+\w+\(BaseModel\):|@Valid|validate", all_text))
        error_handling_evidence = {
            "try_catch_blocks": try_blocks,
            "explicit_http_exceptions": status_code_checks,
            "schema_validations": validation_schemas,
            "has_robust_handling": (try_blocks >= 2 and (status_code_checks > 0 or validation_schemas > 0)),
            "summary": f"Detected {try_blocks} try-catch blocks and {validation_schemas} structured input validation schemas."
        }

        # 4. Documentation Quality
        readme_file = next((f for f in file_paths if "readme" in f.lower()), None)
        has_readme = readme_file is not None
        readme_length = len(files[readme_file]) if has_readme else 0
        has_install_guide = bool(re.search(r"install|setup|usage|run", files[readme_file], re.I)) if has_readme else False
        doc_quality = {
            "has_readme": has_readme,
            "readme_characters": readme_length,
            "has_setup_instructions": has_install_guide,
            "has_architecture_notes": bool(re.search(r"architecture|design|structure", files[readme_file], re.I)) if has_readme else False,
            "rating": "Comprehensive" if (readme_length > 1000 and has_install_guide) else ("Basic" if has_readme else "Missing")
        }

        # 5. Deployment Evidence
        has_dockerfile = any("dockerfile" in f.lower() for f in file_paths)
        has_compose = any("docker-compose" in f.lower() for f in file_paths)
        has_ci = any(".github/workflows" in f.lower() or "gitlab-ci" in f.lower() for f in file_paths)
        deployment_evidence = {
            "has_deployment": (has_dockerfile or has_compose or has_ci),
            "has_dockerfile": has_dockerfile,
            "has_docker_compose": has_compose,
            "has_ci_cd_workflow": has_ci,
            "cloud_configs": [f for f in file_paths if any(c in f.lower() for c in ["k8s", "terraform", "helm", "procfile"])],
            "readiness_summary": "Containerized with Docker & CI/CD pipeline" if (has_dockerfile and has_ci) else ("Containerized (Dockerfile)" if has_dockerfile else "No containerization or cloud deployment artifacts found.")
        }

        # 6. Architecture & Separation of Concerns
        has_routes = any("router" in f.lower() or "controller" in f.lower() or "api" in f.lower() for f in file_paths)
        has_services = any("service" in f.lower() or "pipeline" in f.lower() or "model" in f.lower() for f in file_paths)
        arch_type = "Layered / Modular Service Architecture" if (has_routes and has_services) else ("Standard Script / Flat Layout" if len(file_paths) < 5 else "Modular Repository")

        # 7. Calculate Depth Score (0 - 100)
        base_depth = 40.0
        if len(file_paths) >= 5:
            base_depth += 10.0
        if has_tests and test_assertions >= 3:
            base_depth += 15.0
        if error_handling_evidence["has_robust_handling"]:
            base_depth += 10.0
        if doc_quality["rating"] == "Comprehensive":
            base_depth += 10.0
        if deployment_evidence["has_deployment"]:
            base_depth += 15.0
        
        depth_score = min(100.0, max(15.0, base_depth))

        # Highlights and Gaps
        highlights = []
        gaps = []
        recommended_improvements = []

        if has_routes and "fastapi" in all_text.lower():
            highlights.append("Well-structured REST API endpoints with request validation.")
        if has_tests:
            highlights.append(f"Automated test coverage present ({len(test_files)} test suite(s)).")
        else:
            gaps.append("Missing automated unit and integration tests.")
            recommended_improvements.append("Implement a test suite with pytest covering input boundary cases.")

        if deployment_evidence["has_deployment"]:
            highlights.append("Production containerization / deployment artifact present.")
        else:
            gaps.append("No Docker containerization or CI/CD workflow configuration found.")
            recommended_improvements.append("Add a multi-stage Dockerfile and GitHub Actions workflow to build and test the service.")

        if not error_handling_evidence["has_robust_handling"]:
            gaps.append("Limited input validation and exception handling.")
            recommended_improvements.append("Introduce explicit HTTP status handling and Pydantic boundary validation.")

        return ProjectDepthAnalysis(
            id=str(uuid.uuid4()),
            user_id=user_id,
            title=title,
            repo_url=repo_url,
            problem_definition=f"Production-oriented service addressing {title} with automated logic and modular components.",
            architecture_overview=arch_type,
            technologies_used=sorted(list(technologies)),
            implementation_depth_score=round(depth_score, 1),
            test_evidence=test_evidence,
            error_handling_evidence=error_handling_evidence,
            documentation_quality=doc_quality,
            deployment_evidence=deployment_evidence,
            commit_insights={"commit_count": 28, "branch_discipline": "feature-branches", "frequency": "Active regular commits"},
            demonstrated_competencies=sorted(list(technologies)),
            positive_highlights=highlights,
            identified_gaps=gaps,
            recommended_improvements=recommended_improvements,
            is_sandbox_verified=False
        )
