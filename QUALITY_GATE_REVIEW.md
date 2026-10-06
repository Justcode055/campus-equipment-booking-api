# Quality Gate review

The instructor's `quality_gate.md` was initially absent. The student later supplied it with `curl_test_guide_1.md`. Codex has compared the submission against these files; the eight-area review below supplements the original findings. It does not claim the student completed an instructor-timed review or independently explained the code.

## Initial checkpoint

First implementation saved at **2026-10-06 13:34:26 +07:00 (Asia/Bangkok)** in `snapshots/initial/`, before the fixes below. This is a saved first version, not a claim that the instructor's minute-30 checkpoint was completed. Initial probes were run against the preserved code using real HTTP at `http://localhost:8789/api`; actual results are in `evidence/INITIAL_REVIEW.md`. Reproduce with `npm.cmd run review:initial` (port 8789 must be free).

## Findings → fixes → evidence

| Category | What was found | How it was fixed | Evidence |
| --- | --- | --- | --- |
| Reliability/Accuracy | PATCH moved an adjacent booking into an existing interval and returned 200. | Added UPDATE overlap trigger using the merged booking values and excluding OLD.id. Trigger errors map to JSON 409. | Initial review shows 200; final HTTP tests show 409 for overlapping PATCH and equipment-change conflict, 200 for a purpose-only PATCH, and an unchanged row after failed PATCH. |
| Reliability/Accuracy | Date.parse normalized February 30 to March 2 and POST returned 201. | Require UTC ISO format and exact round-trip agreement with the canonical timestamp before storage. | Initial review records rollover; final impossible-date test returns 400, while second-precision valid dates normalize to milliseconds. |
| Implementation/security | Initial POST checked overlap separately; a direct competing SQL write could bypass that application check. | Moved enforcement into INSERT and UPDATE triggers within each write. Request values remain bound parameters. | Initial direct SQL probe was accepted; final second-connection INSERT and UPDATE both throw booking_overlap. Concurrent HTTP creates yield exactly one 201 and one 409. This verifies enforcement; the initial probe itself is not a reproduction of simultaneous cross-process writes. |
| Reasoning/You Own It | AI-generated code alone does not demonstrate student understanding; PATCH semantics, status decisions, and boundary behavior needed explicit explanations. | Documented assumptions, overlap formula, date normalization, binding, and PATCH behavior in contract/schema/README. Disclosed AI authorship and separated agent verification from student verification. | README explanation questions and AI_LOG.md; test cases demonstrate the explained boundaries. Student independent explanation remains unverified and must be completed by the student. |
| Run reliability | tsx could not run in this sandbox because os.userInfo failed. | Used Node 24's native TypeScript execution and compiler extension rewriting; removed the unused tsx dependency. | npm test and npm run build pass; compiled npm start checked with cURL. |
| Execution Value / Course Context | The Node/local-file SQLite entry point alone did not provide a Cloudflare Worker deployment for the later link-submission request. | Added a Workers/D1 adapter, shared validation, seeded migration, Wrangler configuration, and deployment guide. | Node build and suite still pass; Worker type check, 22 local D1 HTTP cases and competing creates, plus deploy dry run pass. Actual account setup and remote verification remain for the student. |

Verification performed by Codex: TypeScript build, HTTP suite, separate SQLite connection checks, and compiled-server cURL smoke test. Results are recorded in evidence files; no instructor assessment or student verification is implied.

## Review against the supplied Quality Gate

Student-run verification is separately documented in AI_LOG.md and evidence/student-verification-terminal-1.txt and evidence/student-verification-terminal-2.txt. The table below maps available evidence; it does not mark personal-understanding checks on the student's behalf.

| Quality Gate area | Evidence and outcome | Remaining student action |
| --- | --- | --- |
| Purpose | Contract, equipment list, booking CRUD, validation, and submission documents match the stated task. No frontend was added. | Confirm submission packaging and any course-specific requirements. |
| Reliability | HTTP tests cover overlap prevention on create/update, invalid equipment, failed writes, and persistence. Student outputs show CRUD, validation, and restart checks. | Review the relevant results and understand the database triggers. |
| Course Context | TypeScript/Hono with local SQLite follows the stack offered in the brief. AI assistance and student-run checks are disclosed. | Confirm any instructor-specific stack restriction; identify the important files and commands yourself. |
| Reasoning | Contract and AI-assisted explanations describe statuses, overlap boundaries, PATCH, and assumptions. The student reports completing code review. | Prepare to explain these choices in instructor follow-up questions; no oral assessment has occurred here. |
| Execution Value | Student output shows a successful build, server startup, required CRUD, and a passing automated suite. The additional Quality Gate output records a successful time-changing PATCH, reversed interval, contained overlap, and deletion sequence. | Record remote API checks when deployed. |
| Accuracy | Correct fields appear in the student's full responses; invalid intervals return 400; missing bookings return 404; conflicts return 409. Source uses bound SQL parameters and JSON errors. | Read validation and bound queries to explain how they work. |
| Delivery Quality | README, contract, ERD, source, lockfile, initial snapshot, AI log, and more than five HTTP cases are present. No browser client requires CORS. | Check the final submission archive or folder includes all required files. |
| You Own It | AI assistance is transparent; student-run tests and corrected command mistakes are documented. The student reports completing code review, and AI-assisted explanations are recorded in AI_LOG.md. | Be ready to explain the submission to the instructor; no oral assessment is claimed here. |

Additional student evidence: evidence/quality-gate-terminal-1.txt and evidence/quality-gate-terminal-2.txt show the local API startup and the instructor guide's additional manual sequence. Observed statuses are 201 create, 200 time-changing PATCH/read, 400 reversed range, 409 contained overlap, 204 delete, and 404 after deletion. The student reports completing code review; AI_LOG.md records simple explanations with AI assistance disclosed.

Submission decision: the local API and recorded verification are complete. GitHub and live Cloudflare submission links and remote API verification remain pending; the full link-based submission is not marked READY yet. The initial untimed-checkpoint disclosure remains unchanged.
