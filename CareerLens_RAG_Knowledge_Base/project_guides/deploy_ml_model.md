# Project Guide: Serve and Deploy an ML Model

## Goal
Make an evaluated model usable through a small, validated API or demo.

## Minimum milestones
1. Separate inference code from notebook-only code.
2. Save/load the model with documented versions and assumptions.
3. Create an API endpoint with a defined input schema.
4. Validate inputs and return clear errors.
5. Add tests for valid and invalid inputs.
6. Document dependencies and safe configuration.
7. Deploy or provide a reproducible container-based setup.
8. Document latency, limitations, and how the model could be monitored.

## Deliverables
- Inference module
- API implementation
- Tests
- Dependency/configuration files
- README with sample requests
- Deployment notes and limitations

## Verification questions
- How do you handle missing or incorrectly typed input?
- How do you ensure training and inference preprocessing match?
- How would you detect changed input data or model quality?
- Which configuration values must not be committed?

## Related skills
Python, model evaluation, FastAPI, testing, Docker, deployment.
