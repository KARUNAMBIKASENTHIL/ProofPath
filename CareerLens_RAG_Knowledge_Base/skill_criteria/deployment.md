# Skill Criteria: Deployment

## Evidence signals
- Clear instructions to run the application
- Configuration and secrets are handled safely
- Dependencies and runtime requirements are documented
- Health checks, logs, or basic monitoring are considered
- Deployment environment and known limitations are described
- A deployed URL or reproducible container/build process exists

## Evidence levels
- Not yet verified: no deployment or reproducible delivery evidence found
- Partial: local run instructions exist but are incomplete
- Supported: deployment works and is documented
- Strongly supported: repeatable deployment, safe configuration, tests, and basic operational checks

## Safety
Never execute arbitrary repository code on the main application server. Use a restricted sandbox for code execution.
