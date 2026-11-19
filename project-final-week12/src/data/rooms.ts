export interface Booking {
  id: string;
  start: number;
  end: number;
  bookedBy: string;
  purpose: string;
}

export interface Room {
  id: string;
  name: string;
  building: string;
  capacity: number;
  equipment: string[];
  blocked: boolean;
  blockedReason?: string;
  bookings: Booking[];
}

export const rooms: Room[] = [
  {
    id: 'room-a101',
    name: 'A101',
    building: 'Engineering Block',
    capacity: 40,
    equipment: ['Wi-Fi', 'Whiteboard'],
    blocked: false,
    bookings: [
      { id: 'b1', start: 540, end: 600, bookedBy: 'Dr. Chen', purpose: 'Faculty Meeting' },
      { id: 'b2', start: 780, end: 840, bookedBy: 'CS Club', purpose: 'Workshop' },
      { id: 'b3', start: 1020, end: 1080, bookedBy: 'Study Group', purpose: 'Review Session' },
    ],
  },
  {
    id: 'room-b220',
    name: 'B220',
    building: 'Science Wing',
    capacity: 25,
    equipment: ['Wi-Fi', 'Projector'],
    blocked: false,
    bookings: [
      { id: 'b4', start: 600, end: 660, bookedBy: 'Prof. Rivera', purpose: 'Guest Lecture' },
      { id: 'b5', start: 900, end: 960, bookedBy: 'Chem Society', purpose: 'Lab Prep' },
    ],
  },
  {
    id: 'room-c310',
    name: 'C310',
    building: 'Library Tower',
    capacity: 12,
    equipment: ['Wi-Fi', 'Whiteboard'],
    blocked: true,
    blockedReason: 'Under renovation until Oct 15',
    bookings: [],
  },
  {
    id: 'room-d105',
    name: 'D105',
    building: 'Arts Center',
    capacity: 60,
    equipment: ['Wi-Fi', 'Projector', 'Whiteboard'],
    blocked: false,
    bookings: [
      { id: 'b6', start: 480, end: 540, bookedBy: 'Drama Dept', purpose: 'Rehearsal' },
    ],
  },
];
