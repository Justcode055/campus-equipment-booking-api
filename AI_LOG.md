# AI use log

Date: 2026-10-06 (Asia/Bangkok).

## Important prompt

User: “read exam_brief_en mark down file and do the rubric_en markdown file by following the instructions.”

Codex read both supplied files and interpreted this as an instruction to produce the practical submission matching the rubric. No starter repository or supplementary Quality Gate checklist was present.

Later prompts: the student supplied `quality_gate.md` and `curl_test_guide_1.md`, asked Codex to check them, and requested step-by-step guidance. Codex read them, compared the existing implementation and evidence, updated README.md, QUALITY_GATE_REVIEW.md and RUBRIC_COVERAGE.md to reflect their availability, and mapped evidence to all eight Quality Gate areas. It provided PowerShell guidance for extra manual tests and ownership review. The student subsequently supplied outputs confirming the additional local create, time-changing PATCH, reversed-time, contained-overlap, delete, and not-found tests described below.

Latest prompt: the student stated, “I have already done the code reviews,” asked Codex to check quality_gate.md and fill the necessary answers in AI_LOG.md in simple language, and provided terminal outputs. Codex records the review as student-reported and supplies the wording below with AI assistance disclosed. No oral ownership assessment was performed.

Deployment prompt: the student asked how to push the source to GitHub and deploy the API to Cloudflare to submit links. Codex used the Cloudflare, Wrangler, and Workers best-practices skills plus official documentation. It prepared `src/worker.ts`, shared `src/validation.ts`, a seeded D1 migration, Wrangler configuration, generated Worker types, a local Worker HTTP test, and DEPLOYMENT_GUIDE.md. The original Node entry point remains available. Codex verified the Node build and 41-case suite, Worker type check, local D1 migration, 22 Worker HTTP cases plus competing creates, and a deployment dry run. These new checks are agent-run. No GitHub push, cloud database creation, or remote deployment was performed by Codex; the student will perform the account steps. The existing student terminal evidence refers to the earlier Node verification, not remote D1 verification.

Deployment update: the student supplied complete live responses from `https://campus-equipment-api.6731503055.workers.dev/api`. Equipment returned 200 and both expected seed records at 15:30:38 Bangkok time; bookings returned 200 with body `[]` at 15:30:45, confirming an empty live booking collection. The bookings body was provided in a follow-up paste. Codex saved this evidence in evidence/CLOUDFLARE_LIVE_READ_CHECKS.md. The configured Git remote is `https://github.com/Justcode055/campus-equipment-booking-api.git` and wrangler.jsonc now contains a real D1 database ID. Codex has not checked repository access or performed the remote deployment itself. Remote write/error verification is not yet supplied.

## Contributions used

- AI designed the API contract, assumptions, ERD, and schema before implementation.
- AI authored TypeScript/Hono handlers, SQLite schema and triggers, run configuration, dependency lockfile, HTTP tests, manual cURL guide, and submission documentation.
- AI saved an initial version, ran probes showing deficiencies, then implemented the fixes recorded in QUALITY_GATE_REVIEW.md.
- AI consulted official Hono Node adapter and Node SQLite documentation. Third-party documentation was used for API reference; no other student's code or answers were used.
- No subagents were used. No prompts to other students or messages to outside people were sent.
- After the student's manual verification, AI read the original transcript and the student's subsequently supplied full outputs from both terminals, saved the supplemental outputs under `evidence/`, and summarized the results in this log at the student's request. This summary is AI-assisted; it does not supply the student's independent ownership explanations.
- At the student's request, AI also supplied the simple code walkthrough and explanations below after reading the source. These are study notes for the student to review, not evidence that the student has independently inspected or explained the code.

## Checks actually performed by the AI agent

- Executed initial HTTP and SQL regression probes; actual failures are preserved in evidence/INITIAL_REVIEW.md.
- Compiled TypeScript with npm run build.
- Used Node fetch as an HTTP client against a live local Hono server; 41 sequential cases passed plus concurrent requests and database checks. Actual requests, statuses, headers and bodies are in evidence/HTTP_TEST_RESULTS.md.
- Checked persisted data and INSERT/UPDATE conflict enforcement through a separate SQLite connection.
- Started the compiled server and checked equipment, creation, conflict, and deletion using cURL; results in evidence/CURL_SMOKE.md.
- npm install reported zero dependency vulnerabilities at installation time.

