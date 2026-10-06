# Campus Equipment Booking API

TypeScript/Hono API with two runtime options: Node with persistent local SQLite, or Cloudflare Workers with D1. Implements the exam's equipment list and complete bookings CRUD with validation, JSON errors, and atomic overlap prevention. The instructions below run the original Node version.

Source repository: [Justcode055/campus-equipment-booking-api](https://github.com/Justcode055/campus-equipment-booking-api). GitHub reports that the repository is public and its default branch is main.

Live base API URL: **https://campus-equipment-api.6731503055.workers.dev/api**. [Equipment endpoint](https://campus-equipment-api.6731503055.workers.dev/api/equipment) returns the two seed records. Student-supplied read checks are in [live read evidence](evidence/CLOUDFLARE_LIVE_READ_CHECKS.md). At the student's explicit request, Codex ran **20 live HTTPS checks** covering CRUD, validation, overlaps on create/update, adjacent intervals, missing resources, and failed-update integrity. All passed and all test-created bookings were removed. Full requests/responses are in [live test results](evidence/CLOUDFLARE_LIVE_TEST_RESULTS.md).

For GitHub publishing and Cloudflare deployment, follow [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md). Worker source is `src/worker.ts`; the D1 migration is `migrations/0001_initial.sql`. Wrangler configuration now contains the student's real D1 database ID.

## Run

Requires Node.js **24.11 or later** and npm. Run from this project folder:

```powershell
npm.cmd ci --cache .npm-cache
npm.cmd run build
npm.cmd start
```

Base API URL: **http://localhost:8787/api**. The server binds to 127.0.0.1. Stop with Ctrl+C. SQLite may print an experimental-feature warning on Node 24.11; this is expected. Database schema and two equipment records are initialized automatically; bookings persist in `data/bookings.sqlite` across restarts. Existing equipment is not overwritten.

For source development: `npm.cmd run dev` (Node's native TypeScript support). Optional PowerShell settings, before starting:

```powershell
$env:PORT = '8787'
$env:DB_PATH = 'data/custom.sqlite'
```

The custom database's parent directory must already exist. No cloud account or credentials are needed. This is a local lab API with no authentication or browser frontend.

## Test and evidence

```powershell
npm.cmd test
```

Tests start their own HTTP server at **http://localhost:8788/api** and use a fresh file database. Port 8788 must be free. The temporary database is removed afterward; the development database is unaffected. Actual requests and responses are written to [evidence/HTTP_TEST_RESULTS.md](evidence/HTTP_TEST_RESULTS.md). The run passed **41 sequential HTTP cases**, simultaneous competing creates, persisted data read through a separate database connection, and direct database conflict enforcement.

The tests cover equipment, all CRUD operations, missing resources, invalid JSON/fields/times, impossible calendar dates, overlapping/containing/identical intervals, adjacent bookings, different equipment, PATCH self-exclusion, changing equipment, unchanged data after failed updates, safe SQL-looking strings, and reuse after deletion. [curl_test_guide.md](curl_test_guide.md) provides manual cURL commands. [evidence/CURL_SMOKE.md](evidence/CURL_SMOKE.md) records a separate compiled-server smoke check.

## Submission files

- [API_CONTRACT.md](API_CONTRACT.md): design, payloads, statuses, assumptions, and partial PATCH semantics.
- [SCHEMA.md](SCHEMA.md) and [schema.sql](schema.sql): ERD and executable schema.
- [AI_LOG.md](AI_LOG.md): prompts, AI contributions, actual verification, and student verification still required.
- [QUALITY_GATE_REVIEW.md](QUALITY_GATE_REVIEW.md): initial findings, fixes, and evidence.
- [snapshots/initial/](snapshots/initial/): first version retained before improvements.
- [evidence/INITIAL_REVIEW.md](evidence/INITIAL_REVIEW.md): actual failing probes against that initial version.
- [RUBRIC_COVERAGE.md](RUBRIC_COVERAGE.md): mapping of each rubric area to deliverables.
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md): GitHub and Cloudflare steps.
- [evidence/WORKER_LOCAL_TEST_RESULTS.md](evidence/WORKER_LOCAL_TEST_RESULTS.md): 22 local Worker/D1 HTTP checks plus competing creates.
- [evidence/CLOUDFLARE_LIVE_TEST_RESULTS.md](evidence/CLOUDFLARE_LIVE_TEST_RESULTS.md): 20 live API checks, run by Codex at the student's request. Repeat with `npm.cmd run test:live`; this writes temporary bookings to the live submission API and cleans up only its own records.

The folder initially contained only `exam_brief_en.md` and `rubric_en.md`. The student later supplied [quality_gate.md](quality_gate.md) and [curl_test_guide_1.md](curl_test_guide_1.md). The review now maps evidence to all eight areas in that Quality Gate. The instructor cURL guide uses Bash syntax; `curl_test_guide.md` is the AI-authored PowerShell alternative. There was no starter code. The saved initial version is an untimed checkpoint, **not evidence of an instructor-supervised minute-30 checkpoint**. The original brief and rubric are preserved.

## Explain the work

1. Why allow touching bookings? Intervals are half-open: an item is released at its end time. Two intervals overlap only if each starts before the other's end.
2. Why normalize dates? Canonical UTC strings sort chronologically in SQLite. Comparing the parsed date with the input also rejects rollovers such as February 30.
3. Why database triggers? A separate SELECT followed by INSERT can race across connections. The trigger checks inside the write statement; SQLite serializes writes. The UPDATE trigger excludes the row's own ID.
4. Why these statuses? Bad payloads use 400; an absent booking URL uses 404; valid input competing with an existing booking uses 409.
5. Why parameter binding? SQL text stays constant while values are bound through `?`, so names containing SQL syntax are stored as text.
6. What does PATCH do? Merge the supplied subset with the existing row, validate the full resulting booking, then write it. A trigger failure aborts the statement and leaves the row intact.

Review these explanations, run the manual tests yourself, and add your own verification to AI_LOG.md before submitting. Agent-run checks cannot establish that the student independently understands the code.

Implementation references: [Hono Node adapter documentation](https://hono.dev/docs/getting-started/nodejs) and [Node SQLite documentation](https://nodejs.org/api/sqlite.html).
