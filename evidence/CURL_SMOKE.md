# Compiled-server cURL smoke evidence

Base API URL: http://localhost:8787/api; command: npm start (node dist/server.js).

Recorded UTC: 2026-10-06T06:41:10.9557653Z

## GET /equipment

HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 115
Date: Tue, 06 Oct 2026 06:41:11 GMT
Connection: keep-alive
Keep-Alive: timeout=5

[{"id":"eq-1","name":"Projector A","location":"Building 1"},{"id":"eq-2","name":"Camera B","location":"Media Lab"}]

## POST /bookings using examples/booking.json

HTTP/1.1 201 Created
content-type: application/json
location: /api/bookings/dfc45fbb-c9e8-4777-8054-068858a0d991
Content-Length: 201
Date: Tue, 06 Oct 2026 06:41:11 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"id":"dfc45fbb-c9e8-4777-8054-068858a0d991","equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-20T09:00:00.000Z","endAt":"2026-10-20T11:00:00.000Z","purpose":"Class presentation"}

## Repeat POST /bookings

HTTP/1.1 409 Conflict
Content-Type: application/json
Content-Length: 59
Date: Tue, 06 Oct 2026 06:41:12 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Booking time conflicts with an existing booking"}

## DELETE created booking

HTTP/1.1 204 No Content
content-type: text/plain; charset=UTF-8
Date: Tue, 06 Oct 2026 06:41:12 GMT
Connection: keep-alive
Keep-Alive: timeout=5


## GET deleted booking

HTTP/1.1 404 Not Found
Content-Type: application/json
Content-Length: 29
Date: Tue, 06 Oct 2026 06:41:12 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Booking not found"}

Result: PASS. Smoke booking deleted afterward.
