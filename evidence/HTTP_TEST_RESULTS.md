# HTTP test evidence

Recorded: 2026-10-06T08:00:43.474Z

Base API URL: http://localhost:8788/api

Client: Node fetch over real HTTP to Hono's Node server. Fresh temporary SQLite database; assertions check status codes, JSON, and side effects. Run: npm test.

## 1. Seed equipment

Request: `GET http://localhost:8788/api/equipment`

Expected status: 200; observed: 200.

`Content-Type: application/json`

```json
[{"id":"eq-1","name":"Projector A","location":"Building 1"},{"id":"eq-2","name":"Camera B","location":"Media Lab"}]
```

## 2. Initially empty

Request: `GET http://localhost:8788/api/bookings`

Expected status: 200; observed: 200.

`Content-Type: application/json`

```json
[]
```

## 3. Create booking

Request: `POST http://localhost:8788/api/bookings`

```json
{"equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-20T09:00:00.000Z","endAt":"2026-10-20T11:00:00.000Z","purpose":"Class presentation"}
```

Expected status: 201; observed: 201.

`Content-Type: application/json`

```json
{"id":"569f23bc-f137-40b5-97b2-d8b281c1ba51","equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-20T09:00:00.000Z","endAt":"2026-10-20T11:00:00.000Z","purpose":"Class presentation"}
```

## 4. Read one

Request: `GET http://localhost:8788/api/bookings/569f23bc-f137-40b5-97b2-d8b281c1ba51`

Expected status: 200; observed: 200.

`Content-Type: application/json`

```json
{"id":"569f23bc-f137-40b5-97b2-d8b281c1ba51","equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-20T09:00:00.000Z","endAt":"2026-10-20T11:00:00.000Z","purpose":"Class presentation"}
```

## 5. Read list

Request: `GET http://localhost:8788/api/bookings`

Expected status: 200; observed: 200.

`Content-Type: application/json`

```json
[{"id":"569f23bc-f137-40b5-97b2-d8b281c1ba51","equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-20T09:00:00.000Z","endAt":"2026-10-20T11:00:00.000Z","purpose":"Class presentation"}]
```

## 6. Overlap create

Request: `POST http://localhost:8788/api/bookings`

```json
{"equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-20T10:00:00.000Z","endAt":"2026-10-20T11:00:00.000Z","purpose":"Class presentation"}
```

Expected status: 409; observed: 409.

`Content-Type: application/json`

```json
{"error":"Booking time conflicts with an existing booking"}
```

## 7. Contained interval

Request: `POST http://localhost:8788/api/bookings`

```json
{"equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-20T09:30:00.000Z","endAt":"2026-10-20T10:30:00.000Z","purpose":"Class presentation"}
```

Expected status: 409; observed: 409.

`Content-Type: application/json`

```json
{"error":"Booking time conflicts with an existing booking"}
```

## 8. Containing interval

Request: `POST http://localhost:8788/api/bookings`

```json
{"equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-20T08:00:00.000Z","endAt":"2026-10-20T12:00:00.000Z","purpose":"Class presentation"}
```

Expected status: 409; observed: 409.

`Content-Type: application/json`

```json
{"error":"Booking time conflicts with an existing booking"}
```

## 9. Identical interval

Request: `POST http://localhost:8788/api/bookings`

```json
{"equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-20T09:00:00.000Z","endAt":"2026-10-20T11:00:00.000Z","purpose":"Class presentation"}
```

Expected status: 409; observed: 409.

`Content-Type: application/json`

```json
{"error":"Booking time conflicts with an existing booking"}
```

## 10. Touching end allowed

Request: `POST http://localhost:8788/api/bookings`

```json
{"equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-20T11:00:00.000Z","endAt":"2026-10-20T12:00:00.000Z","purpose":"Class presentation"}
```

Expected status: 201; observed: 201.

`Content-Type: application/json`

```json
{"id":"4353d98a-accc-462d-a5ab-052d4a7cbdbf","equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-20T11:00:00.000Z","endAt":"2026-10-20T12:00:00.000Z","purpose":"Class presentation"}
```

