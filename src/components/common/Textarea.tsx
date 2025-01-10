import { ChangeEvent } from 'react';

interface TextareaProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
}

export function Textarea({
  id,
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
  rows = 3,
}: TextareaProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <textarea
        id={id}
        name={id}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="mt-4 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
      />
    </div>
  );
}
