import { Booking, Room } from '@/data/rooms';
import { fmt, MINUTES_PER_DAY } from '@/lib/time';

export const MAX_BOOKING_MINUTES = 120;
export const SIMULATED_NOW_MINUTES = 720;

export interface AvailabilityResult {
  available: boolean;
  reason: string;
  reasons: string[];
}

function overlap(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd;
}

function unavailable(message: string): AvailabilityResult {
  return { available: false, reason: message, reasons: [message] };
}

export function checkAvailability(
  room: Room | null,
  start: number,
  end: number,
  currentTime: number
): AvailabilityResult {
  if (!room) return unavailable('Please select a room.');
  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    return unavailable('Enter both a start and an end time.');
  }

  const reasons: string[] = [];

  // AC1: valid interval, start after current time
  if (start < 0 || end > MINUTES_PER_DAY || start >= end) {
    reasons.push('End time must be later than start time and within the same day (00:00\u201324:00).');
  }
  if (start <= currentTime) {
    reasons.push('Start time must be after the current time.');
  }

  // AC2: max duration
  if (end - start > MAX_BOOKING_MINUTES) {
    reasons.push(`Booking cannot be longer than ${MAX_BOOKING_MINUTES} minutes.`);
  }

  // AC3: room blocked
  if (room.blocked) {
    reasons.push(room.blockedReason ? `Room is blocked: ${room.blockedReason}` : 'Room is blocked.');
  }

  // AC4: overlap with existing bookings (touching endpoints allowed)
  const overlapping = room.bookings.filter((b: Booking) => overlap(start, end, b.start, b.end));
  if (overlapping.length > 0) {
    reasons.push(
      'Overlaps existing booking' +
        (overlapping.length > 1 ? 's' : '') +
        ': ' +
        overlapping.map((b) => `${fmt(b.start)}\u2013${fmt(b.end)}`).join(', ')
    );
  }

  return {
    available: reasons.length === 0,
    reason: reasons[0] ?? 'Room is available for the selected interval.',
    reasons,
  };
}
