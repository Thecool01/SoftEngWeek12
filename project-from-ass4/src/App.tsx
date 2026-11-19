import { useState, useMemo } from 'react';
import { CalendarClock, MapPin, AlertCircle } from 'lucide-react';
import { rooms } from '@/data/rooms';
import { checkAvailability, MAX_BOOKING_MINUTES, SIMULATED_NOW_MINUTES } from '@/lib/availability';
import { fmt, timeInputToMinutes } from '@/lib/time';
import { filterRooms, getEquipmentOptions, parseAttendees } from '@/lib/roomFilter';
import RoomFilterPanel from '@/components/RoomFilterPanel';
import RoomList from '@/components/RoomList';
import TimeField from '@/components/TimeField';
import AvailabilityResultPanel from '@/components/AvailabilityResultPanel';
import RoomBookingsCard from '@/components/RoomBookingsCard';

const DEFAULT_ATTENDEES = '1';
const EQUIPMENT_OPTIONS = getEquipmentOptions(rooms);

function App() {
  const [selectedRoomId, setSelectedRoomId] = useState<string>(rooms[0].id);
  const [startTime, setStartTime] = useState<string>('14:00');
  const [endTime, setEndTime] = useState<string>('15:00');
  const [attendeesInput, setAttendeesInput] = useState<string>(DEFAULT_ATTENDEES);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);

  const attendees = parseAttendees(attendeesInput);
  const attendeesError = attendees === null ? 'Enter a whole number of attendees, 1 or more.' : null;
  const hasActiveFilters = attendeesInput !== DEFAULT_ATTENDEES || selectedEquipment.length > 0;

  const filteredRooms = useMemo(
    () => filterRooms(rooms, { attendees, equipment: selectedEquipment }),
    [attendees, selectedEquipment]
  );

  const selectedRoom = filteredRooms.find((r) => r.id === selectedRoomId) ?? filteredRooms[0] ?? null;

  const startMin = timeInputToMinutes(startTime);
  const endMin = timeInputToMinutes(endTime);
  const timesValid = !isNaN(startMin) && !isNaN(endMin);

  const result = useMemo(() => {
    if (!selectedRoom || attendees === null || !timesValid) return null;
    return checkAvailability(selectedRoom, startMin, endMin, SIMULATED_NOW_MINUTES);
  }, [selectedRoom, attendees, timesValid, startMin, endMin]);

  const duration = timesValid ? endMin - startMin : 0;

  const toggleEquipment = (item: string) => {
    setSelectedEquipment((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const clearFilters = () => {
    setAttendeesInput(DEFAULT_ATTENDEES);
    setSelectedEquipment([]);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
              <CalendarClock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                Smart Campus Room Availability
              </h1>
              <p className="text-sm text-slate-500 hidden sm:block">
                Check whether a room is free for your desired time slot
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Controls */}
          <section className="lg:col-span-3 flex flex-col gap-6">
            <RoomFilterPanel
              attendeesInput={attendeesInput}
              onAttendeesChange={setAttendeesInput}
              attendeesError={attendeesError}
              equipmentOptions={EQUIPMENT_OPTIONS}
              selectedEquipment={selectedEquipment}
              onToggleEquipment={toggleEquipment}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={clearFilters}
            />

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
              <h2 className="text-base font-semibold text-slate-900 mb-5 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Check a Room
              </h2>

              <div className="mb-5">
                <span className="block text-sm font-medium text-slate-700 mb-2">
                  Select Room{filteredRooms.length > 0 && ` (${filteredRooms.length} matching)`}
                </span>
                <RoomList
                  rooms={filteredRooms}
                  selectedRoomId={selectedRoom?.id ?? null}
                  onSelect={setSelectedRoomId}
                  onClearFilters={clearFilters}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <TimeField
                  id="start-time"
                  label="Start Time"
                  value={startTime}
                  onChange={setStartTime}
                  display={fmt(startMin)}
                />
                <TimeField
                  id="end-time"
                  label="End Time"
                  value={endTime}
                  onChange={setEndTime}
                  display={fmt(endMin)}
                />
              </div>

              <div className="flex items-center gap-2 mb-5">
                <span className="text-sm text-slate-500">Duration:</span>
                <span
                  className={`text-sm font-semibold px-3 py-0.5 rounded-full ${
                    duration > MAX_BOOKING_MINUTES
                      ? 'text-red-700 bg-red-100'
                      : duration <= 0
                      ? 'text-slate-500 bg-slate-100'
                      : 'text-blue-700 bg-blue-100'
                  }`}
                >
                  {timesValid && duration > 0 ? `${duration} min` : '\u2013'}
                </span>
                {duration > MAX_BOOKING_MINUTES && (
                  <span className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Exceeds {MAX_BOOKING_MINUTES} min limit
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-500 border-t border-slate-100 pt-4">
                Simulated current time:{' '}
                <span className="font-semibold text-slate-900">{fmt(SIMULATED_NOW_MINUTES)}</span>
                <span className="block text-xs text-slate-400 mt-1">
                  Bookings must start after this time.
                </span>
              </p>
            </div>
          </section>

          {/* Right: Result + bookings */}
          <section className="lg:col-span-2 flex flex-col gap-6">
            <AvailabilityResultPanel
              room={selectedRoom}
              attendeesValid={attendees !== null}
              result={result}
              startMin={startMin}
              endMin={endMin}
            />
            {selectedRoom && <RoomBookingsCard room={selectedRoom} />}
          </section>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto px-4 sm:px-6 pb-8">
        <p className="text-center text-xs text-slate-400">
          Fictional data for prototype demonstration only.
        </p>
      </footer>
    </div>
  );
}

export default App;
