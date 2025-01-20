import { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import { adminS3Service } from '@/services/adminS3Service';
import toast from 'react-hot-toast';

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
  const [existingDimensions, setExistingDimensions] = useState<
    Array<{ id: string }>
  >([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      fetchExistingDimensions();
    }
  }, [isOpen]);

  const fetchExistingDimensions = async () => {
    try {
      const dimensions = await adminS3Service.fetchDimensions();
      setExistingDimensions(dimensions);
    } catch (error) {
      console.error('Error fetching dimensions:', error);
      toast.error('Failed to fetch existing dimensions');
    }
  };

  const validateDimensionNumber = (value: string) => {
    const num = parseInt(value);

    // Check if it's a valid number
    if (isNaN(num)) {
      setError('Please enter a valid number');
      return false;
    }

    // Check for negative numbers (allow zero)
    if (num < 0) {
      setError('Dimension number cannot be negative');
      return false;
    }

    // Check for duplicates
    if (existingDimensions.some((dim) => dim.id === value)) {
      setError('This dimension number already exists');
      return false;
    }

    setError('');
    return true;
  };

  const handleDimensionNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setDimensionNumber(value);
    validateDimensionNumber(value);
  };

  const handleSubmit = () => {
    if (!dimensionNumber.trim() || !dimensionName.trim()) return;

    if (!validateDimensionNumber(dimensionNumber)) {
      return;
    }

    onSubmit({
      id: dimensionNumber.trim(),
      name: dimensionName.trim(),
      description: description.trim() || '',
    });

    setDimensionNumber('');
    setDimensionName('');
    setDescription('');
    setError('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Dimension"
      submitLabel="Add Dimension"
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      isSubmitDisabled={
        !dimensionNumber.trim() || !dimensionName.trim() || !!error
      }
    >
      <div className="space-y-4">
        <Input
          id="dimension-number"
          label="Dimension Number"
          type="number"
          value={dimensionNumber}
          onChange={handleDimensionNumberChange}
          placeholder="Enter dimension number"
          disabled={isSubmitting}
          min="0"
          step="1"
          error={error}
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
