import { useState, useEffect } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { Modal } from '@/components/common/Modal';
import { Select } from '@/components/common/Select';
import { Button } from '@/components/common/Button';
import ConfirmationModal from '@/components/shared/ConfirmationModal';
import { adminS3Service } from '@/services/adminS3Service';
import toast from 'react-hot-toast';
import { CgSpinner } from 'react-icons/cg';

interface ManageEventActionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function LoadingState() {
  return (
    <div className="text-center py-8">
      <CgSpinner
        size={16}
        className="animate-spin mx-auto"
        role="progressbar"
      />
      <div className="mt-2 text-sm text-gray-500">Loading event actions...</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-8">
      <p className="text-gray-500">No event actions available</p>
    </div>
  );
}

export default function ManageEventActionModal({
  isOpen,
  onClose,
}: ManageEventActionModalProps) {
  const [actions, setActions] = useState<string[]>([]);
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchActions();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedAction('');
    }
  }, [isOpen]);

  const fetchActions = async () => {
    setIsLoading(true);
    try {
      const data = await adminS3Service.fetchEventActions();
      setActions(data);
    } catch (error) {
      toast.error('Failed to fetch event actions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    if (!selectedAction) return;
    setShowConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await adminS3Service.deleteEventAction(selectedAction);
      setActions((prevActions) =>
        prevActions.filter((action) => action !== selectedAction)
      );
      setSelectedAction('');
      toast.success('Event action deleted successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to delete event action');
    } finally {
      setIsDeleting(false);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <LoadingState />;
    }

    if (actions.length === 0) {
      return <EmptyState />;
    }

    const actionOptions = actions.map((action) => ({
      value: action,
      label: action,
    }));

    return (
      <div className="space-y-4">
        <Select
          id="action"
          label="Select Event Action"
          value={selectedAction}
          onChange={(e) => setSelectedAction(e.target.value)}
          options={[
            { value: '', label: 'Select an event action' },
            ...actionOptions,
          ]}
        />

        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={isDeleting || !selectedAction}
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
        title="Delete Event Action"
        showCancelButton={false}
      >
        {renderContent()}
      </Modal>
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Event Action"
        message={`Are you sure you want to delete the event action "${selectedAction}"? This action cannot be undone.`}
        confirmText="Delete Event Action"
        cancelText="Cancel"
      />
    </>
  );
}
