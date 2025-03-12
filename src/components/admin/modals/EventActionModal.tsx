import { useState, useEffect } from 'react';
import { Modal } from '@/components/shared/Modal';
import { Input } from '@/components/shared/Input';

interface EventActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
  isSubmitting: boolean;
  initialData?: string | null;
}

export default function EventActionModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  initialData,
}: EventActionModalProps) {
  const [actionName, setActionName] = useState('');

  useEffect(() => {
    if (isOpen && initialData) {
      setActionName(initialData);
    } else {
      setActionName('');
    }
  }, [isOpen, initialData]);

  const handleSubmit = () => {
    if (!actionName.trim()) return;
    onSubmit(actionName.trim());
  };

  const isEdit = !!initialData;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Event Action' : 'Add New Event Action'}
      submitLabel={isEdit ? 'Save Changes' : 'Add Action'}
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