## 11. Touching start allowed

Request: `POST http://localhost:8788/api/bookings`

```json
{"equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-20T08:00:00Z","endAt":"2026-10-20T09:00:00Z","purpose":"Class presentation"}
```

Expected status: 201; observed: 201.

`Content-Type: application/json`

```json
{"id":"b571cad8-cb95-4b69-8be0-e8c4addbd050","equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-20T08:00:00.000Z","endAt":"2026-10-20T09:00:00.000Z","purpose":"Class presentation"}
```

## 12. Same time different equipment

Request: `POST http://localhost:8788/api/bookings`

```json
{"equipmentId":"eq-2","borrowerName":"Somchai Jaidee","startAt":"2026-10-20T09:00:00.000Z","endAt":"2026-10-20T11:00:00.000Z","purpose":"Class presentation"}
```

Expected status: 201; observed: 201.

`Content-Type: application/json`

```json
{"id":"c163f539-4c1c-4aae-a8b3-af730bc0d047","equipmentId":"eq-2","borrowerName":"Somchai Jaidee","startAt":"2026-10-20T09:00:00.000Z","endAt":"2026-10-20T11:00:00.000Z","purpose":"Class presentation"}
```

## 13. Overlap PATCH

Request: `PATCH http://localhost:8788/api/bookings/4353d98a-accc-462d-a5ab-052d4a7cbdbf`

```json
{"startAt":"2026-10-20T10:00:00.000Z"}
```

Expected status: 409; observed: 409.

`Content-Type: application/json`

```json
{"error":"Booking time conflicts with an existing booking"}
```

## 14. Failed PATCH leaves row intact

Request: `GET http://localhost:8788/api/bookings/4353d98a-accc-462d-a5ab-052d4a7cbdbf`

Expected status: 200; observed: 200.

`Content-Type: application/json`

```json
{"id":"4353d98a-accc-462d-a5ab-052d4a7cbdbf","equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-20T11:00:00.000Z","endAt":"2026-10-20T12:00:00.000Z","purpose":"Class presentation"}
```

## 15. Equipment change conflict

Request: `PATCH http://localhost:8788/api/bookings/c163f539-4c1c-4aae-a8b3-af730bc0d047`

```json
{"equipmentId":"eq-1"}
```

Expected status: 409; observed: 409.

`Content-Type: application/json`

```json
{"error":"Booking time conflicts with an existing booking"}
```

## 16. Partial PATCH excludes self

Request: `PATCH http://localhost:8788/api/bookings/569f23bc-f137-40b5-97b2-d8b281c1ba51`

```json
{"purpose":"Updated presentation"}
```

Expected status: 200; observed: 200.

`Content-Type: application/json`

```json
{"id":"569f23bc-f137-40b5-97b2-d8b281c1ba51","equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-20T09:00:00.000Z","endAt":"2026-10-20T11:00:00.000Z","purpose":"Updated presentation"}
```

## 17. Unknown equipment create

Request: `POST http://localhost:8788/api/bookings`

```json
{"equipmentId":"eq-missing","borrowerName":"Somchai Jaidee","startAt":"2026-10-20T09:00:00.000Z","endAt":"2026-10-20T11:00:00.000Z","purpose":"Class presentation"}
```

Expected status: 400; observed: 400.

`Content-Type: application/json`

```json
{"error":"equipmentId does not exist"}
```

## 18. Unknown equipment PATCH

Request: `PATCH http://localhost:8788/api/bookings/569f23bc-f137-40b5-97b2-d8b281c1ba51`

```json
{"equipmentId":"eq-missing"}
```

Expected status: 400; observed: 400.

`Content-Type: application/json`

```json
{"error":"equipmentId does not exist"}
```

## 19. Reversed interval

Request: `POST http://localhost:8788/api/bookings`

```json
{"equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-20T11:00:00.000Z","endAt":"2026-10-20T09:00:00.000Z","purpose":"Class presentation"}
```

Expected status: 400; observed: 400.

`Content-Type: application/json`

