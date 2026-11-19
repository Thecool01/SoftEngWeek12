import { describe, it, expect } from 'vitest';
import { rooms } from '@/data/rooms';
import { checkAvailability, SIMULATED_NOW_MINUTES } from '@/lib/availability';
import { filterRooms, getEquipmentOptions, parseAttendees } from '@/lib/roomFilter';

const roomByName = (name: string) => {
  const room = rooms.find((r) => r.name === name);
  if (!room) throw new Error(`Missing room ${name}`);
  return room;
};

const namesOf = (list: { name: string }[]) => list.map((r) => r.name).sort();

describe('parseAttendees', () => {
  it('accepts positive whole numbers, ignoring surrounding spaces', () => {
    expect(parseAttendees('30')).toBe(30);
    expect(parseAttendees(' 12 ')).toBe(12);
  });

  it('rejects zero, negatives, decimals, text and blanks', () => {
    expect(parseAttendees('0')).toBeNull();
    expect(parseAttendees('-1')).toBeNull();
    expect(parseAttendees('2.5')).toBeNull();
    expect(parseAttendees('abc')).toBeNull();
    expect(parseAttendees('')).toBeNull();
  });
});

describe('getEquipmentOptions', () => {
  it('lists each equipment item once, sorted', () => {
    expect(getEquipmentOptions(rooms)).toEqual(['Projector', 'Whiteboard', 'Wi-Fi']);
  });
});

describe('filterRooms', () => {
  describe('F1 – capacity', () => {
    it('includes a room whose capacity exactly matches the attendees', () => {
      const result = filterRooms(rooms, { attendees: 40, equipment: [] });
      expect(namesOf(result)).toContain('A101');
    });

    it('excludes a room whose capacity is one less than the attendees', () => {
      const result = filterRooms(rooms, { attendees: 41, equipment: [] });
      expect(namesOf(result)).not.toContain('A101');
      expect(namesOf(result)).toContain('D105');
    });

    it('returns every room when attendees is null (no capacity restriction)', () => {
      expect(filterRooms(rooms, { attendees: null, equipment: [] })).toHaveLength(rooms.length);
    });
  });

  describe('F2 – equipment', () => {
    it('requires ALL selected items', () => {
      const result = filterRooms(rooms, { attendees: null, equipment: ['Wi-Fi', 'Projector'] });
      expect(namesOf(result)).toEqual(['B220', 'D105']);
    });

    it('returns every room when no equipment is selected', () => {
      expect(filterRooms(rooms, { attendees: null, equipment: [] })).toHaveLength(rooms.length);
    });

    it('returns no rooms when an item no room has is selected', () => {
      expect(filterRooms(rooms, { attendees: null, equipment: ['Microphone'] })).toHaveLength(0);
    });
  });

  describe('F3 – blocked rooms stay visible but unavailable', () => {
    it('keeps a matching blocked room in results and reports it as unavailable', () => {
      const result = filterRooms(rooms, { attendees: 10, equipment: ['Wi-Fi'] });
      const c310 = result.find((r) => r.name === 'C310');
      expect(c310).toBeDefined();
      expect(c310?.blocked).toBe(true);

      const check = checkAvailability(c310 ?? null, 840, 900, SIMULATED_NOW_MINUTES);
      expect(check.available).toBe(false);
      expect(check.reasons.some((r) => r.includes('blocked'))).toBe(true);
    });
  });

  describe('demonstration scenarios', () => {
    it('Scenario A: 30 attendees with Wi-Fi and Projector matches only D105', () => {
      const result = filterRooms(rooms, { attendees: 30, equipment: ['Wi-Fi', 'Projector'] });
      expect(namesOf(result)).toEqual(['D105']);
    });

    it('Scenario B: 100 attendees matches no room', () => {
      expect(filterRooms(rooms, { attendees: 100, equipment: [] })).toHaveLength(0);
    });

    it('Scenario C: A101 is available at 15:00–16:00 but B220 is not', () => {
      const matching = filterRooms(rooms, { attendees: 20, equipment: ['Wi-Fi'] });
      expect(namesOf(matching)).toEqual(['A101', 'B220', 'D105']);

      const a101 = checkAvailability(roomByName('A101'), 900, 960, SIMULATED_NOW_MINUTES);
      expect(a101.available).toBe(true);

      const b220 = checkAvailability(roomByName('B220'), 900, 960, SIMULATED_NOW_MINUTES);
      expect(b220.available).toBe(false);
      expect(b220.reasons[0]).toContain('Overlaps existing booking');
    });

    it('Scenario D: selecting blocked C310 for 14:00–15:00 is unavailable', () => {
      const matching = filterRooms(rooms, { attendees: 10, equipment: ['Wi-Fi'] });
      expect(namesOf(matching)).toContain('C310');

      const c310 = checkAvailability(roomByName('C310'), 840, 900, SIMULATED_NOW_MINUTES);
      expect(c310.available).toBe(false);
      expect(c310.reasons[0]).toContain('blocked');
    });
  });
});
