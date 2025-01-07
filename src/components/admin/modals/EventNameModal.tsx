import { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';

interface EventNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
  isSubmitting: boolean;
}

export default function EventNameModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: EventNameModalProps) {
  const [eventName, setEventName] = useState('');

  const handleSubmit = () => {
    if (!eventName.trim()) return;
    onSubmit(eventName.trim());
    setEventName('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Event Name"
      submitLabel="Add Event"
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
