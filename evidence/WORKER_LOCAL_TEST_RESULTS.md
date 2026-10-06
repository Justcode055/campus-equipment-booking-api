# Local Cloudflare Worker HTTP evidence

Recorded: 2026-10-06T08:27:00.306Z

Base URL: http://127.0.0.1:8789/api

Client: Node fetch; runtime: Wrangler/workerd; storage: local D1 simulation. Agent-run checks, not a remote deployment.

## 1. Equipment seeds

GET http://127.0.0.1:8789/api/equipment

Request body: (none)

Expected: 200; observed: 200

```json
[{"id":"eq-1","name":"Projector A","location":"Building 1"},{"id":"eq-2","name":"Camera B","location":"Media Lab"}]
```

## 2. Booking collection

GET http://127.0.0.1:8789/api/bookings

Request body: (none)

Expected: 200; observed: 200

```json
[]
```

## 3. Create and safely store SQL-looking text

POST http://127.0.0.1:8789/api/bookings

Request body: {"equipmentId":"eq-1","borrowerName":"O'Brien'); DROP TABLE equipment; --","purpose":"Worker test 3ce05f0e-213e-41d2-b209-e21932e6b721","startAt":"2030-10-20T09:00:00.000Z","endAt":"2030-10-20T11:00:00.000Z"}

Expected: 201; observed: 201

```json
{"id":"16afb542-a949-42fd-95c2-a5a8bee51ebe","equipmentId":"eq-1","borrowerName":"O'Brien'); DROP TABLE equipment; --","startAt":"2030-10-20T09:00:00.000Z","endAt":"2030-10-20T11:00:00.000Z","purpose":"Worker test 3ce05f0e-213e-41d2-b209-e21932e6b721"}
```

## 4. Read one

GET http://127.0.0.1:8789/api/bookings/16afb542-a949-42fd-95c2-a5a8bee51ebe

Request body: (none)

Expected: 200; observed: 200

```json
{"id":"16afb542-a949-42fd-95c2-a5a8bee51ebe","equipmentId":"eq-1","borrowerName":"O'Brien'); DROP TABLE equipment; --","startAt":"2030-10-20T09:00:00.000Z","endAt":"2030-10-20T11:00:00.000Z","purpose":"Worker test 3ce05f0e-213e-41d2-b209-e21932e6b721"}
```

## 5. Overlap create mapped from D1 trigger

POST http://127.0.0.1:8789/api/bookings

Request body: {"equipmentId":"eq-1","borrowerName":"O'Brien'); DROP TABLE equipment; --","purpose":"Worker test 3ce05f0e-213e-41d2-b209-e21932e6b721","startAt":"2030-10-20T10:00:00.000Z","endAt":"2030-10-20T11:00:00.000Z"}

Expected: 409; observed: 409

```json
{"error":"Booking time conflicts with an existing booking"}
```

## 6. Adjacent interval

POST http://127.0.0.1:8789/api/bookings

Request body: {"equipmentId":"eq-1","borrowerName":"O'Brien'); DROP TABLE equipment; --","purpose":"Worker test 3ce05f0e-213e-41d2-b209-e21932e6b721","startAt":"2030-10-20T11:00:00.000Z","endAt":"2030-10-20T12:00:00.000Z"}

Expected: 201; observed: 201

```json
{"id":"bb60eeb1-7228-4d0f-b4bc-a157bf53eb36","equipmentId":"eq-1","borrowerName":"O'Brien'); DROP TABLE equipment; --","startAt":"2030-10-20T11:00:00.000Z","endAt":"2030-10-20T12:00:00.000Z","purpose":"Worker test 3ce05f0e-213e-41d2-b209-e21932e6b721"}
```

## 7. Overlapping PATCH

PATCH http://127.0.0.1:8789/api/bookings/bb60eeb1-7228-4d0f-b4bc-a157bf53eb36

Request body: {"startAt":"2030-10-20T10:00:00.000Z"}

Expected: 409; observed: 409

