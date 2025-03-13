import { Modal } from '@/components/shared/Modal';
import { Textarea } from '@/components/shared/Textarea';
import React from 'react';
import PageViewEventForm from './PageViewEventForm';
import { useEventForm } from '@/hooks/useEventForm';
import TrackEventForm from './TrackEventForm';
import OutlinkEventForm from './OutlinkEventForm';
import { FormState } from '@/types/types';

interface EventModalWrapperProps {
  showEventForm: boolean;
  handleCancelEventForm: () => void;
  isSubmitting: boolean;
  handleEventFormSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  selectedEventType: {
    id: string;
    name: string;
    color: string;
  } | null;
  formData: FormState;
  setFormData: React.Dispatch<React.SetStateAction<FormState>>;
  handleDimensionChange: (dimensionId: string, checked: boolean) => void;
}
const EventModalWrapper = ({
  showEventForm,
  handleCancelEventForm,
  isSubmitting,
  handleEventFormSubmit,
  selectedEventType,
  formData,
  setFormData,
  handleDimensionChange,
}: EventModalWrapperProps) => {
  const renderFormFields = () => {
    if (!selectedEventType) return null;

    switch (selectedEventType.id) {
      case 'pageview':
        return (
          <PageViewEventForm
            formData={formData}
            setFormData={setFormData}
            handleDimensionChange={handleDimensionChange}
          />
        );

      case 'trackevent':
      case 'trackevent_pageview':
      case 'backendevent':
        return (
          <TrackEventForm
            formData={formData}
            setFormData={setFormData}
            handleDimensionChange={handleDimensionChange}
          />
        );

      case 'outlink':
        return (
          <OutlinkEventForm
            formData={formData}
            setFormData={setFormData}
            handleDimensionChange={handleDimensionChange}
          />
        );
    }
  };

  return (
    <Modal
      isOpen={showEventForm}
      onClose={handleCancelEventForm}
      title="Event Details"
      submitLabel={isSubmitting ? 'Saving...' : 'Save Event'}
      isSubmitting={isSubmitting}
      isSubmitDisabled={false}
      showCancelButton={false}
      contentClassName="!ml-0"
    >
      <form onSubmit={handleEventFormSubmit} className="space-y-4">
        {renderFormFields()}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleCancelEventForm}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Event'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EventModalWrapper;
