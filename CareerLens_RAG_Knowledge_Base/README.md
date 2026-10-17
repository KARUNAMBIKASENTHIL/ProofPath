# CareerLens RAG Knowledge Base

This folder contains starter knowledge documents for generating personalized career roadmaps.
Upload the Markdown files to your RAG ingestion pipeline, or ingest the entire folder recursively.

## Suggested ingestion flow
1. Read each `.md` file.
2. Split by headings/sections rather than arbitrary fixed-length chunks where possible.
3. Store each chunk with metadata: `source_file`, `category`, `role`, `skill`, and `source_urls`.
4. Embed chunks and store them in your vector database.
5. When generating a roadmap, retrieve chunks relevant to the student's target role, evidence gaps, current level, and available time.
6. Generate a roadmap with milestones, tasks, deliverables, and verification criteria.

## Important design rule
These documents are reference knowledge, not proof that a student has a skill. The Evidence Engine must assess student evidence separately. If evidence is missing, label it **Not yet verified**, not **No skill**.

## Starter role coverage
- Machine Learning Engineer
- Java Backend Developer
- Data Analyst

## Recommended roadmap output fields
- Target role
- Current verified strengths
- Skills not yet verified / gaps
- Priority and reason
- Milestone
- Weekly tasks
- Expected deliverable
- Evidence needed to mark the skill as demonstrated
- Reference sources
- Suggested next assessment date

This is a starter set. Review and update the role requirements and links for your region, institution, and target companies.
