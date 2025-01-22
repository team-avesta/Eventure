import { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';

interface PageViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: { title: string; url: string }) => void;
  isSubmitting: boolean;
  initialData?: { title: string; url: string } | null;
}

export default function PageViewModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  initialData,
}: PageViewModalProps) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (isOpen && initialData) {
      setTitle(initialData.title);
      setUrl(initialData.url);
    } else {
      setTitle('');
      setUrl('');
    }
  }, [isOpen, initialData]);

  const handleSubmit = () => {
    if (!title.trim() || !url.trim()) return;
    onSubmit({
      title: title.trim(),
      url: url.trim(),
    });
  };

  const isEdit = !!initialData;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit PageView Event' : 'Add New PageView Event'}
      submitLabel={isEdit ? 'Save Changes' : 'Add PageView'}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      isSubmitDisabled={!title.trim() || !url.trim()}
    >
      <div className="space-y-4">
        <Input
          id="page-title"
          label="Page Title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter page title"
          disabled={isSubmitting}
        />
        <Input
          id="page-url"
          label="Page URL"
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter page URL"
          disabled={isSubmitting}
        />
      </div>
    </Modal>
  );
}
