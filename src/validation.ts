export type Booking = { id: string; equipmentId: string; borrowerName: string; startAt: string; endAt: string; purpose: string };
const fields = ['equipmentId', 'borrowerName', 'startAt', 'endAt', 'purpose'] as const;
export class InputError extends Error {}

// Shared by the local Node API and the Cloudflare Worker. Equipment existence
// is checked by each adapter against its own database after this validation.
export function validateBooking(raw: unknown, current?: Booking): Omit<Booking, 'id'> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new InputError('Body must be a JSON object');
  const input = raw as Record<string, unknown>;
  const keys = Object.keys(input);
  if (!keys.length || keys.some(k => !fields.includes(k as typeof fields[number]))) throw new InputError('Provide booking fields only; body must not be empty');
  const merged = { ...current, ...input } as Record<string, unknown>;
  const result: Record<string, string> = {};
  for (const field of fields) {
    if (typeof merged[field] !== 'string' || !(merged[field] as string).trim()) throw new InputError(`${field} must be a nonempty string`);
    result[field] = (merged[field] as string).trim();
  }
  if (result.equipmentId.length > 100 || result.borrowerName.length > 200 || result.purpose.length > 1000) throw new InputError('A text field exceeds its maximum length');
  for (const field of ['startAt', 'endAt']) {
    const original = result[field];
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(original)) throw new InputError(`${field} must be a UTC ISO timestamp`);
    const time = Date.parse(original);
    if (!Number.isFinite(time)) throw new InputError(`${field} must be a valid timestamp`);
    const canonical = new Date(time).toISOString();
    const expected = original.length === 20 ? original.replace('Z', '.000Z') : original;
    if (canonical !== expected) throw new InputError(`${field} must be a real calendar timestamp`);
    result[field] = canonical;
  }
  if (result.startAt >= result.endAt) throw new InputError('startAt must be before endAt');
  return result as Omit<Booking, 'id'>;
}
