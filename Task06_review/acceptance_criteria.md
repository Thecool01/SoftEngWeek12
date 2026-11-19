# Smart Campus — Practice #11 acceptance criteria

AC1. Existing availability and overlap rules remain unchanged.
AC2. Explanation agrees with the deterministic result; no invented booking details.
AC3. Empty, malformed, or overly long input is rejected.
AC4. API timeout, error, or unavailable key produces a safe fallback.
AC5. Student can distinguish the generated explanation from the confirmed availability status.

Additional specified contract: Inputs are room label, start/end, isAvailable, reasonCode. Output must be { explanation: string }, at most two sentences, validated. No database, authentication, live API, or personal data. Existing checker decides availability. Read-only review only.

Existing project booking rules: reject invalid or past intervals; maximum 120 minutes; blocked rooms unavailable; overlapping intervals prohibited (touching allowed); no mutation of bookings; clear UI feedback.
