import { useState, useEffect, useCallback } from 'react';
import { pageLabelService } from '@/services/pageLabelService';
import { PageLabel } from '@/types/pageLabel';
import toast from 'react-hot-toast';

interface UseLabelDataReturn {
  labels: PageLabel[];
  labelMap: Record<string, string>;
  isLoading: boolean;
  error: Error | null;
  fetchLabels: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage label data
 * @returns Label data, loading state, error state, and functions to manage labels
 */
export function useLabelData(): UseLabelDataReturn {
  const [labels, setLabels] = useState<PageLabel[]>([]);
  const [labelMap, setLabelMap] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLabels = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const fetchedLabels = await pageLabelService.getAllLabels();
      setLabels(fetchedLabels);

      // Create a map of label IDs to label names for quick lookup
      const labelMapping: Record<string, string> = {};
      fetchedLabels.forEach((label) => {
        labelMapping[label.id] = label.name;
      });
      setLabelMap(labelMapping);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch labels';
      toast.error(errorMessage);
      setError(error instanceof Error ? error : new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLabels();
  }, [fetchLabels]);

  return {
    labels,
    labelMap,
    isLoading,
    error,
    fetchLabels,
  };
}
