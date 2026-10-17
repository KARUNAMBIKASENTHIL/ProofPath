# Role Guide: Machine Learning Engineer

## Role purpose
Build, evaluate, package, deploy, and monitor machine-learning systems. Requirements vary by company and seniority; use this as a starter profile, not a universal hiring standard.

## Competency areas
1. Python programming and code organization
2. Data preparation and exploratory analysis
3. Statistics and machine-learning fundamentals
4. Model training, validation, and evaluation
5. Experiment reproducibility and leakage prevention
6. APIs and model serving
7. Testing, version control, and documentation
8. Deployment and basic monitoring

## Example evidence
- A readable repository with a clear README and reproducible environment
- Data-cleaning code and a documented train/validation/test strategy
- Baseline model compared with a justified alternative
- Suitable metrics explained in context; no reliance on accuracy alone when inappropriate
- Tests for data or prediction behavior
- A model exposed through an API or demo, with input validation and error handling
- Deployment instructions and limitations documented

## Common gaps to investigate
- Project has only a notebook and no reproducible setup
- Train/test leakage or no held-out evaluation
- Metrics are reported without explaining why they fit the problem
- No baseline or comparison
- No tests, API, deployment, or limitations
- Project contribution cannot be explained by the student

## Suggested milestones
1. Python + Git foundation
2. Data analysis and data-quality checks
3. Train a baseline model and evaluate it properly
4. Improve the model and document experiments
5. Package inference code and add tests
6. Build an API or demo
7. Deploy and document monitoring/limitations

## Reference sources
- Python tutorial: https://docs.python.org/3/tutorial/
- pandas getting started: https://pandas.pydata.org/docs/getting_started/index.html
- scikit-learn user guide: https://scikit-learn.org/stable/user_guide.html
- scikit-learn model evaluation: https://scikit-learn.org/stable/modules/model_evaluation.html
- FastAPI tutorial: https://fastapi.tiangolo.com/tutorial/
- Docker getting started: https://docs.docker.com/get-started/
