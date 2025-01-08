import { useState, useEffect } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { Modal } from '@/components/common/Modal';
import { Select } from '@/components/common/Select';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/common/icons/Spinner';
import ConfirmationModal from '@/components/shared/ConfirmationModal';
import { adminS3Service, PageView } from '@/services/adminS3Service';
import toast from 'react-hot-toast';

interface ManagePageViewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function LoadingState() {
  return (
    <div className="text-center py-8">
      <Spinner className="mx-auto" />
      <div className="mt-2 text-sm text-gray-500">Loading page views...</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-8">
      <p className="text-gray-500">No page views available</p>
    </div>
  );
}

export default function ManagePageViewModal({
  isOpen,
  onClose,
}: ManagePageViewModalProps) {
  const [pageViews, setPageViews] = useState<PageView[]>([]);
  const [selectedPageView, setSelectedPageView] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPageViews();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedPageView('');
    }
  }, [isOpen]);

  const fetchPageViews = async () => {
    setIsLoading(true);
    try {
      const data = await adminS3Service.fetchPageViews();
      setPageViews(data);
    } catch (error) {
      console.error('Error fetching page views:', error);
      toast.error('Failed to fetch page views');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    if (!selectedPageView) return;
    setShowConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await adminS3Service.deletePageView(selectedPageView);
      setPageViews((prevPageViews) =>
        prevPageViews.filter((pageView) => pageView.id !== selectedPageView)
      );
      setSelectedPageView('');
      toast.success('Page view deleted successfully');
      onClose();
    } catch (error) {
      console.error('Error deleting page view:', error);
      toast.error('Failed to delete page view');
    } finally {
      setIsDeleting(false);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <LoadingState />;
    }

    if (pageViews.length === 0) {
      return <EmptyState />;
    }

    const pageViewOptions = pageViews.map((pageView) => ({
      value: pageView.id,
      label: pageView.title,
    }));

    return (
      <div className="space-y-4">
        <Select
          id="pageView"
          label="Select Page View"
          value={selectedPageView}
          onChange={(e) => setSelectedPageView(e.target.value)}
          options={[
            { value: '', label: 'Select a page view' },
            ...pageViewOptions,
          ]}
        />

        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={isDeleting || !selectedPageView}
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
        title="Delete Page View"
        showCancelButton={false}
      >
        {renderContent()}
      </Modal>
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Page View"
        message={`Are you sure you want to delete ${
          selectedPageView
            ? pageViews.find((p) => p.id === selectedPageView)?.url
            : 'this page view'
        }? This action cannot be undone.`}
        confirmText="Delete Page View"
        cancelText="Cancel"
      />
    </>
  );
}
