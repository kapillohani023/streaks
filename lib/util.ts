import { Streak } from "@/types/streak";
import { StreakEntry } from "@/types/streak-entry";

export const isCompletedToday = (streak: Streak) => {
  const today = new Date().toDateString();
  return streak.entries.some(
    (entry: StreakEntry) => entry.date.toDateString() === today
  );
};

export const getCompletedDates = (streak: Streak): Date[] =>
  streak.entries
    .filter((entry: StreakEntry) => entry.completed)
    .map((entry: StreakEntry) => entry.date);

/**
 * Number of consecutive completed days ending today (looking back up to a year).
 */
export const calculateCurrentStreak = (completedDates: Date[]): number => {
  const completedTimes = new Set(
    completedDates.map((date) => normalizeToMidnight(date).getTime())
  );

  const today = normalizeToMidnight(new Date());
  let count = 0;

  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    if (!completedTimes.has(date.getTime())) break;
    count++;
  }
  return count;
};

export const normalizeToMidnight = (date: Date): Date => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

const MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

export const formatJournalTitle = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const bytesToBase64 = (bytes: Uint8Array): string => {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
};

const base64ToBytes = (b64: string): Uint8Array => {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
};

const toCryptoBytes = (bytes: Uint8Array): Uint8Array<ArrayBuffer> => {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy;
};

const SALT_LEN = 16;
const IV_LEN = 12;
const PBKDF2_ITERATIONS = 200_000;

const deriveAesKey = async (
  passphrase: string,
  salt: Uint8Array
): Promise<CryptoKey> => {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    toCryptoBytes(new TextEncoder().encode(passphrase)),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: toCryptoBytes(salt),
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
};

export const encryptEntry = async (
  plaintext: string,
  passphrase: string
): Promise<string> => {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LEN));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LEN));
  const key = await deriveAesKey(passphrase, salt);
  const ct = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: toCryptoBytes(iv) },
      key,
      toCryptoBytes(new TextEncoder().encode(plaintext))
    )
  );
  const blob = new Uint8Array(salt.length + iv.length + ct.length);
  blob.set(salt, 0);
  blob.set(iv, salt.length);
  blob.set(ct, salt.length + iv.length);
  return bytesToBase64(blob);
};

export const decryptEntry = async (
  payload: string,
  passphrase: string
): Promise<string> => {
  const blob = base64ToBytes(payload);
  if (blob.length < SALT_LEN + IV_LEN) throw new Error("Invalid ciphertext");
  const salt = blob.slice(0, SALT_LEN);
  const iv = blob.slice(SALT_LEN, SALT_LEN + IV_LEN);
  const ct = blob.slice(SALT_LEN + IV_LEN);
  const key = await deriveAesKey(passphrase, salt);
  const pt = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: toCryptoBytes(iv) },
    key,
    toCryptoBytes(ct)
  );
  return new TextDecoder().decode(pt);
};
