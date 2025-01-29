import { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { adminS3Service } from '@/services/adminS3Service';
import toast from 'react-hot-toast';

interface DimensionTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (type: string) => void;
  isSubmitting: boolean;
  initialData?: string | null;
}

export default function DimensionTypeModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  initialData,
}: DimensionTypeModalProps) {
  const [type, setType] = useState('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen && initialData) {
      setType(initialData);
      setError('');
    } else if (isOpen) {
      setType('');
      setError('');
    }
  }, [isOpen, initialData]);

  const handleSubmit = () => {
    if (!type.trim()) return;
    onSubmit(type.trim());
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Dimension Type' : 'Add New Dimension Type'}
      submitLabel={initialData ? 'Save Changes' : 'Add Dimension Type'}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      isSubmitDisabled={!type.trim()}
    >
      <div className="space-y-4">
        <Input
          id="dimension-type"
          label="Type"
          type="text"
          value={type}
          onChange={(e) => setType(e.target.value)}
          placeholder="Enter dimension type (e.g., string, string-multi, long, boolean)"
          disabled={isSubmitting}
          error={error}
        />
      </div>
    </Modal>
  );
}
