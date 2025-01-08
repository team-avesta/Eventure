import { useState, useEffect } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { Modal } from '@/components/common/Modal';
import { Select } from '@/components/common/Select';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/common/icons/Spinner';
import ConfirmationModal from '@/components/shared/ConfirmationModal';
import { adminS3Service, Module } from '@/services/adminS3Service';
import toast from 'react-hot-toast';

interface ManageModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function LoadingState() {
  return (
    <div className="text-center py-8">
      <Spinner className="mx-auto" />
      <div className="mt-2 text-sm text-gray-500">Loading modules...</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-8">
      <p className="text-gray-500">No modules available</p>
    </div>
  );
}

export default function ManageModuleModal({
  isOpen,
  onClose,
}: ManageModuleModalProps) {
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

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
    setIsLoading(true);
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

  const handleDelete = () => {
    if (!selectedModule) return;
    setShowConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await adminS3Service.deleteModule(selectedModule);
      setModules((prevModules) =>
        prevModules.filter((module) => module.key !== selectedModule)
      );
      setSelectedModule('');
      toast.success('Module deleted successfully');
      onClose();
    } catch (error) {
      console.error('Error deleting module:', error);
      toast.error('Failed to delete module');
    } finally {
      setIsDeleting(false);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <LoadingState />;
    }

    if (modules.length === 0) {
      return <EmptyState />;
    }

    const moduleOptions = modules.map((module) => ({
      value: module.key,
      label: module.name,
    }));

    return (
      <div className="space-y-4">
        <Select
          id="module"
          label="Select Module"
          value={selectedModule}
          onChange={(e) => setSelectedModule(e.target.value)}
          options={[{ value: '', label: 'Select a module' }, ...moduleOptions]}
        />

        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={isDeleting || !selectedModule}
            className="!text-red-600 !ring-red-300 hover:!bg-red-50 flex items-center justify-center"
          >
            <TrashIcon className="h-4 w-4 mr-1" aria-hidden="true" />
            Delete
          </Button>
        </div>
      </div>
    );
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Delete Module"
        showCancelButton={false}
      >
        {renderContent()}
      </Modal>
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Module"
        message={`Are you sure you want to delete ${
          selectedModule
            ? modules.find((m) => m.key === selectedModule)?.name
            : 'this module'
        }? This action cannot be undone.`}
        confirmText="Delete Module"
        cancelText="Cancel"
      />
    </>
  );
}
