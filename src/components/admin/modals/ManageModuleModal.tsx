import { useState } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { Modal } from '@/components/common/Modal';
import { Select } from '@/components/common/Select';
import { Button } from '@/components/common/Button';
import { useModules } from '@/hooks/useModules';
import { Spinner } from '@/components/common/icons/Spinner';
import ConfirmationModal from '@/components/shared/ConfirmationModal';

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

function EmptyState({ onClose }: { onClose: () => void }) {
  return (
    <div className="text-center py-8">
      <div className="text-sm text-gray-500">No modules found</div>
      <Button variant="outline" onClick={onClose} className="mt-4">
        Add a new module
      </Button>
    </div>
  );
}

export default function ManageModuleModal({
  isOpen,
  onClose,
}: ManageModuleModalProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const {
    modules,
    selectedModule,
    setSelectedModule,
    isLoading,
    isDeleting,
    deleteModule,
  } = useModules(isOpen);

  const handleDelete = async () => {
    if (!selectedModule) return;
    setShowConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    const success = await deleteModule();
    if (success) {
      onClose();
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <LoadingState />;
    }

    if (modules.length === 0) {
      return <EmptyState onClose={onClose} />;
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
