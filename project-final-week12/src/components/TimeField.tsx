import { Clock } from 'lucide-react';

interface TimeFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  display: string;
}

export default function TimeField({ id, label, value, onChange, display }: TimeFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1.5"
      >
        <Clock className="w-4 h-4 text-slate-400" />
        {label}
      </label>
      <input
        id={id}
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
      />
      <p className="text-xs text-slate-400 mt-1.5">{display}</p>
    </div>
  );
}
