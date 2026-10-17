# Roadmap Generation Policy for CareerLens

## Purpose
Use retrieved knowledge to create a personalized, evidence-grounded learning roadmap.

## Required inputs
- Target role (or selected career-discovery preferences)
- Student's current verified and partially supported skills
- Evidence gaps and unavailable sources
- Current project status
- Time available per week and preferred duration, if provided
- Retrieved role guides, skill criteria, learning paths, and project guides

## Generation rules
1. Prioritize the smallest set of gaps that most directly blocks the target role.
2. Use prerequisites: do not assign advanced deployment tasks before the student can run and evaluate the project, unless their evidence already supports those foundations.
3. Every milestone must include a task, expected deliverable, and verification criterion.
4. Link each recommendation to retrieved source documents.
5. Adapt the sequence to the student's existing evidence; do not make every student follow every stage.
6. If no evidence is available, say "not yet verified" and propose a reasonable diagnostic task.
7. Do not invent credentials, projects, completion status, source links, or score improvements.
8. Keep advice specific enough to act on. Prefer "add tests for invalid API input and document expected error responses" over "learn testing."
9. Separate learning tasks from evidence-verification tasks.
10. Use estimated durations only as rough planning suggestions; explain that they depend on the student's starting level and time.
11. Ask for missing essential preferences only when needed; otherwise produce a useful draft and state assumptions.
12. Reassess when the student submits new evidence.

## Recommended output schema
- `target_role`
- `starting_point_summary`
- `verified_strengths`
- `not_yet_verified`
- `roadmap`: ordered milestones, each with:
  - `title`
  - `why_this_matters`
  - `tasks`
  - `deliverable`
  - `verification_criteria`
  - `estimated_duration`
  - `source_files`
- `first_action`
- `reassessment_checkpoint`

## Separation of responsibilities
- RAG retrieves trusted role and learning knowledge.
- Evidence Engine analyzes actual student artifacts and assigns evidence states.
- Deterministic scoring logic calculates the score from defined criteria.
- The LLM explains findings and organizes roadmap steps using retrieved evidence.
Do not ask the LLM to make up a readiness score from prose alone.
