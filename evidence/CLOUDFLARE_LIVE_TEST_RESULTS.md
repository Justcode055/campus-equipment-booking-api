# Live Cloudflare API verification

Recorded: 2026-10-06T08:41:09.352Z

Base API URL: https://campus-equipment-api.6731503055.workers.dev/api

Client: Node fetch over HTTPS. Run by Codex at the student's explicit request; these are agent-run remote checks, not student-run commands. Run ID: 82b2c359-24c3-4a45-9ae4-cf9b282568d2.

## 1. Read seeded equipment

Request: GET https://campus-equipment-api.6731503055.workers.dev/api/equipment

Request body: (none)

Expected status: 200; observed: 200

Content-Type: application/json
Location: (absent)

```json
[{"id":"eq-1","name":"Projector A","location":"Building 1"},{"id":"eq-2","name":"Camera B","location":"Media Lab"}]
```

## 2. Read booking collection before tests

Request: GET https://campus-equipment-api.6731503055.workers.dev/api/bookings

Request body: (none)

Expected status: 200; observed: 200

Content-Type: application/json
Location: (absent)

```json
[]
```

## 3. Create booking

Request: POST https://campus-equipment-api.6731503055.workers.dev/api/bookings

Request body: {"equipmentId":"eq-1","borrowerName":"Codex live verification","purpose":"Quality Gate 82b2c359-24c3-4a45-9ae4-cf9b282568d2","startAt":"2030-10-20T09:00:00.000Z","endAt":"2030-10-20T11:00:00.000Z"}

Expected status: 201; observed: 201

Content-Type: application/json
Location: /api/bookings/703daa4b-101b-4583-9708-825e0fab810c

```json
{"id":"703daa4b-101b-4583-9708-825e0fab810c","equipmentId":"eq-1","borrowerName":"Codex live verification","startAt":"2030-10-20T09:00:00.000Z","endAt":"2030-10-20T11:00:00.000Z","purpose":"Quality Gate 82b2c359-24c3-4a45-9ae4-cf9b282568d2"}
```

## 4. Read created booking

Request: GET https://campus-equipment-api.6731503055.workers.dev/api/bookings/703daa4b-101b-4583-9708-825e0fab810c

Request body: (none)

Expected status: 200; observed: 200

Content-Type: application/json
Location: (absent)

```json
{"id":"703daa4b-101b-4583-9708-825e0fab810c","equipmentId":"eq-1","borrowerName":"Codex live verification","startAt":"2030-10-20T09:00:00.000Z","endAt":"2030-10-20T11:00:00.000Z","purpose":"Quality Gate 82b2c359-24c3-4a45-9ae4-cf9b282568d2"}
```

## 5. Adjacent booking allowed

Request: POST https://campus-equipment-api.6731503055.workers.dev/api/bookings

Request body: {"equipmentId":"eq-1","borrowerName":"Codex live verification","purpose":"Quality Gate 82b2c359-24c3-4a45-9ae4-cf9b282568d2","startAt":"2030-10-20T11:00:00.000Z","endAt":"2030-10-20T12:00:00.000Z"}

Expected status: 201; observed: 201

Content-Type: application/json
Location: /api/bookings/9c5d178d-9d96-4eff-81b0-09f168c90fd8

```json
{"id":"9c5d178d-9d96-4eff-81b0-09f168c90fd8","equipmentId":"eq-1","borrowerName":"Codex live verification","startAt":"2030-10-20T11:00:00.000Z","endAt":"2030-10-20T12:00:00.000Z","purpose":"Quality Gate 82b2c359-24c3-4a45-9ae4-cf9b282568d2"}
```

## 6. Update booking times

Request: PATCH https://campus-equipment-api.6731503055.workers.dev/api/bookings/703daa4b-101b-4583-9708-825e0fab810c

Request body: {"equipmentId":"eq-1","borrowerName":"Codex live verification","purpose":"Updated Quality Gate 82b2c359-24c3-4a45-9ae4-cf9b282568d2","startAt":"2030-10-20T12:00:00.000Z","endAt":"2030-10-20T14:00:00.000Z"}

