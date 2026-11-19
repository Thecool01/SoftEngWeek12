import { describe, it, expect } from 'vitest';
import { checkAvailability } from '@/lib/availability';
import { Room, Booking } from '@/data/rooms';

const DEFAULT_CURRENT_TIME = 540; // 09:00

function makeRoom(overrides: Partial<Room> = {}): Room {
  const defaults: Room = {
    id: 'test-room',
    name: 'Test Room',
    building: 'Test Building',
    capacity: 30,
    equipment: [],
    blocked: false,
    bookings: [{ id: 'b1', start: 600, end: 660, bookedBy: 'Prof. Test', purpose: 'Test Booking' }],
  };
  return { ...defaults, ...overrides };
}

function deepCloneBookings(bookings: Booking[]): Booking[] {
  return bookings.map((b) => ({ ...b }));
}

function expectBookingsUnchanged(bookings: Booking[], snapshot: Booking[]): void {
  expect(bookings).toEqual(snapshot);
  expect(bookings.length).toBe(snapshot.length);
  for (let i = 0; i < snapshot.length; i++) {
    expect(bookings[i].id).toBe(snapshot[i].id);
    expect(bookings[i].start).toBe(snapshot[i].start);
    expect(bookings[i].end).toBe(snapshot[i].end);
    expect(bookings[i].bookedBy).toBe(snapshot[i].bookedBy);
    expect(bookings[i].purpose).toBe(snapshot[i].purpose);
  }
}

