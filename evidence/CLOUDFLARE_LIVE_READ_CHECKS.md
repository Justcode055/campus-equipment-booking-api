# Student live API read checks

Source: terminal output supplied by the student in chat on 2026-10-06. These excerpts retain the status and relevant response data; Cloudflare reporting headers are omitted. Codex did not run these requests.

Base API URL: `https://campus-equipment-api.6731503055.workers.dev/api`.

## Equipment

Command: `curl.exe -i "$liveBase/equipment"`

Observed at 2026-10-06 15:30:38 Asia/Bangkok (08:30:38 GMT):

```http
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 115
Server: cloudflare

[{"id":"eq-1","name":"Projector A","location":"Building 1"},{"id":"eq-2","name":"Camera B","location":"Media Lab"}]
```

## Bookings

Command: `curl.exe -i "$liveBase/bookings"`

Observed at 2026-10-06 15:30:45 Asia/Bangkok (08:30:45 GMT):

```http
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 2
Server: cloudflare

[]
```

The student's complete follow-up paste includes `[]`, confirming the live booking collection was empty at this check.

These checks demonstrate live GET responses and correct seeded equipment. They do not establish remote create/update/delete, input-validation, or overlap behavior. Record those checks separately.
