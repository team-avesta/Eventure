import { useState, useEffect } from 'react';
import { Modal } from '@/components/shared/Modal';
import { Input } from '@/components/shared/Input';

interface ModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
  isSubmitting: boolean;
  initialData?: { name: string } | null;
}

export default function ModuleModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  initialData,
}: ModuleModalProps) {
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (isOpen && initialData) {
      setInputValue(initialData.name);
    } else {
      setInputValue('');
    }
  }, [isOpen, initialData]);

  const handleSubmit = () => {
    if (!inputValue.trim()) return;
    onSubmit(inputValue.trim());
  };

  const isEdit = !!initialData;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Module' : 'Add New Module'}
      submitLabel={isEdit ? 'Save Changes' : 'Add Module'}
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
