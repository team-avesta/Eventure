import { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';

interface DimensionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: { id: string; name: string; description?: string }) => void;
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
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!dimensionNumber.trim() || !dimensionName.trim()) return;
    onSubmit({
      id: dimensionNumber.trim(),
      name: dimensionName.trim(),
      description: description.trim() || '',
    });
    setDimensionNumber('');
    setDimensionName('');
    setDescription('');
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
        <Textarea
          id="dimension-description"
          label="Description (Optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter dimension description"
          disabled={isSubmitting}
          rows={3}
        />
      </div>
    </Modal>
  );
}
