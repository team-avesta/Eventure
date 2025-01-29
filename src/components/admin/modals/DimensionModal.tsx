import { useState, useEffect, useCallback } from 'react';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import { Select } from '@/components/common/Select';
import { adminS3Service } from '@/services/adminS3Service';
import toast from 'react-hot-toast';

interface DimensionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: {
    id: string;
    name: string;
    description?: string;
    type: string;
  }) => void;
  isSubmitting: boolean;
  initialData?: {
    id: string;
    name: string;
    description?: string;
    type: string;
  } | null;
}

export default function DimensionModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  initialData,
}: DimensionModalProps) {
  const [dimensionNumber, setDimensionNumber] = useState('');
  const [dimensionName, setDimensionName] = useState('');
  const [description, setDescription] = useState('');
  const [dimensionType, setDimensionType] = useState('');
  const [dimensionTypes, setDimensionTypes] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [existingDimensions, setExistingDimensions] = useState<
    Array<{ id: string }>
  >([]);
  const [error, setError] = useState<string>('');

  const fetchExistingDimensions = useCallback(async () => {
    try {
      const dimensions = await adminS3Service.fetchDimensions();
      setExistingDimensions(
        dimensions
          .filter((d) => !initialData || d.id !== initialData.id)
          .sort((a, b) => parseInt(a.id) - parseInt(b.id))
      );
    } catch (error) {
      console.error('Error fetching dimensions:', error);
      toast.error('Failed to fetch existing dimensions');
    }
  }, [initialData]);

  const fetchDimensionTypes = useCallback(async () => {
    try {
      const types = await adminS3Service.fetchDimensionTypes();
      setDimensionTypes(types);
    } catch (error) {
      console.error('Error fetching dimension types:', error);
      toast.error('Failed to fetch dimension types');
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchExistingDimensions();
      fetchDimensionTypes();
    }
  }, [isOpen, fetchExistingDimensions, fetchDimensionTypes]);

  useEffect(() => {
    if (isOpen && initialData) {
      setDimensionNumber(initialData.id);
      setDimensionName(initialData.name);
      setDescription(initialData.description || '');
      setDimensionType(initialData.type || '');
      setError('');
    } else if (isOpen) {
      setDimensionNumber('');
      setDimensionName('');
      setDescription('');
      setDimensionType('');
      setError('');
    }
  }, [isOpen, initialData]);

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

    // Check for duplicates (skip when editing the same dimension)
    if (
      !initialData?.id &&
      existingDimensions.some((dim) => dim.id === value)
    ) {
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
    if (!dimensionNumber.trim() || !dimensionName.trim() || !dimensionType)
      return;

    if (!validateDimensionNumber(dimensionNumber)) {
      return;
    }

    onSubmit({
      id: dimensionNumber.trim(),
      name: dimensionName.trim(),
      description: description.trim() || '',
      type: dimensionType,
    });
  };

  const isEdit = !!initialData;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Dimension' : 'Add New Dimension'}
      submitLabel={isEdit ? 'Save Changes' : 'Add Dimension'}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      isSubmitDisabled={
        !dimensionNumber.trim() ||
        !dimensionName.trim() ||
        !dimensionType ||
        !!error
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
          disabled={isSubmitting || isEdit}
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
        <Select
          id="dimension-type"
          label="Dimension Type"
          value={dimensionType}
          onChange={(e) => setDimensionType(e.target.value)}
          options={[
            { value: '', label: 'Select a type' },
            ...dimensionTypes.map((type) => ({
              value: type.id,
              label: type.name,
            })),
          ]}
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
