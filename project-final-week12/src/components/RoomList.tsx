import { Building2, Lock, Users } from 'lucide-react';
import { Room } from '@/data/rooms';
import ClearFiltersButton from '@/components/ClearFiltersButton';

interface RoomListProps {
  rooms: Room[];
  selectedRoomId: string | null;
  onSelect: (roomId: string) => void;
  onClearFilters: () => void;
}

export default function RoomList({ rooms, selectedRoomId, onSelect, onClearFilters }: RoomListProps) {
  if (rooms.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
        <p className="font-semibold text-slate-800">No rooms match your requirements</p>
        <p className="text-sm text-slate-500 mt-1">Try fewer attendees or fewer equipment items.</p>
        <ClearFiltersButton onClick={onClearFilters} className="mt-4" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {rooms.map((room) => {
        const isSelected = room.id === selectedRoomId;
        return (
          <button
            key={room.id}
            type="button"
            onClick={() => onSelect(room.id)}
            aria-pressed={isSelected}
            className={`text-left p-4 rounded-xl border-2 transition-all ${
              isSelected
                ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-100'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-slate-900">{room.name}</p>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <Building2 className="w-3 h-3 shrink-0" />
                  {room.building}
                </p>
              </div>
              {room.blocked ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full shrink-0">
                  <Lock className="w-3 h-3" />
                  Blocked
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                  <Users className="w-3 h-3" />
                  {room.capacity}
                </span>
              )}
            </div>
            <ul className="flex flex-wrap gap-1.5 mt-3">
              {room.equipment.map((item) => (
                <li key={item} className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                  {item}
                </li>
              ))}
            </ul>
          </button>
        );
      })}
    </div>
  );
}