Expected status: 200; observed: 200

Content-Type: application/json
Location: (absent)

```json
{"id":"703daa4b-101b-4583-9708-825e0fab810c","equipmentId":"eq-1","borrowerName":"Codex live verification","startAt":"2030-10-20T12:00:00.000Z","endAt":"2030-10-20T14:00:00.000Z","purpose":"Updated Quality Gate 82b2c359-24c3-4a45-9ae4-cf9b282568d2"}
```

## 7. Updated values persisted

Request: GET https://campus-equipment-api.6731503055.workers.dev/api/bookings/703daa4b-101b-4583-9708-825e0fab810c

Request body: (none)

Expected status: 200; observed: 200

Content-Type: application/json
Location: (absent)

```json
{"id":"703daa4b-101b-4583-9708-825e0fab810c","equipmentId":"eq-1","borrowerName":"Codex live verification","startAt":"2030-10-20T12:00:00.000Z","endAt":"2030-10-20T14:00:00.000Z","purpose":"Updated Quality Gate 82b2c359-24c3-4a45-9ae4-cf9b282568d2"}
```

## 8. Contained overlapping create rejected

Request: POST https://campus-equipment-api.6731503055.workers.dev/api/bookings

Request body: {"equipmentId":"eq-1","borrowerName":"Codex live verification","purpose":"Quality Gate 82b2c359-24c3-4a45-9ae4-cf9b282568d2","startAt":"2030-10-20T12:30:00.000Z","endAt":"2030-10-20T13:30:00.000Z"}

Expected status: 409; observed: 409

Content-Type: application/json
Location: (absent)

```json
{"error":"Booking time conflicts with an existing booking"}
```

## 9. Overlapping update rejected

Request: PATCH https://campus-equipment-api.6731503055.workers.dev/api/bookings/9c5d178d-9d96-4eff-81b0-09f168c90fd8

Request body: {"startAt":"2030-10-20T12:30:00.000Z","endAt":"2030-10-20T13:30:00.000Z"}

Expected status: 409; observed: 409

Content-Type: application/json
Location: (absent)

```json
{"error":"Booking time conflicts with an existing booking"}
```

## 10. Failed update leaves data unchanged

Request: GET https://campus-equipment-api.6731503055.workers.dev/api/bookings/9c5d178d-9d96-4eff-81b0-09f168c90fd8

Request body: (none)

Expected status: 200; observed: 200

Content-Type: application/json
Location: (absent)

```json
{"id":"9c5d178d-9d96-4eff-81b0-09f168c90fd8","equipmentId":"eq-1","borrowerName":"Codex live verification","startAt":"2030-10-20T11:00:00.000Z","endAt":"2030-10-20T12:00:00.000Z","purpose":"Quality Gate 82b2c359-24c3-4a45-9ae4-cf9b282568d2"}
```

## 11. Purpose-only update excludes self

Request: PATCH https://campus-equipment-api.6731503055.workers.dev/api/bookings/703daa4b-101b-4583-9708-825e0fab810c

Request body: {"purpose":"Partial Quality Gate 82b2c359-24c3-4a45-9ae4-cf9b282568d2"}

Expected status: 200; observed: 200

Content-Type: application/json
Location: (absent)

```json
{"id":"703daa4b-101b-4583-9708-825e0fab810c","equipmentId":"eq-1","borrowerName":"Codex live verification","startAt":"2030-10-20T12:00:00.000Z","endAt":"2030-10-20T14:00:00.000Z","purpose":"Partial Quality Gate 82b2c359-24c3-4a45-9ae4-cf9b282568d2"}
```

## 12. Reversed interval rejected

Request: POST https://campus-equipment-api.6731503055.workers.dev/api/bookings

Request body: {"equipmentId":"eq-1","borrowerName":"Codex live verification","purpose":"Quality Gate 82b2c359-24c3-4a45-9ae4-cf9b282568d2","startAt":"2030-10-20T11:00:00.000Z","endAt":"2030-10-20T09:00:00.000Z"}

Expected status: 400; observed: 400

Content-Type: application/json
Location: (absent)

