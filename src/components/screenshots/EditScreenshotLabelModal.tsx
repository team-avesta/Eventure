import { useState, useEffect } from 'react';
import { Modal } from '@/components/shared/Modal';
import { Select } from '@/components/shared/Select';
import { PageLabel } from '@/types/pageLabel';

interface EditScreenshotLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (labelId: string | null) => void;
  currentLabelId: string | null;
  availableLabels: PageLabel[];
}

export default function EditScreenshotLabelModal({
  isOpen,
  onClose,
  onSave,
  currentLabelId,
  availableLabels,
}: EditScreenshotLabelModalProps) {
  const [selectedLabelId, setSelectedLabelId] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setSelectedLabelId(currentLabelId || '');
    }
  }, [isOpen, currentLabelId]);

  const handleSubmit = () => {
    onSave(selectedLabelId || null);
    onClose();
  };

  const handleRemoveLabel = () => {
    onSave(null);
    onClose();
  };

  const labelOptions = [
    { value: '', label: 'No label' },
    ...availableLabels.map((label) => ({
      value: label.id,
      label: label.name,
    })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Screenshot Label"
      submitLabel="Save"
      onSubmit={handleSubmit}
    >
      <div className="space-y-4">
        <Select
          id="label"
          label="Label"
          value={selectedLabelId}
          onChange={(e) => setSelectedLabelId(e.target.value)}
          options={labelOptions}
        />

        {currentLabelId && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleRemoveLabel}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Remove label
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
