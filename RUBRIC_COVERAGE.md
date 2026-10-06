# Rubric coverage

This is an evidence map, not an awarded score. The original rubric is unchanged.

| Area | Available evidence | Remaining limitation |
| --- | --- | --- |
| API contract and analysis (20) | API_CONTRACT.md: all endpoints, payloads, success/error statuses, assumptions, and 400/404/409 reasoning | Instructor assessment required |
| Data design and business rules (20) | SCHEMA.md ERD; schema.sql; seeded D1 migration; create/update triggers; shared UTC validation; Node/local D1 tests; 20 live API cases | Local and remote database states are separate |
| Implementation and security (25) | src/app.ts; CRUD; bound SQL; JSON errors; failed-write checks; successful build | No authentication is implemented because the brief does not require it |
| Testing and evidence (15) | 41 Node HTTP cases; 22 local Worker cases; student manual CRUD/error/time-changing PATCH output; 20 live HTTPS cases with complete requests/responses and cleanup | Final live checks were run by Codex at the student's explicit request and are labeled accordingly |
| Quality Gate improvement (10) | snapshots/initial; INITIAL_REVIEW.md; QUALITY_GATE_REVIEW.md with observed before/after changes and mapping to all eight areas of the newly supplied quality_gate.md | First version is untimed, not an instructor minute-30 checkpoint; student understanding remains to be confirmed |
| AI responsibility / You Own It (10) | AI_LOG.md transparency; labeled AI-assisted explanations; student-run test evidence | Student must record actual code inspection and demonstrate independent understanding |