```json
{"error":"startAt must be before endAt"}
```

## 13. Unknown equipment rejected

Request: POST https://campus-equipment-api.6731503055.workers.dev/api/bookings

Request body: {"equipmentId":"eq-missing","borrowerName":"Codex live verification","purpose":"Quality Gate 82b2c359-24c3-4a45-9ae4-cf9b282568d2","startAt":"2030-10-20T09:00:00.000Z","endAt":"2030-10-20T11:00:00.000Z"}

Expected status: 400; observed: 400

Content-Type: application/json
Location: (absent)

```json
{"error":"equipmentId does not exist"}
```

## 14. Impossible date rejected

Request: POST https://campus-equipment-api.6731503055.workers.dev/api/bookings

Request body: {"equipmentId":"eq-1","borrowerName":"Codex live verification","purpose":"Quality Gate 82b2c359-24c3-4a45-9ae4-cf9b282568d2","startAt":"2030-02-30T09:00:00.000Z","endAt":"2030-03-03T11:00:00.000Z"}

Expected status: 400; observed: 400

Content-Type: application/json
Location: (absent)

```json
{"error":"startAt must be a real calendar timestamp"}
```

## 15. Missing fields rejected

Request: POST https://campus-equipment-api.6731503055.workers.dev/api/bookings

Request body: {}

Expected status: 400; observed: 400

Content-Type: application/json
Location: (absent)

```json
{"error":"Provide booking fields only; body must not be empty"}
```

## 16. Missing booking

Request: GET https://campus-equipment-api.6731503055.workers.dev/api/bookings/missing-82b2c359-24c3-4a45-9ae4-cf9b282568d2

Request body: (none)

Expected status: 404; observed: 404

Content-Type: application/json
Location: (absent)

```json
{"error":"Booking not found"}
```

## 17. Missing update

Request: PATCH https://campus-equipment-api.6731503055.workers.dev/api/bookings/missing-82b2c359-24c3-4a45-9ae4-cf9b282568d2

Request body: {"purpose":"Test"}

Expected status: 404; observed: 404

Content-Type: application/json
Location: (absent)

```json
{"error":"Booking not found"}
```

## 18. Same time different equipment allowed

Request: POST https://campus-equipment-api.6731503055.workers.dev/api/bookings

Request body: {"equipmentId":"eq-2","borrowerName":"Codex live verification","purpose":"Quality Gate 82b2c359-24c3-4a45-9ae4-cf9b282568d2","startAt":"2030-10-20T12:00:00.000Z","endAt":"2030-10-20T14:00:00.000Z"}

Expected status: 201; observed: 201

Content-Type: application/json
Location: /api/bookings/57f614bb-194f-4e90-a5bb-6dd76092e561

```json
{"id":"57f614bb-194f-4e90-a5bb-6dd76092e561","equipmentId":"eq-2","borrowerName":"Codex live verification","startAt":"2030-10-20T12:00:00.000Z","endAt":"2030-10-20T14:00:00.000Z","purpose":"Quality Gate 82b2c359-24c3-4a45-9ae4-cf9b282568d2"}
```

## 19. Delete existing booking

Request: DELETE https://campus-equipment-api.6731503055.workers.dev/api/bookings/703daa4b-101b-4583-9708-825e0fab810c

Request body: (none)

Expected status: 204; observed: 204

Content-Type: (absent)
Location: (absent)

```json
(empty body)
```

## 20. Deleted booking not found

Request: GET https://campus-equipment-api.6731503055.workers.dev/api/bookings/703daa4b-101b-4583-9708-825e0fab810c

Request body: (none)

Expected status: 404; observed: 404

Content-Type: application/json
Location: (absent)

```json
{"error":"Booking not found"}
```

PASS: 20 live HTTP cases, with status, JSON, field, Location, and failed-update assertions.

Cleanup own booking 9c5d178d-9d96-4eff-81b0-09f168c90fd8: 204

Cleanup own booking 57f614bb-194f-4e90-a5bb-6dd76092e561: 204

Final result: PASS. All test-created bookings were removed; pre-existing bookings were not changed.
