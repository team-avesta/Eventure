import { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';

interface EventNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
  isSubmitting: boolean;
  initialData?: string | null;
}

export default function EventNameModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  initialData,
}: EventNameModalProps) {
  const [eventName, setEventName] = useState('');

  useEffect(() => {
    if (isOpen && initialData) {
      setEventName(initialData);
    } else {
      setEventName('');
    }
  }, [isOpen, initialData]);

  const handleSubmit = () => {
    if (!eventName.trim()) return;
    onSubmit(eventName.trim());
  };

  const isEdit = !!initialData;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Event Name' : 'Add New Event Name'}
      submitLabel={isEdit ? 'Save Changes' : 'Add Event'}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      isSubmitDisabled={!eventName.trim()}
    >
      <Input
        id="event-name"
        label="Event Name"
        type="text"
        value={eventName}
        onChange={(e) => setEventName(e.target.value)}
        placeholder="Enter event name"
        disabled={isSubmitting}
      />
    </Modal>
  );
}
