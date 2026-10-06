PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS equipment (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  location TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY NOT NULL,
  equipmentId TEXT NOT NULL REFERENCES equipment(id),
  borrowerName TEXT NOT NULL CHECK(length(trim(borrowerName)) BETWEEN 1 AND 200),
  startAt TEXT NOT NULL,
  endAt TEXT NOT NULL,
  purpose TEXT NOT NULL CHECK(length(trim(purpose)) BETWEEN 1 AND 1000),
  CHECK(startAt < endAt)
);
CREATE INDEX IF NOT EXISTS bookings_equipment_time ON bookings(equipmentId, startAt, endAt);
