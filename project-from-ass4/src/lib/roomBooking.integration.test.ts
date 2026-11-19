import { describe, it, expect } from 'vitest';
import { rooms } from '@/data/rooms';
import { checkAvailability, SIMULATED_NOW_MINUTES } from '@/lib/availability';
import { filterRooms } from '@/lib/roomFilter';

const roomByName = (name: string) => {
  const room = rooms.find((r) => r.name === name);
  if (!room) throw new Error(`Missing room ${name}`);
  return room;
};

describe('integration: real room data with production availability rules', () => {
  const a101 = roomByName('A101');

  it('accepts an exactly 120-minute booking when all other conditions hold', () => {
    const result = checkAvailability(a101, 840, 960, SIMULATED_NOW_MINUTES);
    expect(result.available).toBe(true);
    expect(result.reasons).toHaveLength(0);
  });

  it('rejects a 121-minute booking', () => {
    const result = checkAvailability(a101, 840, 961, SIMULATED_NOW_MINUTES);
    expect(result.available).toBe(false);
    expect(result.reasons).toHaveLength(1);
    expect(result.reasons[0]).toContain('120');
  });

  it('accepts a booking touching the end of an existing booking', () => {
    const result = checkAvailability(a101, 840, 900, SIMULATED_NOW_MINUTES);
    expect(result.available).toBe(true);
  });

  it('accepts a booking touching the start of an existing booking', () => {
    const result = checkAvailability(a101, 960, 1020, SIMULATED_NOW_MINUTES);
    expect(result.available).toBe(true);
  });

  it('rejects a booking overlapping an existing interval and names it', () => {
    const result = checkAvailability(a101, 800, 860, SIMULATED_NOW_MINUTES);
    expect(result.available).toBe(false);
    expect(result.reasons[0]).toContain('13:00\u201314:00');
  });

  it('a room selected through the capacity filter is then checked against its own bookings', () => {
    const matching = filterRooms(rooms, { attendees: 40, equipment: [] });
    const selected = matching.find((r) => r.name === 'A101');
    expect(selected).toBeDefined();
    const result = checkAvailability(selected ?? null, 840, 900, SIMULATED_NOW_MINUTES);
    expect(result.available).toBe(true);
  });

  it('rejects a booking starting exactly at the fixed simulated time (12:00)', () => {
    const result = checkAvailability(a101, 720, 780, SIMULATED_NOW_MINUTES);
    expect(result.available).toBe(false);
    expect(result.reasons).toEqual(['Start time must be after the current time.']);
  });

  it('checking availability across all real rooms leaves the room data unchanged', () => {
    const snapshot = structuredClone(rooms);
    const intervals: [number, number][] = [
      [720, 780],
      [840, 960],
      [840, 961],
      [800, 860],
      [900, 960],
      [1380, 1440],
    ];

    for (const room of rooms) {
      for (const [start, end] of intervals) {
        checkAvailability(room, start, end, SIMULATED_NOW_MINUTES);
      }
    }

    expect(rooms).toEqual(snapshot);
  });
});
