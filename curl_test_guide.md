# Manual cURL quick test guide

This guide was authored because the guide referenced in the brief was not supplied. Start the API with npm start. The examples use Windows PowerShell's `curl.exe` and payload files to avoid quoting problems. Use a fresh local database or unused times if the slots are already reserved.

```powershell
curl.exe -i http://localhost:8787/api/equipment
curl.exe -i http://localhost:8787/api/bookings
curl.exe -i -X POST http://localhost:8787/api/bookings -H 'Content-Type: application/json' --data-binary '@examples/booking.json'
```

Expected: 200, 200, then 201 with an id and Location header. Save the returned ID:

```powershell
$bookingId = 'PASTE_RETURNED_ID'
curl.exe -i "http://localhost:8787/api/bookings/$bookingId"
curl.exe -i -X PATCH "http://localhost:8787/api/bookings/$bookingId" -H 'Content-Type: application/json' --data-binary '@examples/patch.json'
curl.exe -i -X POST http://localhost:8787/api/bookings -H 'Content-Type: application/json' --data-binary '@examples/booking.json'
curl.exe -i -X POST http://localhost:8787/api/bookings -H 'Content-Type: application/json' --data-binary '@examples/invalid.json'
curl.exe -i -X DELETE "http://localhost:8787/api/bookings/$bookingId"
curl.exe -i "http://localhost:8787/api/bookings/$bookingId"
```

Expected: 200, 200 (new purpose), 409 conflict, 400 invalid input, 204 with empty body, 404. All errors have an `error` string. Preserve your observed output and add your own verification to AI_LOG.md. For broader repeatable coverage, run npm test.
