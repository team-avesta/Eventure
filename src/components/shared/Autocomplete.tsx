import { useState, useRef, useEffect } from 'react';

interface AutocompleteProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  className?: string;
  id?: string;
  name?: string;
}

export const Autocomplete = ({
  options,
  value,
  onChange,
  placeholder = 'Search...',
  label,
  required = false,
  className = '',
  id,
  name,
}: AutocompleteProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(value);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter options based on search
  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(search.toLowerCase())
  );

  // Reset highlight when options change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [search]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const handleSelect = (option: string) => {
    setSearch(option);
    onChange(option);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        ref={inputRef}
        type="text"
        id={id}
        name={name}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        className={`w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm ${className}`}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
      />

      {isOpen && filteredOptions.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          {filteredOptions.map((option, index) => {
            // Highlight matching text
            const matchIndex = option
              .toLowerCase()
              .indexOf(search.toLowerCase());
            const beforeMatch = option.slice(0, matchIndex);
            const match = option.slice(matchIndex, matchIndex + search.length);
            const afterMatch = option.slice(matchIndex + search.length);

            return (
              <li
                key={option}
                className={`relative cursor-pointer select-none py-2 pl-3 pr-9 ${
                  index === highlightedIndex
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-900 hover:bg-blue-50'
                }`}
                onClick={() => handleSelect(option)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <span>
                  {beforeMatch}
                  <span
                    className={
                      index === highlightedIndex
                        ? 'text-white font-medium'
                        : 'text-blue-600 font-medium'
                    }
                  >
                    {match}
                  </span>
                  {afterMatch}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
