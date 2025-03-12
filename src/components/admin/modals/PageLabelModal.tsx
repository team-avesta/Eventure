import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { Input } from '@/components/shared/Input';
import { Button } from '@/components/shared/Button';
import { PageLabel } from '@/types/pageLabel';

interface PageLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string }) => void;
  isSubmitting: boolean;
  initialData?: PageLabel;
}

export default function PageLabelModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  initialData,
}: PageLabelModalProps) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
    } else {
      setName('');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name: name.trim() });
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-10 overflow-y-auto"
    >
      <div className="min-h-screen px-4 text-center">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <span className="inline-block h-screen align-middle" aria-hidden="true">
          &#8203;
        </span>
        <Dialog.Panel className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <Dialog.Title
            as="h3"
            className="text-lg font-medium leading-6 text-gray-900"
          >
            {initialData ? 'Edit Page Label' : 'Add Page Label'}
          </Dialog.Title>
          <form onSubmit={handleSubmit} className="mt-4">
            <Input
              id="name"
              label="Label Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter label name"
            />
            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                {initialData ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
