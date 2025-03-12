import { useEffect, useRef, useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';

export interface DropdownOption {
  id: string;
  label: string;
}

interface DropdownProps {
  options: DropdownOption[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  placeholder?: string;
  allOptionLabel?: string;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  optionClassName?: string;
}

export function Dropdown({
  options,
  selectedId,
  onSelect,
  placeholder = 'Select an option',
  allOptionLabel = 'All',
  className = '',
  buttonClassName = '',
  menuClassName = '',
  optionClassName = '',
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Find the selected option label
  const selectedOption = options.find((option) => option.id === selectedId);
  const displayText = selectedId ? selectedOption?.label : allOptionLabel;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (id: string | null) => {
    onSelect(id);
    setIsOpen(false);
  };

  return (
    <div
      className={`relative inline-block text-left ${className}`}
      ref={dropdownRef}
    >
      <div>
        <button
          type="button"
          className={`inline-flex w-full justify-between items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${buttonClassName}`}
          aria-expanded={isOpen}
          aria-haspopup="true"
          onClick={() => setIsOpen(!isOpen)}
        >
          {displayText || placeholder}
          <FiChevronDown className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {isOpen && (
        <div
          className={`absolute right-0 z-50 mt-1 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${menuClassName}`}
          role="menu"
          aria-orientation="vertical"
        >
          <div className="py-1" role="none">
            <button
              onClick={() => handleSelect(null)}
              className={`block w-full text-left px-4 py-2 text-sm ${
                selectedId === null
                  ? 'bg-blue-100 text-blue-800'
                  : 'text-gray-700 hover:bg-gray-100'
              } ${optionClassName}`}
              role="menuitem"
            >
              {allOptionLabel}
            </button>

            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleSelect(option.id)}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  selectedId === option.id
                    ? 'bg-blue-100 text-blue-800'
                    : 'text-gray-700 hover:bg-gray-100'
                } ${optionClassName}`}
                role="menuitem"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
