# Learning Path: Machine Learning

## Intended outcome
A learner can prepare a dataset, train and evaluate a model responsibly, explain the results, and package a small reproducible ML project.

## Stage 1 — Foundations
Topics: Python, functions, collections, files, virtual environments, Git.
Practice: write small scripts and use Git commits.
Exit evidence: a small repository with a README and runnable code.

## Stage 2 — Data preparation
Topics: pandas, missing values, duplicates, outliers, categorical encoding, scaling, train/test split.
Practice: create a data-cleaning notebook and document each decision.
Exit evidence: reproducible preprocessing steps and a short data-quality report.

## Stage 3 — Core ML
Topics: supervised vs unsupervised learning, regression, classification, overfitting, underfitting, cross-validation, baselines.
Practice: compare a simple baseline with one or two suitable models.
Exit evidence: clear experiment table and reasoned model choice.

## Stage 4 — Evaluation
Topics: confusion matrix, precision, recall, F1, ROC-AUC where appropriate, MAE/RMSE for regression, class imbalance, leakage.
Practice: select metrics based on the problem and explain trade-offs.
Exit evidence: evaluation report with limitations and a held-out test set.

## Stage 5 — Reproducible project
Topics: project structure, dependency file, random seeds where applicable, tests, documentation.
Practice: separate training and prediction code.
Exit evidence: another person can follow the README to reproduce the workflow.

## Stage 6 — Serving and deployment
Topics: FastAPI, input schemas, error handling, model serialization, Docker basics.
Practice: expose a prediction endpoint and test valid/invalid inputs.
Exit evidence: API examples, tests, and repeatable run/deployment instructions.

## Stage 7 — Portfolio quality
Topics: problem framing, ethical/data limitations, monitoring concepts, communicating results.
Practice: add architecture diagram, limitations, and future-work section.
Exit evidence: portfolio-ready project with honest claims.

## Personalization rules
- If Python evidence is weak, start at Stage 1.
- If a model exists but evaluation is weak, prioritize Stage 4 before another model project.
- If a notebook is complete but cannot be run by others, prioritize Stage 5.
- If model training and evaluation are strong but no serving evidence exists, prioritize Stage 6.
- Do not mark a stage complete based only on a resume keyword.
