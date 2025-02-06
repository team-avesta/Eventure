import { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { adminS3Service, DimensionType } from '@/services/adminS3Service';
import toast from 'react-hot-toast';

interface DimensionTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (type: DimensionType) => void;
  isSubmitting: boolean;
  initialData?: DimensionType | null;
}

export default function DimensionTypeModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  initialData,
}: DimensionTypeModalProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState<string>('');
  const [existingTypes, setExistingTypes] = useState<DimensionType[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Fetch existing types when modal opens
      adminS3Service
        .fetchDimensionTypes()
        .then((types) => {
          setExistingTypes(types);
        })
        .catch((error) => {
          toast.error(error.message);
        });
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && initialData) {
      setName(initialData.name);
      setError('');
    } else if (isOpen) {
      setName('');
      setError('');
    }
  }, [isOpen, initialData]);

  const generateTypeId = (displayName: string): string => {
    return displayName
      .trim()
      .toLowerCase()
      .replace(/\s*\((.*?)\)/g, '_$1') // Replace parentheses with underscore + content
      .replace(/[^a-z0-9]+/g, '_') // Replace non-alphanumeric with underscore
      .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
      .replace(/_+/g, '_'); // Replace multiple underscores with single
  };

  const handleSubmit = () => {
    if (!name.trim()) return;

    const typeId = generateTypeId(name);
    const newType = {
      id: typeId,
      name: name.trim(),
    };

    // Check for duplicates (excluding the current type being edited)
    const duplicateName = existingTypes.find(
      (t) =>
        t.name.toLowerCase() === name.trim().toLowerCase() &&
        t.id !== initialData?.id
    );
    const duplicateId = existingTypes.find(
      (t) => t.id === typeId && t.id !== initialData?.id
    );

    if (duplicateName) {
      setError(`Type name "${name}" already exists`);
      return;
    }

    if (duplicateId) {
      setError(`Type ID "${typeId}" already exists`);
      return;
    }

    setError('');
    onSubmit(newType);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Dimension Type' : 'Add New Dimension Type'}
      submitLabel={initialData ? 'Save Changes' : 'Add Dimension Type'}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      isSubmitDisabled={!name.trim() || !!error}
    >
      <div className="space-y-4">
        <Input
          id="dimension-type-name"
          label="Display Name"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError(''); // Clear error when input changes
          }}
          placeholder="Enter display name (e.g., String, String (Multiple), Long)"
          disabled={isSubmitting}
          error={error}
        />
        {name && !error && (
          <div className="text-sm text-gray-500">
            Type ID:{' '}
            <code className="bg-gray-100 px-1 rounded">
              {generateTypeId(name)}
            </code>
          </div>
        )}
      </div>
    </Modal>
  );
}
