import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { adminS3Service, Module } from '@/services/adminS3Service';

export function useModules(isOpen: boolean) {
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchModules();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedModule('');
    }
  }, [isOpen]);

  const fetchModules = async () => {
    try {
      const data = await adminS3Service.fetchModules();
      setModules(data);
    } catch (error) {
      console.error('Error fetching modules:', error);
      toast.error('Failed to fetch modules');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteModule = async () => {
    if (!selectedModule) return false;
    setIsDeleting(true);
    try {
      await adminS3Service.deleteModule(selectedModule);
      setModules((prevModules) =>
        prevModules.filter((module) => module.key !== selectedModule)
      );
      setSelectedModule('');
      toast.success('Module deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting module:', error);
      toast.error('Failed to delete module');
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    modules,
    selectedModule,
    setSelectedModule,
    isLoading,
    isDeleting,
    deleteModule,
  };
}
