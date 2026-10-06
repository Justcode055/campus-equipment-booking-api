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
| Execution Value / Course Context | The Node/local-file SQLite entry point alone did not provide a Cloudflare Worker deployment for the later link-submission request. | Added a Workers/D1 adapter, shared validation, seeded migration, Wrangler configuration, and deployment guide. The student deployed it; Codex verified the live API at the student's explicit request. | Node build/suite, Worker type check, 22 local D1 cases and competing creates, deploy dry run, and 20 live HTTPS cases pass. |

Verification performed by Codex: TypeScript build, HTTP suite, separate SQLite connection checks, and compiled-server cURL smoke test. Results are recorded in evidence files; no instructor assessment or student verification is implied.

## Review against the supplied Quality Gate

Student-run verification is separately documented in AI_LOG.md and evidence/student-verification-terminal-1.txt and evidence/student-verification-terminal-2.txt. The table below maps available evidence; it does not mark personal-understanding checks on the student's behalf.

| Quality Gate area | Evidence and outcome | Remaining student action |
| --- | --- | --- |
| Purpose | Contract, equipment list, booking CRUD, validation, and submission documents match the stated task. No frontend was added. | Confirm submission packaging and any course-specific requirements. |
| Reliability | HTTP tests cover overlap prevention on create/update, invalid equipment, failed writes, and persistence. Student outputs show CRUD, validation, and restart checks. | Review the relevant results and understand the database triggers. |
| Course Context | TypeScript/Hono with local SQLite follows the stack offered in the brief. AI assistance and student-run checks are disclosed. | Confirm any instructor-specific stack restriction; identify the important files and commands yourself. |
| Reasoning | Contract and AI-assisted explanations describe statuses, overlap boundaries, PATCH, and assumptions. The student reports completing code review. | Prepare to explain these choices in instructor follow-up questions; no oral assessment has occurred here. |
| Execution Value | Student local checks pass. Codex also ran 20 live HTTPS cases covering successful CRUD and error behavior; all passed. | None for API verification. |
| Accuracy | Correct fields appear in the student's full responses; invalid intervals return 400; missing bookings return 404; conflicts return 409. Source uses bound SQL parameters and JSON errors. | Read validation and bound queries to explain how they work. |
| Delivery Quality | Source, README, contract, ERD/schema, lockfile, initial snapshot, AI log, review, and local/live evidence are included. GitHub reports the source repository is public. No browser client requires CORS. | Submit the source and API links. |
| You Own It | AI assistance is transparent; student-run tests and corrected command mistakes are documented. The student reports completing code review, and AI-assisted explanations are recorded in AI_LOG.md. | Be ready to explain the submission to the instructor; no oral assessment is claimed here. |

Additional student evidence: evidence/quality-gate-terminal-1.txt and evidence/quality-gate-terminal-2.txt show the local API startup and the instructor guide's additional manual sequence. Observed statuses are 201 create, 200 time-changing PATCH/read, 400 reversed range, 409 contained overlap, 204 delete, and 404 after deletion. The student reports completing code review; AI_LOG.md records simple explanations with AI assistance disclosed.

Live deployment update: README.md now records the configured GitHub repository URL and `https://campus-equipment-api.6731503055.workers.dev/api`. Student-supplied live equipment/bookings requests returned 200; equipment JSON contains both seed records and the complete bookings response is `[]`. See evidence/CLOUDFLARE_LIVE_READ_CHECKS.md.

## Final live verification

At the student's explicit request, Codex ran `npm.cmd run test:live` against `https://campus-equipment-api.6731503055.workers.dev/api` on 2026-10-06. All **20 HTTPS cases passed**. Evidence: [CLOUDFLARE_LIVE_TEST_RESULTS.md](evidence/CLOUDFLARE_LIVE_TEST_RESULTS.md).

The checks cover equipment and booking lists; create/read; adjacent booking acceptance; successful time-changing and purpose-only updates; overlapping create and update rejection; unchanged data after a rejected update; reversed times; unknown equipment; impossible dates; missing fields; missing GET/PATCH; different equipment at the same time; delete; and GET after deletion. Assertions verify statuses, JSON errors, booking values, and Location headers. All bookings created by this run were removed afterward. Existing bookings were not changed.

This final live run was performed by Codex, not by the student. It supplements the student's recorded local tests and live GET checks. GitHub reports the repository `https://github.com/Justcode055/campus-equipment-booking-api` is public with default branch main.

Submission decision: **READY for submission**, based on passing local/live checks, complete deliverables and evidence, public source and live API links, and the student's report of completed code review. Instructor follow-up questions may still assess independent understanding. The initial untimed-checkpoint disclosure remains unchanged. The final review and evidence are included in the accompanying GitHub update.
