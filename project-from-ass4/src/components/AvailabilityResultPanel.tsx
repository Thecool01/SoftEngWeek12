import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { Room } from '@/data/rooms';
import { AvailabilityResult } from '@/lib/availability';
import { fmt } from '@/lib/time';

interface AvailabilityResultPanelProps {
  room: Room | null;
  attendeesValid: boolean;
  result: AvailabilityResult | null;
  startMin: number;
  endMin: number;
}

export default function AvailabilityResultPanel({
  room,
  attendeesValid,
  result,
  startMin,
  endMin,
}: AvailabilityResultPanelProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
      <h2 className="text-base font-semibold text-slate-900 mb-4">Availability Result</h2>
      {!room ? (
        <p className="text-sm text-slate-500 text-center py-4">
          No matching room is selected, so there is no availability to show.
        </p>
      ) : !attendeesValid ? (
        <p className="text-sm text-slate-500 text-center py-4">
          Enter a valid number of attendees to check availability.
        </p>
      ) : !result ? (
        <p className="text-sm text-slate-500 text-center py-4">
          Enter a valid start and end time to check availability.
        </p>
      ) : result.available ? (
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <p className="text-xl font-bold text-emerald-700">Available</p>
          <p className="text-sm text-slate-500 mt-1">
            {room.name} is free from {fmt(startMin)} to {fmt(endMin)}
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-3">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-xl font-bold text-red-700">Unavailable</p>
          <ul className="mt-3 space-y-1.5 w-full">
            {result.reasons.map((r, i) => (
              <li
                key={i}
                className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 text-left flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-xs text-slate-400 mt-4 text-center border-t border-slate-100 pt-3">
        This is a prototype — no booking is saved or confirmed.
      </p>
    </div>
  );
}
