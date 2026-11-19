import { RotateCcw } from 'lucide-react';

interface ClearFiltersButtonProps {
  onClick: () => void;
  className?: string;
}

export default function ClearFiltersButton({ onClick, className = '' }: ClearFiltersButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors ${className}`}
    >
      <RotateCcw className="w-3.5 h-3.5" />
      Clear filters
    </button>
  );
}