```json
{"error":"Booking time conflicts with an existing booking"}
```

## 8. Failed PATCH is unchanged

GET http://127.0.0.1:8789/api/bookings/bb60eeb1-7228-4d0f-b4bc-a157bf53eb36

Request body: (none)

Expected: 200; observed: 200

```json
{"id":"bb60eeb1-7228-4d0f-b4bc-a157bf53eb36","equipmentId":"eq-1","borrowerName":"O'Brien'); DROP TABLE equipment; --","startAt":"2030-10-20T11:00:00.000Z","endAt":"2030-10-20T12:00:00.000Z","purpose":"Worker test 3ce05f0e-213e-41d2-b209-e21932e6b721"}
```

## 9. Self-excluding partial PATCH

PATCH http://127.0.0.1:8789/api/bookings/16afb542-a949-42fd-95c2-a5a8bee51ebe

Request body: {"purpose":"Updated purpose"}

Expected: 200; observed: 200

```json
{"id":"16afb542-a949-42fd-95c2-a5a8bee51ebe","equipmentId":"eq-1","borrowerName":"O'Brien'); DROP TABLE equipment; --","startAt":"2030-10-20T09:00:00.000Z","endAt":"2030-10-20T11:00:00.000Z","purpose":"Updated purpose"}
```

## 10. Move booking time with full PATCH

PATCH http://127.0.0.1:8789/api/bookings/16afb542-a949-42fd-95c2-a5a8bee51ebe

Request body: {"equipmentId":"eq-1","borrowerName":"O'Brien'); DROP TABLE equipment; --","purpose":"Worker test 3ce05f0e-213e-41d2-b209-e21932e6b721","startAt":"2030-10-20T12:00:00Z","endAt":"2030-10-20T14:00:00Z"}

Expected: 200; observed: 200

```json
{"id":"16afb542-a949-42fd-95c2-a5a8bee51ebe","equipmentId":"eq-1","borrowerName":"O'Brien'); DROP TABLE equipment; --","startAt":"2030-10-20T12:00:00.000Z","endAt":"2030-10-20T14:00:00.000Z","purpose":"Worker test 3ce05f0e-213e-41d2-b209-e21932e6b721"}
```

## 11. Contained overlap after time change

POST http://127.0.0.1:8789/api/bookings

Request body: {"equipmentId":"eq-1","borrowerName":"O'Brien'); DROP TABLE equipment; --","purpose":"Worker test 3ce05f0e-213e-41d2-b209-e21932e6b721","startAt":"2030-10-20T12:30:00Z","endAt":"2030-10-20T13:30:00Z"}

Expected: 409; observed: 409

```json
{"error":"Booking time conflicts with an existing booking"}
```

## 12. Invalid equipment

POST http://127.0.0.1:8789/api/bookings

Request body: {"equipmentId":"eq-missing","borrowerName":"O'Brien'); DROP TABLE equipment; --","purpose":"Worker test 3ce05f0e-213e-41d2-b209-e21932e6b721","startAt":"2030-10-20T09:00:00.000Z","endAt":"2030-10-20T11:00:00.000Z"}

Expected: 400; observed: 400

```json
{"error":"equipmentId does not exist"}
```

## 13. Reversed times

POST http://127.0.0.1:8789/api/bookings

Request body: {"equipmentId":"eq-1","borrowerName":"O'Brien'); DROP TABLE equipment; --","purpose":"Worker test 3ce05f0e-213e-41d2-b209-e21932e6b721","startAt":"2030-10-20T11:00:00.000Z","endAt":"2030-10-20T09:00:00.000Z"}

Expected: 400; observed: 400

```json
{"error":"startAt must be before endAt"}
```

## 14. Impossible calendar date

POST http://127.0.0.1:8789/api/bookings

Request body: {"equipmentId":"eq-1","borrowerName":"O'Brien'); DROP TABLE equipment; --","purpose":"Worker test 3ce05f0e-213e-41d2-b209-e21932e6b721","startAt":"2030-02-30T09:00:00Z","endAt":"2030-03-03T11:00:00Z"}

