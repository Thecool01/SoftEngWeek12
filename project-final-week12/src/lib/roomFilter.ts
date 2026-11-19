import { Room } from '@/data/rooms';

export interface RoomFilter {
  attendees: number | null;
  equipment: string[];
}

export function parseAttendees(raw: string): number | null {
  const trimmed = raw.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const value = Number(trimmed);
  return value > 0 ? value : null;
}

export function getEquipmentOptions(rooms: Room[]): string[] {
  return Array.from(new Set(rooms.flatMap((room) => room.equipment))).sort();
}

export function filterRooms(rooms: Room[], filter: RoomFilter): Room[] {
  return rooms.filter(
    (room) =>
      (filter.attendees === null || room.capacity >= filter.attendees) &&
      filter.equipment.every((item) => room.equipment.includes(item))
  );
}
