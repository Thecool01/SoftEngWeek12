import { AlertCircle, Filter, Users } from 'lucide-react';
import ClearFiltersButton from '@/components/ClearFiltersButton';

interface RoomFilterPanelProps {
  attendeesInput: string;
  onAttendeesChange: (value: string) => void;
  attendeesError: string | null;
  equipmentOptions: string[];
  selectedEquipment: string[];
  onToggleEquipment: (item: string) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export default function RoomFilterPanel({
  attendeesInput,
  onAttendeesChange,
  attendeesError,
  equipmentOptions,
  selectedEquipment,
  onToggleEquipment,
  hasActiveFilters,
  onClearFilters,
}: RoomFilterPanelProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3 mb-5">
        <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-600" />
          Find a Room
        </h2>
        {hasActiveFilters && <ClearFiltersButton onClick={onClearFilters} />}
      </div>

      <div className="mb-5">
        <label
          htmlFor="attendees"
          className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5"
        >
          <Users className="w-4 h-4 text-slate-400" />
          Number of attendees
        </label>
        <input
          id="attendees"
          type="number"
          inputMode="numeric"
          min={1}
          step={1}
          value={attendeesInput}
          onChange={(e) => onAttendeesChange(e.target.value)}
          aria-invalid={attendeesError !== null}
          aria-describedby={attendeesError ? 'attendees-error' : undefined}
          className={`w-full sm:max-w-xs px-4 py-2.5 rounded-xl border text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
            attendeesError ? 'border-red-400' : 'border-slate-300'
          }`}
        />
        {attendeesError && (
          <p id="attendees-error" className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {attendeesError}
          </p>
        )}
      </div>

      <fieldset>
        <legend className="block text-sm font-medium text-slate-700 mb-2">Required equipment</legend>
        <div className="flex flex-wrap gap-2">
          {equipmentOptions.map((item) => {
            const checked = selectedEquipment.includes(item);
            return (
              <label
                key={item}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm font-medium cursor-pointer transition-all ${
                  checked
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleEquipment(item)}
                  className="w-4 h-4 accent-blue-600"
                />
                {item}
              </label>
            );
          })}
        </div>
        <p className="text-xs text-slate-400 mt-2">
          A room must have every selected item. Leave all unchecked to ignore equipment.
        </p>
      </fieldset>
    </div>
  );
}
