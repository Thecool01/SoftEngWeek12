import { Lock } from 'lucide-react';
import { Booking, Room } from '@/data/rooms';
import { fmt } from '@/lib/time';

interface RoomBookingsCardProps {
  room: Room;
}

export default function RoomBookingsCard({ room }: RoomBookingsCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
      <h2 className="text-base font-semibold text-slate-900 mb-1">Existing Bookings — {room.name}</h2>
      <p className="text-xs text-slate-400 mb-4">
        {room.building} · Capacity {room.capacity}
      </p>
      {room.blocked ? (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-3">
          <Lock className="w-4 h-4 shrink-0" />
          {room.blockedReason}
        </div>
      ) : room.bookings.length === 0 ? (
        <p className="text-sm text-slate-400">No existing bookings for this room.</p>
      ) : (
        <ul className="space-y-2">
          {room.bookings.map((b: Booking) => (
            <li
              key={b.id}
              className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-100"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{b.purpose}</p>
                <p className="text-xs text-slate-400 truncate">{b.bookedBy}</p>
              </div>
              <span className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-md shrink-0">
                {fmt(b.start)}–{fmt(b.end)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