```json
{"error":"startAt must be before endAt"}
```

## 20. Equal times

Request: `POST http://localhost:8788/api/bookings`

```json
{"equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-20T09:00:00.000Z","endAt":"2026-10-20T09:00:00.000Z","purpose":"Class presentation"}
```

Expected status: 400; observed: 400.

`Content-Type: application/json`

```json
{"error":"startAt must be before endAt"}
```

## 21. Missing fields

Request: `POST http://localhost:8788/api/bookings`

```json
{"equipmentId":"eq-1"}
```

Expected status: 400; observed: 400.

`Content-Type: application/json`

```json
{"error":"borrowerName must be a nonempty string"}
```

## 22. Empty borrower

Request: `POST http://localhost:8788/api/bookings`

```json
{"equipmentId":"eq-1","borrowerName":"   ","startAt":"2026-10-20T09:00:00.000Z","endAt":"2026-10-20T11:00:00.000Z","purpose":"Class presentation"}
```

Expected status: 400; observed: 400.

`Content-Type: application/json`

```json
{"error":"borrowerName must be a nonempty string"}
```

## 23. Wrong type

Request: `POST http://localhost:8788/api/bookings`

```json
{"equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-20T09:00:00.000Z","endAt":"2026-10-20T11:00:00.000Z","purpose":42}
```

Expected status: 400; observed: 400.

`Content-Type: application/json`

```json
{"error":"purpose must be a nonempty string"}
```

## 24. Unknown field

Request: `POST http://localhost:8788/api/bookings`

```json
{"equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-20T09:00:00.000Z","endAt":"2026-10-20T11:00:00.000Z","purpose":"Class presentation","id":"user-id"}
```

Expected status: 400; observed: 400.

`Content-Type: application/json`

```json
{"error":"Provide booking fields only; body must not be empty"}
```

## 25. Empty PATCH

Request: `PATCH http://localhost:8788/api/bookings/569f23bc-f137-40b5-97b2-d8b281c1ba51`

```json
{}
```

Expected status: 400; observed: 400.

`Content-Type: application/json`

```json
{"error":"Provide booking fields only; body must not be empty"}
```

## 26. Invalid merged PATCH interval

Request: `PATCH http://localhost:8788/api/bookings/569f23bc-f137-40b5-97b2-d8b281c1ba51`

```json
{"startAt":"2026-10-20T11:00:00.000Z"}
```

Expected status: 400; observed: 400.

`Content-Type: application/json`

```json
{"error":"startAt must be before endAt"}
```

## 27. Impossible date

Request: `POST http://localhost:8788/api/bookings`

```json
{"equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-02-30T09:00:00.000Z","endAt":"2026-03-03T11:00:00.000Z","purpose":"Class presentation"}
```

Expected status: 400; observed: 400.

`Content-Type: application/json`

```json
{"error":"startAt must be a real calendar timestamp"}
```

## 28. Timezone required

Request: `POST http://localhost:8788/api/bookings`

```json
{"equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-20T09:00:00","endAt":"2026-10-20T11:00:00.000Z","purpose":"Class presentation"}
```

Expected status: 400; observed: 400.

`Content-Type: application/json`

```json
{"error":"startAt must be a UTC ISO timestamp"}
```

## 29. Malformed JSON

Request: `POST http://localhost:8788/api/bookings`

```json
{
```

Expected status: 400; observed: 400.

`Content-Type: application/json`

```json
{"error":"Expected property name or '}' in JSON at position 1 (line 1 column 2)"}
```

## 30. Array body

Request: `POST http://localhost:8788/api/bookings`

```json
[]
```

Expected status: 400; observed: 400.

`Content-Type: application/json`

```json
{"error":"Body must be a JSON object"}
```

## 31. Null body

Request: `POST http://localhost:8788/api/bookings`

```json
null
```

Expected status: 400; observed: 400.

`Content-Type: application/json`

```json
{"error":"Body must be a JSON object"}
```

## 32. Length bound

Request: `POST http://localhost:8788/api/bookings`

```json
{"equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-20T09:00:00.000Z","endAt":"2026-10-20T11:00:00.000Z","purpose":"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"}
```

