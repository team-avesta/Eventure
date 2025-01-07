import { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';

interface DimensionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: { id: string; name: string }) => void;
  isSubmitting: boolean;
}

export default function DimensionModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: DimensionModalProps) {
  const [dimensionNumber, setDimensionNumber] = useState('');
  const [dimensionName, setDimensionName] = useState('');

  const handleSubmit = () => {
    if (!dimensionNumber.trim() || !dimensionName.trim()) return;
    onSubmit({
      id: dimensionNumber.trim(),
      name: dimensionName.trim(),
    });
    setDimensionNumber('');
    setDimensionName('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Dimension"
      submitLabel="Add Dimension"
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      isSubmitDisabled={!dimensionNumber.trim() || !dimensionName.trim()}
    >
      <div className="space-y-4">
        <Input
          id="dimension-number"
          label="Dimension Number"
          type="number"
          value={dimensionNumber}
          onChange={(e) => setDimensionNumber(e.target.value)}
          placeholder="Enter dimension number"
          disabled={isSubmitting}
        />
        <Input
          id="dimension-name"
          label="Dimension Name"
          type="text"
          value={dimensionName}
          onChange={(e) => setDimensionName(e.target.value)}
          placeholder="Enter dimension name"
          disabled={isSubmitting}
        />
      </div>
    </Modal>
  );
}
