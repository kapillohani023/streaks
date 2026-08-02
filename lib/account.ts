/**
 * Confirmation phrase for the irreversible account action. It lives here rather
 * than beside the server action because a `"use server"` module may only export
 * async functions, and the client needs this to arm its button.
 *
 * Compared trimmed and lower-cased on both sides — see `assertConfirmed`.
 */
export const DELETE_CONFIRMATION = "delete my account";
