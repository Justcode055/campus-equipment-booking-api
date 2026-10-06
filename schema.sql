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
CREATE TRIGGER IF NOT EXISTS bookings_no_overlap_insert
BEFORE INSERT ON bookings
WHEN EXISTS (
  SELECT 1 FROM bookings
  WHERE equipmentId = NEW.equipmentId
    AND startAt < NEW.endAt AND endAt > NEW.startAt
)
BEGIN
  SELECT RAISE(ABORT, 'booking_overlap');
END;
CREATE TRIGGER IF NOT EXISTS bookings_no_overlap_update
BEFORE UPDATE ON bookings
WHEN EXISTS (
  SELECT 1 FROM bookings
  WHERE equipmentId = NEW.equipmentId AND id <> OLD.id
    AND startAt < NEW.endAt AND endAt > NEW.startAt
)
BEGIN
  SELECT RAISE(ABORT, 'booking_overlap');
END;
