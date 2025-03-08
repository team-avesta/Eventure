import { useState, useEffect, useCallback } from 'react';
import { adminS3Service, Module } from '@/services/adminS3Service';
import toast from 'react-hot-toast';

interface UseModuleDataReturn {
  currentModule: Module | null;
  isLoading: boolean;
  error: Error | null;
  fetchModule: () => Promise<void>;
  setCurrentModule: React.Dispatch<React.SetStateAction<Module | null>>;
}

/**
 * Custom hook to fetch and manage module data
 * @param moduleKey - The key of the module to fetch
 * @returns Module data, loading state, error state, and functions to manage the module
 */
export function useModuleData(moduleKey: string): UseModuleDataReturn {
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchModule = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const modules = await adminS3Service.fetchModules();
      const foundModule = modules.find((m) => m.key === moduleKey);
      setCurrentModule(foundModule || null);

      if (!foundModule) {
        setError(new Error(`Module with key ${moduleKey} not found`));
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch module';
      toast.error(errorMessage);
      setError(error instanceof Error ? error : new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [moduleKey]);

  useEffect(() => {
    fetchModule();
  }, [fetchModule]);

  return {
    currentModule,
    isLoading,
    error,
    fetchModule,
    setCurrentModule,
  };
}
