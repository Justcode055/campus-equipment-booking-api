# Rubric coverage

This is an evidence map, not an awarded score. The original rubric is unchanged.

| Area | Available evidence | Remaining limitation |
| --- | --- | --- |
| API contract and analysis (20) | API_CONTRACT.md: all endpoints, payloads, success/error statuses, assumptions, and 400/404/409 reasoning | Instructor assessment required |
| Data design and business rules (20) | SCHEMA.md ERD; schema.sql; seeded D1 migration; create/update triggers; shared UTC validation; Node and local D1 tests | Remote D1 deployment and verification not yet recorded |
| Implementation and security (25) | src/app.ts; CRUD; bound SQL; JSON errors; failed-write checks; successful build | No authentication is implemented because the brief does not require it |
| Testing and evidence (15) | HTTP_TEST_RESULTS.md: 41 sequential HTTP cases and database checks; CURL_SMOKE.md; student terminal outputs show independent CRUD/error checks and a suite PASS | Exact instructor-guide time-changing PATCH sequence remains optional additional evidence |
| Quality Gate improvement (10) | snapshots/initial; INITIAL_REVIEW.md; QUALITY_GATE_REVIEW.md with observed before/after changes and mapping to all eight areas of the newly supplied quality_gate.md | First version is untimed, not an instructor minute-30 checkpoint; student understanding remains to be confirmed |
| AI responsibility / You Own It (10) | AI_LOG.md transparency; labeled AI-assisted explanations; student-run test evidence | Student must record actual code inspection and demonstrate independent understanding |
