import { useState } from 'react';
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { Room } from '@/data/rooms';
import { AvailabilityResult } from '@/lib/availability';
import { fmt } from '@/lib/time';
import {
  getExplanationReasonCode,
  explainAvailabilitySafely,
} from '@/lib/availabilityExplanation';

interface AvailabilityResultPanelProps {
  room: Room | null;
  attendeesValid: boolean;
  result: AvailabilityResult | null;
  startMin: number;
  endMin: number;
}

/** Keeps AI text separate from the authoritative availability status. */
function ExplainAvailability({
  room,
  result,
  startMin,
  endMin,
}: {
  room: Room;
  result: AvailabilityResult;
  startMin: number;
  endMin: number;
}) {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [usedFallback, setUsedFallback] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleExplain() {
    if (loading) return;
    setLoading(true);
    setExplanation(null);

    const request = {
      roomLabel: room.name,
      startTime: fmt(startMin),
      endTime: fmt(endMin),
      isAvailable: result.available,
      reasonCode: getExplanationReasonCode(result),
    };

    try {
      const response = await explainAvailabilitySafely(request);
      setExplanation(response.explanation);
      setUsedFallback(response.usedFallback);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 border-t border-slate-100 pt-4">
      <button
        type="button"
        onClick={handleExplain}
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Explaining...' : 'Explain availability'}
      </button>
      {explanation !== null && (
        <div role="status" className="mt-3 rounded-lg bg-blue-50 p-3 text-sm text-slate-700">
          <p className="mb-1 font-semibold text-blue-900">
            {usedFallback ? 'Rule-based fallback explanation' : 'Mock AI explanation'}
          </p>
          <p>{explanation}</p>
        </div>
      )}
      <p className="mt-2 text-xs text-slate-500">
        Demo mock mode (no API call). The rule-based availability status above remains authoritative.
      </p>
    </div>
  );
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
      {room && attendeesValid && result && (
        <ExplainAvailability
          key={`${room.id}:${startMin}:${endMin}:${result.available}:${result.reasons.join('|')}`}
          room={room}
          result={result}
          startMin={startMin}
          endMin={endMin}
        />
      )}
      <p className="text-xs text-slate-400 mt-4 text-center border-t border-slate-100 pt-3">
        This is a prototype — no booking is saved or confirmed.
      </p>
    </div>
  );
}