Expected: 400; observed: 400

```json
{"error":"startAt must be a real calendar timestamp"}
```

## 15. Missing fields

POST http://127.0.0.1:8789/api/bookings

Request body: {}

Expected: 400; observed: 400

```json
{"error":"Provide booking fields only; body must not be empty"}
```

## 16. Missing GET

GET http://127.0.0.1:8789/api/bookings/missing

Request body: (none)

Expected: 404; observed: 404

```json
{"error":"Booking not found"}
```

## 17. Missing PATCH

PATCH http://127.0.0.1:8789/api/bookings/missing

Request body: {"purpose":"Test"}

Expected: 404; observed: 404

```json
{"error":"Booking not found"}
```

## 18. Missing DELETE

DELETE http://127.0.0.1:8789/api/bookings/missing

Request body: (none)

Expected: 404; observed: 404

```json
{"error":"Booking not found"}
```

## 19. Unknown route JSON

GET http://127.0.0.1:8789/api/unknown

Request body: (none)

Expected: 404; observed: 404

```json
{"error":"Resource not found"}
```

## 20. Different equipment same interval

POST http://127.0.0.1:8789/api/bookings

Request body: {"equipmentId":"eq-2","borrowerName":"O'Brien'); DROP TABLE equipment; --","purpose":"Worker test 3ce05f0e-213e-41d2-b209-e21932e6b721","startAt":"2030-10-20T12:00:00.000Z","endAt":"2030-10-20T14:00:00.000Z"}

Expected: 201; observed: 201

```json
{"id":"c3398f8d-12c0-4f78-a850-fcfb7ce2f82b","equipmentId":"eq-2","borrowerName":"O'Brien'); DROP TABLE equipment; --","startAt":"2030-10-20T12:00:00.000Z","endAt":"2030-10-20T14:00:00.000Z","purpose":"Worker test 3ce05f0e-213e-41d2-b209-e21932e6b721"}
```

## Concurrent creates

Request: POST http://127.0.0.1:8789/api/bookings

{"equipmentId":"eq-1","borrowerName":"O'Brien'); DROP TABLE equipment; --","purpose":"Worker test 3ce05f0e-213e-41d2-b209-e21932e6b721","startAt":"2030-10-21T09:00:00Z","endAt":"2030-10-21T11:00:00Z"}

Expected one 201 and one 409:

```json
[
  {
    "status": 201,
    "body": {
      "id": "1a9f3edc-4bb1-4a70-b2bc-5f8dfd33c63f",
      "equipmentId": "eq-1",
      "borrowerName": "O'Brien'); DROP TABLE equipment; --",
      "startAt": "2030-10-21T09:00:00.000Z",
      "endAt": "2030-10-21T11:00:00.000Z",
      "purpose": "Worker test 3ce05f0e-213e-41d2-b209-e21932e6b721"
    }
  },
  {
    "status": 409,
    "body": {
      "error": "Booking time conflicts with an existing booking"
    }
  }
]
```

## 21. Delete

DELETE http://127.0.0.1:8789/api/bookings/16afb542-a949-42fd-95c2-a5a8bee51ebe

Request body: (none)

Expected: 204; observed: 204

```json
(empty body)
```

## 22. Deleted booking missing

GET http://127.0.0.1:8789/api/bookings/16afb542-a949-42fd-95c2-a5a8bee51ebe

Request body: (none)

Expected: 404; observed: 404

```json
{"error":"Booking not found"}
```

PASS: 22 sequential HTTP cases and competing creates.

Cleanup own test booking bb60eeb1-7228-4d0f-b4bc-a157bf53eb36: 204

Cleanup own test booking c3398f8d-12c0-4f78-a850-fcfb7ce2f82b: 204

Cleanup own test booking 1a9f3edc-4bb1-4a70-b2bc-5f8dfd33c63f: 204
