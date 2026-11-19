/**
 * Practice #11: classroom-only mock explanation adapter.
 * No network requests, API keys, personal information, or booking mutations.
 * The caller supplies a decision already made by checkAvailability().
 */
export type ExplanationReasonCode =
  | 'AVAILABLE'
  | 'OVERLAP'
  | 'ROOM_BLOCKED'
  | 'INVALID_INTERVAL'
  | 'PAST_START'
  | 'DURATION_LIMIT'
  | 'INVALID_TIME'
  | 'UNAVAILABLE';

export interface ExplanationRequest {
  roomLabel: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  reasonCode: ExplanationReasonCode;
}

export interface ExplanationResponse {
  explanation: string;
}

/** Map the checker result without changing the checker's return type or rules. */
export function getExplanationReasonCode(result: {
  available: boolean;
  reasons: readonly string[];
}): ExplanationReasonCode {
  if (result.available) return 'AVAILABLE';

  const firstReason = result.reasons[0] ?? '';
  if (firstReason.startsWith('Overlaps existing booking')) return 'OVERLAP';
  if (firstReason.startsWith('Room is blocked')) return 'ROOM_BLOCKED';
  if (firstReason.startsWith('End time must be later')) return 'INVALID_INTERVAL';
  if (firstReason.startsWith('Start time must be after')) return 'PAST_START';
  if (firstReason.startsWith('Booking cannot be longer')) return 'DURATION_LIMIT';
  if (firstReason.startsWith('Enter both a start')) return 'INVALID_TIME';
  return 'UNAVAILABLE';
}

const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$|^24:00$/;
const MAX_ROOM_LABEL_LENGTH = 64;
const MAX_EXPLANATION_LENGTH = 240;

function validateRequest(request: ExplanationRequest): void {
  if (
    !request ||
    typeof request.roomLabel !== 'string' ||
    request.roomLabel.trim().length === 0 ||
    request.roomLabel.length > MAX_ROOM_LABEL_LENGTH ||
    typeof request.startTime !== 'string' ||
    typeof request.endTime !== 'string' ||
    !TIME_PATTERN.test(request.startTime) ||
    !TIME_PATTERN.test(request.endTime) ||
    request.startTime === '24:00' ||
    typeof request.isAvailable !== 'boolean' ||
    ![
      'AVAILABLE', 'OVERLAP', 'ROOM_BLOCKED', 'INVALID_INTERVAL',
      'PAST_START', 'DURATION_LIMIT', 'INVALID_TIME', 'UNAVAILABLE',
    ].includes(request.reasonCode) ||
    (request.isAvailable !== (request.reasonCode === 'AVAILABLE'))
  ) {
    throw new Error('Invalid structured explanation request.');
  }

  // F02: an AVAILABLE decision cannot describe a reversed or overlong interval.
  // This is a contract check, not a replacement for checkAvailability().
  if (request.isAvailable) {
    const start = Number(request.startTime.slice(0, 2)) * 60 + Number(request.startTime.slice(3));
    const end = Number(request.endTime.slice(0, 2)) * 60 + Number(request.endTime.slice(3));
    if (end <= start || end - start > 120) {
      throw new Error('Inconsistent available interval.');
    }
  }
}

/**
 * F01: Strict mock-mode output contract. An answer must match the explanation
 * built from the authoritative reason code, not just the Available/Unavailable
 * word. A future real LLM would require a separately designed semantic validator.
 */
export function isValidExplanationResponse(
  response: unknown,
  request: ExplanationRequest
): response is ExplanationResponse {
  try {
    validateRequest(request);
  } catch {
    return false;
  }
  if (typeof response !== 'object' || response === null || !('explanation' in response)) {
    return false;
  }
  const value = (response as { explanation: unknown }).explanation;
  if (typeof value !== 'string') return false;
  const text = value.trim();
  const sentenceCount = text.split(/[.!?]+/).filter((part) => part.trim().length > 0).length;
  if (!text || text.length > MAX_EXPLANATION_LENGTH || sentenceCount > 2) return false;
  return text === buildMockExplanation(request);
}

/** Builds the classroom mock explanation from already verified structured data. */
function buildMockExplanation(request: ExplanationRequest): string {
  const room = request.roomLabel.trim();
  const reasonText: Record<ExplanationReasonCode, string> = {
    AVAILABLE: `Room ${room} is available from ${request.startTime} to ${request.endTime} because there are no conflicting bookings.`,
    OVERLAP: `Room ${room} is unavailable because the requested interval overlaps an existing booking.`,
    ROOM_BLOCKED: `Room ${room} is unavailable because it is blocked.`,
    INVALID_INTERVAL: `Room ${room} is unavailable because the selected time interval is invalid.`,
    PAST_START: `Room ${room} is unavailable because the start time must be after the simulated current time.`,
    DURATION_LIMIT: `Room ${room} is unavailable because the requested duration exceeds 120 minutes.`,
    INVALID_TIME: `Room ${room} is unavailable because valid start and end times are required.`,
    UNAVAILABLE: `Room ${room} is unavailable under the current booking rules.`,
  };
  return reasonText[request.reasonCode];
}

/** Produces explanatory text from structured facts, without an LLM API call. */
export async function mockExplainAvailability(
  request: ExplanationRequest
): Promise<ExplanationResponse> {
  validateRequest(request);
  return { explanation: buildMockExplanation(request) };
}

export function fallbackExplanation(isAvailable: boolean): string {
  return isAvailable
    ? 'The rule-based result is Available. The explanation is temporarily unavailable.'
    : 'The rule-based result is Unavailable. The explanation is temporarily unavailable.';
}

/**
 * Wraps a mock (or future server-side) adapter with response checks and a timeout.
 * The optional adapter argument is a test seam: it can simulate API failure or delay
 * without network calls or extra dependencies.
 */
export async function explainAvailabilitySafely(
  request: ExplanationRequest,
  adapter: (request: ExplanationRequest) => Promise<unknown> = mockExplainAvailability,
  timeoutMs = 2000
): Promise<{ explanation: string; usedFallback: boolean }> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    // Validate BEFORE calling the adapter, so invalid data is never forwarded.
    validateRequest(request);
    const response = await Promise.race([
      adapter(request),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('Explanation timeout.')), timeoutMs);
      }),
    ]);
    if (!isValidExplanationResponse(response, request)) {
      throw new Error('Invalid explanation response.');
    }
    return { explanation: response.explanation, usedFallback: false };
  } catch {
    return {
      explanation: fallbackExplanation(request?.isAvailable === true),
      usedFallback: true,
    };
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}
