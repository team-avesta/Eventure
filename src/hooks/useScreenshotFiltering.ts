import { useState, useEffect, useMemo } from 'react';
import { Module } from '@/services/adminS3Service';

interface UseScreenshotFilteringReturn {
  filteredScreenshots: Module['screenshots'];
  searchTerm: string;
  selectedLabelId: string | null;
  handleSearch: (value: string) => void;
  setSelectedLabelId: React.Dispatch<React.SetStateAction<string | null>>;
}

/**
 * Custom hook to filter screenshots by search term and label
 * @param screenshots - The screenshots to filter
 * @returns Filtered screenshots and filter state management functions
 */
export function useScreenshotFiltering(
  screenshots: Module['screenshots'] = []
): UseScreenshotFilteringReturn {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null);

  // Memoize filtered screenshots to avoid unnecessary recalculations
  const filteredScreenshots = useMemo(() => {
    if (!screenshots.length) return [];

    let filtered = [...screenshots];

    // Apply search filter
    if (searchTerm) {
      const searchTerms = searchTerm.toLowerCase().split(/[\s-]+/);
      filtered = filtered.filter((screenshot) => {
        const normalizedName = screenshot.name.toLowerCase();
        return searchTerms.every((term) => normalizedName.includes(term));
      });
    }

    // Apply label filter
    if (selectedLabelId) {
      filtered = filtered.filter(
        (screenshot) => screenshot.labelId === selectedLabelId
      );
    }

    return filtered;
  }, [screenshots, searchTerm, selectedLabelId]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  return {
    filteredScreenshots,
    searchTerm,
    selectedLabelId,
    handleSearch,
    setSelectedLabelId,
  };
}
