import { ChangeEvent } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

interface SearchInputProps {
  onSearch: (value: string) => void;
  placeholder?: string;
  className?: string;
  delay?: number;
  initialValue?: string;
}

export const SearchInput = ({
  onSearch,
  placeholder = 'Search...',
  className = '',
  delay = 300,
  initialValue = '',
}: SearchInputProps) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const debouncedSearch = useDebounce(searchTerm, delay);

  useEffect(() => {
    onSearch(debouncedSearch);
  }, [debouncedSearch, onSearch]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="relative">
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleChange}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      />
      {searchTerm && (
        <button
          onClick={() => setSearchTerm('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <FiX className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};
