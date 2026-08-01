/**
 * Timezone primitives built on Intl — no date library needed.
 *
 * The server runs in UTC, so anything that answers "what day is it for this
 * user?" or "is it 19:30 for them yet?" has to go through here with the
 * user's IANA zone. Everything below is DST-correct because Intl resolves the
 * offset for the specific instant rather than assuming a fixed one.
 */

export const DEFAULT_TIMEZONE = "UTC";

/** Whether a string is a zone this runtime's ICU data actually knows. */
export function isValidTimezone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

function safeZone(timeZone: string): string {
  return isValidTimezone(timeZone) ? timeZone : DEFAULT_TIMEZONE;
}

/** The zone's UTC offset in ms at a given instant (positive = ahead of UTC). */
function offsetMsAt(timeZone: string, at: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(at);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);

  const asUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second")
  );
  // Drop sub-second precision on both sides so the difference is a clean offset.
  return asUtc - Math.floor(at.getTime() / 1000) * 1000;
}

/**
 * The UTC instant at which the given wall-clock time occurs in `timeZone`.
 * Refines once because the offset used for the guess can itself change across
 * a DST boundary.
 */
function wallClockToUtc(
  timeZone: string,
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0
): Date {
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  const firstOffset = offsetMsAt(timeZone, new Date(guess));
  let result = guess - firstOffset;
  const secondOffset = offsetMsAt(timeZone, new Date(result));
  if (secondOffset !== firstOffset) result = guess - secondOffset;
  return new Date(result);
}

/** The user's local calendar date as "YYYY-MM-DD". */
export function localDateKey(timeZone: string, at: Date = new Date()): string {
  // en-CA formats as YYYY-MM-DD, which is exactly the key we want.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: safeZone(timeZone),
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(at);
}

/**
 * The user's local date collapsed to midnight UTC — a stable, comparable
 * stamp for "which local day was this?" (what `lastRemindedOn` stores).
 */
export function localDateStamp(timeZone: string, at: Date = new Date()): Date {
  return new Date(`${localDateKey(timeZone, at)}T00:00:00.000Z`);
}

/** Minutes elapsed since local midnight, 0–1439. */
export function localMinutesOfDay(
  timeZone: string,
  at: Date = new Date()
): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: safeZone(timeZone),
    hourCycle: "h23",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(at);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);

  return get("hour") * 60 + get("minute");
}

/**
 * [start, end) of the user's local day, as UTC instants — for querying
 * timestamp columns that hold real instants.
 */
export function localDayBounds(
  timeZone: string,
  at: Date = new Date()
): { start: Date; end: Date } {
  const zone = safeZone(timeZone);
  const [year, month, day] = localDateKey(zone, at).split("-").map(Number);
  const start = wallClockToUtc(zone, year, month, day);
  const end = wallClockToUtc(zone, year, month, day + 1);
  return { start, end };
}

/** "19:30" → 1170. Returns null for anything not a valid 24h HH:MM. */
export function parseReminderTime(time: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(time.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}
