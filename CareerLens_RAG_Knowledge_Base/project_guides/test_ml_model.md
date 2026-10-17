# Project Guide: Evaluate an ML Model Properly

## Goal
Build a reproducible ML experiment and explain whether the model is useful for the stated task.

## Minimum milestones
1. Define the prediction target and intended use.
2. Inspect the dataset, label distribution, missing values, and possible leakage.
3. Split data appropriately before fitting preprocessing steps.
4. Establish a simple baseline.
5. Train a suitable model and compare it with the baseline.
6. Select task-appropriate metrics and inspect errors.
7. Document limitations, reproducibility steps, and responsible-use concerns.

## Deliverables
- Notebook or scripts
- Dataset description and data-quality notes
- Baseline comparison table
- Evaluation report
- Instructions to reproduce the experiment

## Verification questions
- Why is the chosen metric appropriate?
- What would data leakage look like here?
- How was the test set kept separate?
- Which error types matter most for this use case?
- What can the model not reliably do?

## Related skills
Python, pandas, scikit-learn, statistics, experiment design, documentation.
