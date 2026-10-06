# Initial review probes

Recorded: 2026-10-06T06:36:09.548Z

Base URL: http://localhost:8789/api

Preserved initial implementation in snapshots/initial; these are actual observed shortcomings, not passing results.

| Probe | Expected final behavior | Initial observation |
| --- | --- | --- |
| PATCH second booking into first interval (1f1436ed-8e69-465d-a358-c7111c80d6cf) | 409 | 200: {"id":"d7a37ca2-8337-4d44-a8a8-7cf05bc6ced8","equipmentId":"eq-1","borrowerName":"Review","startAt":"2026-10-20T10:00:00.000Z","endAt":"2026-10-20T12:00:00.000Z","purpose":"Initial regression probe"} |
| POST February 30 | 400 | 201: {"id":"a1955567-2a3f-4de2-9e65-abf148135411","equipmentId":"eq-2","borrowerName":"Review","startAt":"2026-03-02T09:00:00.000Z","endAt":"2026-03-03T11:00:00.000Z","purpose":"Initial regression probe"} |
| Independent SQL write into reserved slot | Rejected by database | accepted |