describe('checkAvailability', () => {
  describe('AC4 – Overlap detection (touching endpoints allowed)', () => {
    it('T01: touching after existing booking (660–720) should be available', () => {
      const room = makeRoom();
      const result = checkAvailability(room, 660, 720, DEFAULT_CURRENT_TIME);
      expect(result.available).toBe(true);
      expect(result.reasons).toHaveLength(0);
      expect(result.reason).toBe('Room is available for the selected interval.');
    });

    it('T08: touching before existing booking (570–600) should be available', () => {
      const room = makeRoom();
      const result = checkAvailability(room, 570, 600, DEFAULT_CURRENT_TIME);
      expect(result.available).toBe(true);
      expect(result.reasons).toHaveLength(0);
      expect(result.reason).toBe('Room is available for the selected interval.');
    });

    it('T09: partial overlap with existing booking (630–690) should be unavailable', () => {
      const room = makeRoom();
      const snapshot = deepCloneBookings(room.bookings);
      const result = checkAvailability(room, 630, 690, DEFAULT_CURRENT_TIME);
      expect(result.available).toBe(false);
      expect(result.reasons).toHaveLength(1);
      expect(result.reasons[0]).toContain('Overlap');
      expect(result.reason).toBe(result.reasons[0]);

      expectBookingsUnchanged(room.bookings, snapshot);
      expect(room.blocked).toBe(false);
      expect(room.capacity).toBe(30);
      expect(room.id).toBe('test-room');
      expect(room.name).toBe('Test Room');
      expect(room.building).toBe('Test Building');
    });

    it('T10: contains existing booking (570–690) should be unavailable', () => {
      const room = makeRoom();
      const result = checkAvailability(room, 570, 690, DEFAULT_CURRENT_TIME);
      expect(result.available).toBe(false);
      expect(result.reasons).toHaveLength(1);
      expect(result.reasons[0]).toContain('Overlap');
      expect(result.reason).toBe(result.reasons[0]);
    });

    it('T11: inside existing booking (615–645) should be unavailable', () => {
      const room = makeRoom();
      const result = checkAvailability(room, 615, 645, DEFAULT_CURRENT_TIME);
      expect(result.available).toBe(false);
      expect(result.reasons).toHaveLength(1);
      expect(result.reasons[0]).toContain('Overlap');
      expect(result.reason).toBe(result.reasons[0]);
    });

    it('T12: identical interval to existing booking (600–660) should be unavailable', () => {
      const room = makeRoom();
      const result = checkAvailability(room, 600, 660, DEFAULT_CURRENT_TIME);
      expect(result.available).toBe(false);
      expect(result.reasons).toHaveLength(1);
      expect(result.reasons[0]).toContain('Overlap');
      expect(result.reason).toBe(result.reasons[0]);
    });

    it('T14: no bookings, partial overlap slot (630–690) should be available', () => {
      const room = makeRoom({ bookings: [] });
      const result = checkAvailability(room, 630, 690, DEFAULT_CURRENT_TIME);
      expect(result.available).toBe(true);
      expect(result.reasons).toHaveLength(0);
      expect(result.reason).toBe('Room is available for the selected interval.');
    });
  });

  describe('AC1 – Valid interval and start after current time', () => {
    it('T02: starts at current time (540–570) should be unavailable', () => {
      const room = makeRoom();
      const result = checkAvailability(room, 540, 570, DEFAULT_CURRENT_TIME);
      expect(result.available).toBe(false);
      expect(result.reasons).toHaveLength(1);
      expect(result.reasons[0]).toContain('current time');
      expect(result.reason).toBe(result.reasons[0]);
    });

    it('T03: zero duration (720–720) should be unavailable', () => {
      const room = makeRoom();
      const result = checkAvailability(room, 720, 720, DEFAULT_CURRENT_TIME);
      expect(result.available).toBe(false);
      expect(result.reasons.length).toBeGreaterThanOrEqual(1);
      expect(result.reasons.some((r) => r.includes('later than start time'))).toBe(true);
    });

    it('T04: reversed interval (750–720) should be unavailable', () => {
      const room = makeRoom();
      const result = checkAvailability(room, 750, 720, DEFAULT_CURRENT_TIME);
      expect(result.available).toBe(false);
      expect(result.reasons.length).toBeGreaterThanOrEqual(1);
      expect(result.reasons.some((r) => r.includes('later than start time'))).toBe(true);
    });

    it('T05: past day end (1380–1441) should be unavailable', () => {
      const room = makeRoom();
      const result = checkAvailability(room, 1380, 1441, DEFAULT_CURRENT_TIME);
      expect(result.available).toBe(false);
      expect(result.reasons.length).toBeGreaterThanOrEqual(1);
      expect(result.reasons.some((r) => r.includes('same day'))).toBe(true);
    });

    it('T16: starts before current time (539–570) should be unavailable', () => {
      const room = makeRoom();
      const result = checkAvailability(room, 539, 570, DEFAULT_CURRENT_TIME);
      expect(result.available).toBe(false);
      expect(result.reasons).toHaveLength(1);
      expect(result.reasons[0]).toContain('current time');
      expect(result.reason).toBe(result.reasons[0]);
    });

    it('T17: ends at day boundary (1380–1440) should be available', () => {
      const room = makeRoom();
      const result = checkAvailability(room, 1380, 1440, DEFAULT_CURRENT_TIME);
      expect(result.available).toBe(true);
      expect(result.reasons).toHaveLength(0);
      expect(result.reason).toBe('Room is available for the selected interval.');
    });
  });

  describe('AC2 – Maximum booking duration (120 minutes)', () => {
    it('T06: exactly 120 minutes (720–840) should be available', () => {
      const room = makeRoom();
      const result = checkAvailability(room, 720, 840, DEFAULT_CURRENT_TIME);
      expect(result.available).toBe(true);
      expect(result.reasons).toHaveLength(0);
      expect(result.reason).toBe('Room is available for the selected interval.');
    });

    it('T07: 121 minutes (720–841) should be unavailable', () => {
      const room = makeRoom();
      const result = checkAvailability(room, 720, 841, DEFAULT_CURRENT_TIME);
      expect(result.available).toBe(false);
      expect(result.reasons).toHaveLength(1);
      expect(result.reasons[0]).toContain('120');
      expect(result.reason).toBe(result.reasons[0]);
    });
  });

  describe('AC3 – Blocked rooms', () => {
    it('T13: blocked room (660–720) should be unavailable', () => {
      const room = makeRoom({ blocked: true, blockedReason: 'Under renovation' });
      const result = checkAvailability(room, 660, 720, DEFAULT_CURRENT_TIME);
      expect(result.available).toBe(false);
      expect(result.reasons).toHaveLength(1);
      expect(result.reasons[0]).toContain('blocked');
      expect(result.reason).toBe(result.reasons[0]);
    });
  });

  describe('AC5 – No mutation of existing booking data', () => {
    it('T15: available booking should not mutate existing booking data', () => {
      const originalBookings: Booking[] = [
        { id: 'b1', start: 600, end: 660, bookedBy: 'Prof. Test', purpose: 'Test Booking' },
      ];
      const snapshot = deepCloneBookings(originalBookings);
      const room = makeRoom({ bookings: originalBookings });

      const result = checkAvailability(room, 660, 720, DEFAULT_CURRENT_TIME);

      expect(result.available).toBe(true);
      expect(result.reasons).toHaveLength(0);
      expect(result.reason).toBe('Room is available for the selected interval.');

      expectBookingsUnchanged(originalBookings, snapshot);
      expectBookingsUnchanged(room.bookings, snapshot);
      expect(room.bookings).toBe(originalBookings);
      expect(room.blocked).toBe(false);
      expect(room.capacity).toBe(30);
      expect(room.id).toBe('test-room');
      expect(room.name).toBe('Test Room');
      expect(room.building).toBe('Test Building');
    });
  });
});