These are **agent-run checks**, not a claim that the student verified the output themselves. The initial snapshot is untimed; there is no evidence of an instructor-supervised minute-30 checkpoint.

## Student verification / ownership

The student ran the manual commands recorded below. Full supplemental terminal outputs show HTTP statuses, response bodies, build output, server restart, and a passing automated suite. The student also reports completing the code reviews and supplied a second local Quality Gate verification run. The explanations below were written with AI assistance, based on the source and recorded results; they are not presented as an independently assessed oral answer.


Student verification transcript: 2026-10-06, 13:47:15–14:11:29 (Asia/Bangkok).
Base API URL: http://localhost:8786/api
Evidence: evidence/student-verification-20261006-134715.txt

Supplemental evidence supplied by the student:

- [Terminal 1: build, server startup, and restart](evidence/student-verification-terminal-1.txt).
- [Terminal 2: complete HTTP requests/responses and automated-test output](evidence/student-verification-terminal-2.txt).

Commands I personally ran (supported by the student's supplied terminal outputs; the list below uses the corrected booking ID):
- npm.cmd run build
- New-Item -ItemType Directory -Force data | Out-Null

- $env:PORT = '8786'
- $env:DB_PATH = "data/student-verification-$(Get-Date -Format yyyyMMdd-HHmmss).sqlite"
- npm.cmd start

- New-Item -ItemType Directory -Force evidence | Out-Null
- Start-Transcript -Path "evidence/student-verification-$(Get-Date -Format yyyyMMdd-HHmmss).txt"

- $base = 'http://localhost:8786/api'
- curl.exe -i "$base/equipment"
- curl.exe -i "$base/bookings"

- $payload = Get-Content examples/booking.json -Raw | ConvertFrom-Json
- $payload.borrowerName = 'Hein Zaw'
- $payload | ConvertTo-Json | Set-Content examples/student-booking.json -Encoding utf8

- curl.exe -i -X POST "$base/bookings" -H 'Content-Type: application/json' --data-binary '@examples/student-booking.json'

- $bookingId = "725d64ee-ee37-438c-9b4a-c06d0bba9359"

- curl.exe -i "$base/bookings/$bookingId"
- curl.exe -i "$base/bookings"

- curl.exe -i -X PATCH "$base/bookings/$bookingId" -H 'Content-Type: application/json' --data-binary '@examples/patch.json'

- curl.exe -i "$base/bookings/$bookingId"

- curl.exe -i -X POST "$base/bookings" -H 'Content-Type: application/json' --data-binary '@examples/student-booking.json'

- $invalid = Get-Content examples/student-booking.json -Raw | ConvertFrom-Json
- $invalid.equipmentId = 'eq-missing'
- $invalid | ConvertTo-Json | Set-Content examples/student-invalid.json -Encoding utf8

- curl.exe -i -X POST "$base/bookings" -H 'Content-Type: application/json' --data-binary '@examples/student-invalid.json'

- $invalid.equipmentId = 'eq-1'
- $invalid.startAt = $invalid.endAt
- $invalid | ConvertTo-Json | Set-Content examples/student-invalid.json -Encoding utf8

- curl.exe -i -X POST "$base/bookings" -H 'Content-Type: application/json' --data-binary '@examples/student-invalid.json'
- npm.cmd start
- curl.exe -i "$base/bookings/$bookingId"

- curl.exe -i -X DELETE "$base/bookings/$bookingId"
- curl.exe -i "$base/bookings/$bookingId"

- npm.cmd test 

Results recorded in the supplied terminal outputs (AI-assisted evidence summary):

- Build/start: terminal 1 shows `npm.cmd run build` running `tsc` and returning to the prompt without errors. `npm.cmd start` then runs `node dist/server.js` and prints `Campus Equipment Booking API: http://localhost:8786/api`. The SQLite experimental warning did not prevent startup.
- List equipment: recorded **HTTP 200 OK**, JSON content type, and both seed records: `eq-1` / Projector A / Building 1 and `eq-2` / Camera B / Media Lab.
- Initial booking list: **HTTP 200 OK**, body `[]`.
- Create booking: **HTTP 201 Created**, with `Location: /api/bookings/725d64ee-ee37-438c-9b4a-c06d0bba9359`. The full JSON contains that ID, equipmentId `eq-1`, borrowerName `Hein Zaw`, startAt `2026-10-20T09:00:00.000Z`, endAt `2026-10-20T11:00:00.000Z`, and purpose `Class presentation`.
- Read: GET the correct booking ID and GET the booking list both return **HTTP 200 OK** with the created record.
- Update: PATCH using `examples/patch.json` returns **HTTP 200 OK** and changes purpose to `Updated presentation`. A subsequent GET returns **HTTP 200 OK** with the updated purpose. ID, equipmentId, borrowerName, startAt, and endAt are unchanged in the full responses.
- Duplicate booking: the repeated POST returns **HTTP 409 Conflict**, with `{"error":"Booking time conflicts with an existing booking"}`.
- Unknown equipment: after setting equipmentId to `eq-missing`, POST returns **HTTP 400 Bad Request**, with `{"error":"equipmentId does not exist"}`.
- Equal times: after restoring equipmentId to `eq-1` and setting startAt equal to endAt, POST returns **HTTP 400 Bad Request**, with `{"error":"startAt must be before endAt"}`.
- Restart/persistence: terminal 1 records stopping the server and starting it again in the same terminal without changing DB_PATH. Following the student's reported restart sequence, terminal 2 records a later GET at 14:05:13 Bangkok time returning **HTTP 200 OK** with the same booking ID and `Updated presentation`. Together, the supplied outputs support the student's persistence check. The terminal 1 restart itself is not timestamped.
- Delete and read afterward: DELETE returns **HTTP 204 No Content** with an empty response body. The following GET returns **HTTP 404 Not Found**, with `{"error":"Booking not found"}`.
- Automated tests: the student's `npm.cmd test` runs `node tests/http.test.ts` and prints **`PASS: 41 HTTP cases, concurrent requests, persistence and database constraints.`** The SQLite warning is present, but the suite completes successfully.
- Recording completed: `Stop-Transcript` and the transcript end time are recorded.

## Additional student Quality Gate verification

Date: 2026-10-06. Transcript filename records a start at 14:58:44 Bangkok time; HTTP headers record requests from 14:59:40 through 15:03:38. Stop-Transcript is recorded, without a timestamp in the supplied paste.

Base API URL: `http://localhost:8786/api` (Node/local SQLite, not the deployed Cloudflare API).

Evidence: [server setup](evidence/quality-gate-terminal-1.txt), [complete manual test output](evidence/quality-gate-terminal-2.txt), the original `evidence/gate-20261006-145844-transcript.txt`, and its saved create/update/read/invalid/conflict/delete/missing response files. Codex confirmed those files are present.

| Check personally run by the student | Observed result |
| --- | --- |
| Start the API using a fresh quality-gate SQLite file | Server started on port 8786; SQLite experimental warning did not prevent startup. |
| POST a booking for Hein Zaw, eq-1, 09:00–11:00 | 201, generated ID `7e7c80c8-fef2-46de-9652-c901466891ef`, matching Location header and complete JSON fields. |
| PATCH that booking to 12:00–14:00 | 200; ID unchanged; times changed; purpose became `Updated class presentation`. |
| GET the updated booking | 200 with the same updated values. |
| POST a reversed interval, 11:00–09:00 on October 21 | 400 and `{"error":"startAt must be before endAt"}`. |
| POST another eq-1 booking at 12:30–13:30 | 409 and `{"error":"Booking time conflicts with an existing booking"}`. |
| DELETE the original booking | 204 with an empty response body. |
| GET the deleted booking | 404 and `{"error":"Booking not found"}`. |

The student extracted the new booking ID from the saved JSON response using ConvertFrom-Json, avoiding the earlier ID-entry mistakes. These additional checks match the instructor cURL guide's successful time update, invalid range, contained overlap, and deletion sequence.

## Code inspection summary (student-reported review; AI-assisted wording)

- `src/server.ts`: starts the HTTP server. It reads PORT and DB_PATH from the environment, so the verification server can use its own port and database file. It closes the server and database when the process receives a stop signal.
- `src/app.ts` — `createApp()`: opens SQLite, loads the schema, and adds two equipment records if they are missing. It then defines the API routes.
- `src/validation.ts` — `validateBooking()`: checks allowed fields, missing/empty text, lengths, real UTC timestamps, and time ordering for both runtimes. `src/app.ts` and `src/worker.ts` each check equipment existence in their own database.
- `src/app.ts` — booking routes: GET reads bookings, POST creates a booking with a generated UUID, PATCH updates an existing booking, and DELETE removes it. The handlers return the status codes required by the contract.
- `src/app.ts` — `app.onError()`: turns invalid input into a JSON 400 response and an overlap error into a JSON 409 response. Unexpected errors return a general JSON 500 message.
- `schema.sql`: creates the equipment and bookings tables. Each booking points to one equipment record through equipmentId. The INSERT and UPDATE triggers check for overlapping bookings before saving a change.
- `src/worker.ts`: defines the Cloudflare version of the routes. It receives the D1 database through the DB binding and awaits bound SQL queries. D1 trigger errors include a prefix, so the handler recognizes booking_overlap inside the error message.
- `wrangler.jsonc` and `migrations/0001_initial.sql`: tell Cloudflare which Worker to run and which D1 database to bind; the migration creates tables/triggers and seeds equipment. The student has replaced the original placeholder with a real D1 ID.
- `tests/http.test.ts`: contains the HTTP test suite the student ran. It checks successful requests, invalid input, conflicts, and database behavior. The supplied terminal output shows that the suite passed.

Student review status: the student reports completing the code reviews. The file/function descriptions above are AI-assisted summaries of the current source. The report of review completion comes from the student's message; terminal commands demonstrate the tests, rather than a file-by-file record of reading the code.

## Explanation of the main decisions (AI-assisted wording)

- **Overlap prevention:** the same equipment cannot have two bookings that share time. A conflict exists when the old booking starts before the new booking ends AND the old booking ends after the new booking starts. Both conditions must be true. For example, 09:00–11:00 conflicts with 10:00–12:00. It does not conflict with 11:00–12:00 because the first booking has ended. Bookings for different equipment can use the same time.
- **Why check inside SQLite:** a trigger is a database rule that runs automatically before a booking is created or updated. Checking during the write prevents another connection from saving a conflicting booking between a separate check and save. If a conflict is found, SQLite rejects the change and the API returns 409.
- **Why an update ignores its own ID:** the booking being edited already occupies its time slot. It must be compared with other bookings, not with itself. This lets a purpose-only update succeed when the times stay the same.
- **Status choices:** 200 means a read or update succeeded. 201 means a booking was created. 204 means deletion succeeded and there is no response body. 400 means the submitted data is invalid, such as an unknown equipment ID or equal start and end times. 404 means the requested booking or route cannot be found. 409 means the proposed booking overlaps an existing booking. 500 means an unexpected server error occurred.
- **Parameter binding:** SQL statements use `?` placeholders. Values such as a borrower name are passed separately through `.run()` or `.get()`. This makes SQLite treat those values as data, even if they contain quotes or words that look like SQL commands.
- **Partial updates:** PATCH combines the existing booking with the fields supplied in the request. It checks the full result before saving. Changing only purpose therefore keeps the other fields, while changing startAt still checks the result against endAt.
- **Date validation:** timestamps use UTC and are stored in one consistent format. The code parses each timestamp and compares the result with the input. This rejects impossible dates such as February 30 instead of silently moving them to March. It also checks that startAt is earlier than endAt.
- **Persistence:** bookings are saved in a SQLite file, so stopping the server does not erase them. Restarting with the same DB_PATH opens the same file. The supplied verification output shows the updated booking was still available after the reported restart.

**Required behavior and design choices:** the brief requires equipment listing, booking CRUD, valid equipment references, start before end, overlap prevention, bound SQL, JSON errors, and test evidence. Partial PATCH, trimmed text, UTC-only input, UUID booking IDs, and allowing adjacent intervals are documented design choices. A browser interface is optional, so no frontend or CORS configuration was added.

**What improved after review:** the initial version allowed overlapping PATCH requests, accepted February 30 by rolling it into March, and only checked POST overlaps in application code. AI-assisted fixes added INSERT/UPDATE database triggers, ignored the current booking ID during updates, and required real calendar timestamps. The before/after evidence is in QUALITY_GATE_REVIEW.md. My additional manual run showed that moving a booking to a free time succeeded and a second booking inside that time was rejected.

**What the tests mean:** the 201 response shows a booking was created; the 200 PATCH and GET show the new values were saved; the 400 and 409 responses show invalid and conflicting bookings were rejected; the 204 followed by 404 shows deletion worked. My first verification also checked that data remained after a server restart and that the automated suite passed.

**Limitations:** this is a lab API without authentication or a browser interface. Local Node SQLite and Cloudflare D1 are separate databases. The Workers/D1 version has agent-run local tests, a dry run, and student-supplied live GET responses; remote write/error checks remain to be recorded. The initial snapshot was saved before improvements but was not an instructor-supervised minute-30 checkpoint.

Student understanding status: code review completion is reported by the student. Codex helped write these explanations at the student's request. Instructor follow-up questions will assess whether the student can explain the submission independently; this log does not claim that assessment has already occurred.

## Quality Gate answers and current status

| Area | Answer and evidence |
| --- | --- |
| Purpose | The API handles campus equipment reservations and follows the required contract. Required source and documentation are present. GitHub and live API links are recorded in README.md. |
| Reliability | Create/update conflict checks and equipment validation are implemented. Student output shows saved updates, errors, restart persistence, and deletion; automated checks include overlap prevention on updates. |
| Course Context | The project uses TypeScript/Hono and SQLite/D1. AI wrote the implementation and helped with fixes/documentation; the student customized payloads, ran verification, and reports reviewing the code. |
| Reasoning | The explanations above cover statuses, overlap boundaries, self-exclusion, SQL binding, required behavior, optional choices, and limitations. Their wording is AI-assisted. |
| Execution Value | The supplied outputs show build/start, CRUD, error tests, and a passing 41-case suite. The additional manual time-changing PATCH sequence is now recorded. |
| Accuracy | Full responses show correct booking fields and updated times. Invalid ranges return 400, conflicts 409, and missing bookings 404 with JSON error bodies. Source uses parameter binding. |
| Delivery Quality | README, contract, ERD/schema, AI log, review findings, snapshots, more than five successful/error HTTP cases, and source/live links are included. Final repository access, latest push, and remote write/error checks remain. |
| You Own It | The student reports completing code review; this log discloses AI authorship and AI-assisted explanations, records personal tests, and describes the review improvements. Instructor ownership questions have not been assessed here. |

Submission status: local API review and recorded verification are complete; GitHub and live API links are now recorded, with live GET evidence. Remote CRUD/error checks and a final push/access check remain before declaring the link-based submission fully verified.

Problems or remaining questions:

- The first GET used the placeholder `PASTE_THE_RETURNED_ID` and returned HTTP 404 with `Booking not found`. Assigning an unquoted UUID produced a PowerShell CommandNotFoundException; a quoted ID with a leading space produced `curl: (3) URL rejected: Malformed input to a URL function`. The student corrected the variable to the quoted UUID without a leading space and received HTTP 200.
- The original transcript omitted much of the terminal output. The supplemental files now preserve the full supplied build, HTTP, restart, and test outputs, resolving those evidence gaps. The original transcript is retained unchanged.
- The student now reports completing code review. Explanations were drafted by Codex in simple language with that assistance disclosed. No source-code edits by the student are evidenced in the supplied outputs; the student customized test payloads and ran the checks.
- GitHub and live API links and the real D1 ID are now recorded. Live GET checks succeeded. Remote CRUD/error verification, pushing the latest documents/evidence, and ensuring instructor repository access remain.
