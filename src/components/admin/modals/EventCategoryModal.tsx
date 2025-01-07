import { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';

interface EventCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
  isSubmitting: boolean;
}

export default function EventCategoryModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: EventCategoryModalProps) {
  const [categoryName, setCategoryName] = useState('');

  const handleSubmit = () => {
    if (!categoryName.trim()) return;
    onSubmit(categoryName.trim());
    setCategoryName('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Event Category"
      submitLabel="Add Category"
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      isSubmitDisabled={!categoryName.trim()}
    >
      <Input
        id="category-name"
        label="Category Name"
        type="text"
        value={categoryName}
        onChange={(e) => setCategoryName(e.target.value)}
        placeholder="Enter category name"
        disabled={isSubmitting}
      />
    </Modal>
  );
}
