import { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';

interface ModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
  isSubmitting: boolean;
}

export default function ModuleModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: ModuleModalProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = () => {
    if (!inputValue.trim()) return;
    onSubmit(inputValue.trim());
    setInputValue('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Module"
      submitLabel="Add Module"
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      isSubmitDisabled={!inputValue.trim()}
    >
      <Input
        id="module-name"
        label="Module Name"
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Enter module name"
        disabled={isSubmitting}
      />
    </Modal>
  );
}
