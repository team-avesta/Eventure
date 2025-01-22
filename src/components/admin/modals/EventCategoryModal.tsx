import { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';

interface EventCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
  isSubmitting: boolean;
  initialData?: string | null;
}

export default function EventCategoryModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  initialData,
}: EventCategoryModalProps) {
  const [categoryName, setCategoryName] = useState('');

  useEffect(() => {
    if (isOpen && initialData) {
      setCategoryName(initialData);
    } else {
      setCategoryName('');
    }
  }, [isOpen, initialData]);

  const handleSubmit = () => {
    if (!categoryName.trim()) return;
    onSubmit(categoryName.trim());
  };

  const isEdit = !!initialData;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Event Category' : 'Add New Event Category'}
      submitLabel={isEdit ? 'Save Changes' : 'Add Category'}
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
