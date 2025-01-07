import { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';

interface EventActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
  isSubmitting: boolean;
}

export default function EventActionModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: EventActionModalProps) {
  const [actionName, setActionName] = useState('');

  const handleSubmit = () => {
    if (!actionName.trim()) return;
    onSubmit(actionName.trim());
    setActionName('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Event Action"
      submitLabel="Add Action"
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      isSubmitDisabled={!actionName.trim()}
    >
      <Input
        id="action-name"
        label="Action Name"
        type="text"
        value={actionName}
        onChange={(e) => setActionName(e.target.value)}
        placeholder="Enter action name"
        disabled={isSubmitting}
      />
    </Modal>
  );
}