Expected status: 400; observed: 400.

`Content-Type: application/json`

```json
{"error":"A text field exceeds its maximum length"}
```

## 33. Read not found

Request: `GET http://localhost:8788/api/bookings/missing`

Expected status: 404; observed: 404.

`Content-Type: application/json`

```json
{"error":"Booking not found"}
```

## 34. PATCH not found

Request: `PATCH http://localhost:8788/api/bookings/missing`

```json
{"purpose":"test"}
```

Expected status: 404; observed: 404.

`Content-Type: application/json`

```json
{"error":"Booking not found"}
```

## 35. DELETE not found

Request: `DELETE http://localhost:8788/api/bookings/missing`

Expected status: 404; observed: 404.

`Content-Type: application/json`

```json
{"error":"Booking not found"}
```

## 36. Unknown route

Request: `GET http://localhost:8788/api/missing`

Expected status: 404; observed: 404.

`Content-Type: application/json`

```json
{"error":"Resource not found"}
```

## 37. SQL-looking text safely stored

Request: `POST http://localhost:8788/api/bookings`

```json
{"equipmentId":"eq-1","borrowerName":"Robert'); DROP TABLE equipment; --","startAt":"2026-10-21T09:00:00Z","endAt":"2026-10-21T11:00:00Z","purpose":"Class presentation"}
```

Expected status: 201; observed: 201.

`Content-Type: application/json`

```json
{"id":"b1695548-1a93-45d1-877c-c78f38826889","equipmentId":"eq-1","borrowerName":"Robert'); DROP TABLE equipment; --","startAt":"2026-10-21T09:00:00.000Z","endAt":"2026-10-21T11:00:00.000Z","purpose":"Class presentation"}
```

## 38. Equipment survives text input

Request: `GET http://localhost:8788/api/equipment`

Expected status: 200; observed: 200.

`Content-Type: application/json`

```json
[{"id":"eq-1","name":"Projector A","location":"Building 1"},{"id":"eq-2","name":"Camera B","location":"Media Lab"}]
```

## 39. Delete existing

Request: `DELETE http://localhost:8788/api/bookings/569f23bc-f137-40b5-97b2-d8b281c1ba51`

Expected status: 204; observed: 204.

`Content-Type: text/plain; charset=UTF-8`

(empty body)

## 40. Deleted row absent

Request: `GET http://localhost:8788/api/bookings/569f23bc-f137-40b5-97b2-d8b281c1ba51`

Expected status: 404; observed: 404.

`Content-Type: application/json`

```json
{"error":"Booking not found"}
```

## 41. Deleted slot reusable

Request: `POST http://localhost:8788/api/bookings`

```json
{"equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-20T09:00:00.000Z","endAt":"2026-10-20T11:00:00.000Z","purpose":"Class presentation"}
```

Expected status: 201; observed: 201.

`Content-Type: application/json`

```json
{"id":"651d0087-fdf5-46da-a07b-6649ad601e8c","equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-20T09:00:00.000Z","endAt":"2026-10-20T11:00:00.000Z","purpose":"Class presentation"}
```

## Competing HTTP creates

POST http://localhost:8788/api/bookings twice concurrently with {"equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-22T09:00:00Z","endAt":"2026-10-22T11:00:00Z","purpose":"Class presentation"}.

Expected one 201 and one 409; observed:

```json
[
  {
    "status": 201,
    "body": {
      "id": "6100d9c0-5351-480e-85dd-2185659369a0",
      "equipmentId": "eq-1",
      "borrowerName": "Somchai Jaidee",
      "startAt": "2026-10-22T09:00:00.000Z",
      "endAt": "2026-10-22T11:00:00.000Z",
      "purpose": "Class presentation"
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

## Separate SQLite connection

Persisted SQL-looking text read back unchanged. INSERT and UPDATE into an occupied interval both threw `booking_overlap`; rejected statements did not commit. Assertions passed.

Result: PASS — 41 sequential HTTP cases, competing HTTP writes, and separate-connection database checks.
