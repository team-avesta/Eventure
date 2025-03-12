import { useState, useEffect } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { Modal } from '@/components/shared/Modal';
import { Select } from '@/components/shared/Select';
import { Button } from '@/components/shared/Button';
import ConfirmationModal from '@/components/shared/ConfirmationModal';
import { adminS3Service } from '@/services/adminS3Service';
import toast from 'react-hot-toast';
import { CgSpinner } from 'react-icons/cg';

interface ManageEventCategoryModalProps {
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
      <div className="mt-2 text-sm text-gray-500">
        Loading event categories...
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-8">
      <p className="text-gray-500">No event categories available</p>
    </div>
  );
}

export default function ManageEventCategoryModal({
  isOpen,
  onClose,
}: ManageEventCategoryModalProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedCategory('');
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await adminS3Service.fetchEventCategories();

      setCategories(data);
    } catch (error) {
      toast.error('Failed to fetch event categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    if (!selectedCategory) return;
    setShowConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await adminS3Service.deleteEventCategory(selectedCategory);
      setCategories((prevCategories) =>
        prevCategories.filter((category) => category !== selectedCategory)
      );
      setSelectedCategory('');
      toast.success('Event category deleted successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to delete event category');
    } finally {
      setIsDeleting(false);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <LoadingState />;
    }

    if (categories.length === 0) {
      return <EmptyState />;
    }

    const categoryOptions = categories.map((category) => ({
      value: category,
      label: category,
    }));

    return (
      <div className="space-y-4">
        <Select
          id="category"
          label="Select Event Category"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          options={[
            { value: '', label: 'Select an event category' },
            ...categoryOptions,
          ]}
        />

        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={isDeleting || !selectedCategory}
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
        title="Delete Event Category"
        showCancelButton={false}
      >
        {renderContent()}
      </Modal>
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Event Category"
        message={`Are you sure you want to delete the event category "${selectedCategory}"? This action cannot be undone.`}
        confirmText="Delete Event Category"
        cancelText="Cancel"
      />
    </>
  );
}
