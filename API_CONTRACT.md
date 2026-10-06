# Campus Equipment Booking API contract

Base URL: `http://localhost:8787/api`.

Design recorded before implementation. The folder has no starter repository, so this submission uses TypeScript, Hono's Node adapter, and local SQLite on Node 24.11 or later.

Later deployment preparation adds a Cloudflare Workers/D1 entry point with the same contract. Its base URL is the deployed workers.dev URL plus `/api`; a remote URL has not yet been recorded. Both runtimes share field/date validation in `src/validation.ts`.

| Method | Path | Success | Body |
| --- | --- | --- | --- |
| GET | /equipment | 200 | Equipment array |
| GET | /bookings | 200 | Booking array (ordered by start time, then ID) |
| GET | /bookings/:id | 200 | Booking object |
| POST | /bookings | 201 | Created booking; Location header |
| PATCH | /bookings/:id | 200 | Updated booking |
| DELETE | /bookings/:id | 204 | Empty body |

Equipment: `{ "id": "eq-1", "name": "Projector A", "location": "Building 1" }`.

POST requires all five fields below. PATCH accepts any nonempty subset, merges with the existing record, and validates the complete result. Fields outside this contract are rejected. IDs are server-generated UUIDs and cannot be changed.

```json
{
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-10-20T09:00:00.000Z",
  "endAt": "2026-10-20T11:00:00.000Z",
  "purpose": "Class presentation"
}
```

Responses contain these five fields plus `id`. Text is trimmed; equipmentId, borrowerName and purpose must be nonempty strings (maximum lengths 100, 200 and 1000). Times must be real calendar timestamps in UTC: `YYYY-MM-DDTHH:mm:ssZ` or `YYYY-MM-DDTHH:mm:ss.sssZ`; responses normalize to milliseconds. The start must be strictly earlier than the end.

Assumptions: bookings use half-open intervals `[startAt, endAt)`, so adjacent bookings are permitted. Overlap means `existing.startAt < candidate.endAt AND existing.endAt > candidate.startAt` for the same equipment. Updates exclude their own ID. No authentication, browser client, pagination, or CORS is required for this local lab.

All errors are `{ "error": "Readable message" }`:

- 400: malformed JSON, missing/unknown/invalid fields, nonexistent equipment reference, or invalid interval. A bad equipment reference is invalid input rather than a missing URL resource.
- 404: nonexistent booking (including PATCH/DELETE), or unknown route.
- 409: another booking overlaps on the same equipment.
- 500: unexpected internal failure; internal details are logged only on the server.

Missing booking takes precedence over PATCH payload validation. SQL parameters are bound. SQLite triggers enforce overlap rules atomically, including independent connections.
