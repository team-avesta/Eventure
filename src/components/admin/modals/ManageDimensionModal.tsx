import { useState, useEffect } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { Modal } from '@/components/common/Modal';
import { Select } from '@/components/common/Select';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/common/icons/Spinner';
import ConfirmationModal from '@/components/shared/ConfirmationModal';
import { adminS3Service, Dimension } from '@/services/adminS3Service';
import toast from 'react-hot-toast';

interface ManageDimensionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function LoadingState() {
  return (
    <div className="text-center py-8">
      <Spinner className="mx-auto" />
      <div className="mt-2 text-sm text-gray-500">Loading dimensions...</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-8">
      <p className="text-gray-500">No dimensions available</p>
    </div>
  );
}

export default function ManageDimensionModal({
  isOpen,
  onClose,
}: ManageDimensionModalProps) {
  const [dimensions, setDimensions] = useState<Dimension[]>([]);
  const [selectedDimension, setSelectedDimension] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchDimensions();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedDimension('');
    }
  }, [isOpen]);

  const fetchDimensions = async () => {
    setIsLoading(true);
    try {
      const data = await adminS3Service.fetchDimensions();
      setDimensions(data);
    } catch (error) {
      console.error('Error fetching dimensions:', error);
      toast.error('Failed to fetch dimensions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    if (!selectedDimension) return;
    setShowConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await adminS3Service.deleteDimension(selectedDimension);
      setDimensions((prevDimensions) =>
        prevDimensions.filter((dimension) => dimension.id !== selectedDimension)
      );
      setSelectedDimension('');
      toast.success('Dimension deleted successfully');
      onClose();
    } catch (error) {
      console.error('Error deleting dimension:', error);
      toast.error('Failed to delete dimension');
    } finally {
      setIsDeleting(false);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <LoadingState />;
    }

    if (dimensions.length === 0) {
      return <EmptyState />;
    }

    const dimensionOptions = dimensions
      .sort((a, b) => parseInt(a.id) - parseInt(b.id))
      .map((dimension) => ({
        value: dimension.id,
        label: `${dimension.id}. ${dimension.name}`,
      }));

    return (
      <div className="space-y-4">
        <Select
          id="dimension"
          label="Select Dimension"
          value={selectedDimension}
          onChange={(e) => setSelectedDimension(e.target.value)}
          options={[
            { value: '', label: 'Select a dimension' },
            ...dimensionOptions,
          ]}
        />

        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={isDeleting || !selectedDimension}
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
        title="Delete Dimension"
        showCancelButton={false}
      >
        {renderContent()}
      </Modal>
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Dimension"
        message={`Are you sure you want to delete ${
          selectedDimension
            ? dimensions.find((d) => d.id === selectedDimension)?.name
            : 'this dimension'
        }? This action cannot be undone.`}
        confirmText="Delete Dimension"
        cancelText="Cancel"
      />
    </>
  );
}
