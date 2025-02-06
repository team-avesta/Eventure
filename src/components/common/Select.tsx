interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  error?: string;
}

export function Select({
  label,
  options,
  error,
  className = '',
  ...props
}: SelectProps) {
  return (
    <>
      <label
        htmlFor={props.id}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      <div className="relative">
        <select
          {...props}
          className={`appearance-none bg-white relative w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md shadow-sm cursor-pointer 
            hover:border-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary
            ${error ? 'border-red-500' : ''}
            ${className}`}
        >
          {options.map(({ value, label }) => (
            <option key={value} value={value} className="py-1">
              {label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            data-testid="select-dropdown-icon"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </>
  );
}
