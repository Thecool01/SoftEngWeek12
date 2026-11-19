import { describe, it, expect } from 'vitest';
import { rooms } from '@/data/rooms';
import { checkAvailability, SIMULATED_NOW_MINUTES } from '@/lib/availability';

describe('checkAvailability with invalid times', () => {
  const a101 = rooms[0];

  it('never reports Available when the start time is missing (NaN)', () => {
    const result = checkAvailability(a101, NaN, 900, SIMULATED_NOW_MINUTES);
    expect(result.available).toBe(false);
    expect(result.reasons).toEqual(['Enter both a start and an end time.']);
  });

  it('never reports Available when the end time is missing (NaN)', () => {
    const result = checkAvailability(a101, 840, NaN, SIMULATED_NOW_MINUTES);
    expect(result.available).toBe(false);
    expect(result.reasons).toEqual(['Enter both a start and an end time.']);
  });

  it('does not change the room or its bookings for invalid input', () => {
    const before = JSON.stringify(a101);
    checkAvailability(a101, NaN, NaN, SIMULATED_NOW_MINUTES);
    expect(JSON.stringify(a101)).toBe(before);
  });
});
