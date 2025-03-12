import { useState, useEffect } from 'react';
import { Modal } from '@/components/shared/Modal';
import { Select } from '@/components/shared/Select';
import { ScreenshotStatus } from '@/services/adminS3Service';

interface EditScreenshotStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (status: ScreenshotStatus) => void;
  currentStatus: ScreenshotStatus;
}

export default function EditScreenshotStatusModal({
  isOpen,
  onClose,
  onSave,
  currentStatus,
}: EditScreenshotStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<ScreenshotStatus>(
    ScreenshotStatus.TODO
  );

  useEffect(() => {
    if (isOpen) {
      setSelectedStatus(currentStatus);
    }
  }, [isOpen, currentStatus]);

  const handleSubmit = () => {
    onSave(selectedStatus);
    onClose();
  };

  const statusOptions = Object.values(ScreenshotStatus).map((status) => ({
    value: status,
    label: status,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Screenshot Status"
      submitLabel="Save"
      onSubmit={handleSubmit}
    >
      <div className="space-y-4">
        <Select
          id="status"
          label="Status"
          value={selectedStatus}
          onChange={(e) =>
            setSelectedStatus(e.target.value as ScreenshotStatus)
          }
          options={statusOptions}
        />
      </div>
    </Modal>
  );
}
