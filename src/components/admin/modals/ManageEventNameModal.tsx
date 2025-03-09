import { useState, useEffect } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { Modal } from '@/components/common/Modal';
import { Select } from '@/components/common/Select';
import { Button } from '@/components/common/Button';
import ConfirmationModal from '@/components/shared/ConfirmationModal';
import { adminS3Service } from '@/services/adminS3Service';
import toast from 'react-hot-toast';
import { CgSpinner } from 'react-icons/cg';

interface ManageEventNameModalProps {
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
      <div className="mt-2 text-sm text-gray-500">Loading event names...</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-8">
      <p className="text-gray-500">No event names available</p>
    </div>
  );
}

export default function ManageEventNameModal({
  isOpen,
  onClose,
}: ManageEventNameModalProps) {
  const [events, setEvents] = useState<string[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchEvents();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedEvent('');
    }
  }, [isOpen]);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const data = await adminS3Service.fetchEventNames();
      setEvents(data);
    } catch (error) {
      toast.error('Failed to fetch event names');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    if (!selectedEvent) return;
    setShowConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await adminS3Service.deleteEventName(selectedEvent);
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event !== selectedEvent)
      );
      setSelectedEvent('');
      toast.success('Event name deleted successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to delete event name');
    } finally {
      setIsDeleting(false);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <LoadingState />;
    }

    if (events.length === 0) {
      return <EmptyState />;
    }

    const eventOptions = events.map((event) => ({
      value: event,
      label: event,
    }));

    return (
      <div className="space-y-4">
        <Select
          id="event"
          label="Select Event Name"
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          options={[
            { value: '', label: 'Select an event name' },
            ...eventOptions,
          ]}
        />

        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={isDeleting || !selectedEvent}
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
        title="Delete Event Name"
        showCancelButton={false}
      >
        {renderContent()}
      </Modal>
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Event Name"
        message={`Are you sure you want to delete the event name "${selectedEvent}"? This action cannot be undone.`}
        confirmText="Delete Event Name"
        cancelText="Cancel"
      />
    </>
  );
}
