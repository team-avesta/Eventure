import { useState, useEffect } from 'react';
import { Event } from '@/types';
import { FormState, EventFormData } from '../types/types';
import { EEventType } from '@/services/adminS3Service';

export function useEventForm() {
  const [formData, setFormData] = useState<FormState>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState<{
    id: string;
    description: string;
  } | null>(null);

  const resetForm = () => {
    setFormData({});
    setIsSubmitting(false);
  };

  const handleDimensionChange = (dimensionId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      dimensions: checked
        ? [...(prev.dimensions || []), dimensionId]
        : (prev.dimensions || []).filter((id) => id !== dimensionId),
    }));
  };

  const getDimensionsAndDescription = (formValues: any) => {
    const dimensions = Array.from(formValues.getAll('dimensions')) as string[];
    const description = formValues.get('description') as string;
    return { dimensions, description };
  };

  const getPageViewData = (formValues: any) => {
    const { dimensions, description } = getDimensionsAndDescription(formValues);

    const customTitle = formValues.get('customTitle') as string;
    const customUrl = formValues.get('customUrl') as string;
    const action = '';
    const value = '';

    return { customTitle, customUrl, action, value, dimensions, description };
  };

  const getTrackEventData = (formValues: any) => {
    const { dimensions, description } = getDimensionsAndDescription(formValues);

    const name = formValues.get('eventname') as string;
    const category = formValues.get('eventcategory') as string;
    const value = formValues.get('eventvalue') as string;

    return { name, category, value, dimensions, description };
  };

  const prepareFormDataForSubmission = (
    formValues: any,
    eventType: string
  ): EventFormData => {
    if (eventType === EEventType.PageView) {
      return getPageViewData(formValues);
    } else if (
      eventType === EEventType.TrackEventWithPageView ||
      eventType === EEventType.TrackEvent ||
      eventType === EEventType.BackendEvent
    ) {
      return {
        ...getTrackEventData(formValues),
        action: formValues.get('eventactionname') as string,
      };
    } else if (eventType === EEventType.Outlink) {
      return {
        ...getTrackEventData(formValues),
        action: 'Outlink',
      };
    }

    // Default empty form data
    return {
      name: '',
      category: '',
      action: '',
      value: '',
      dimensions: [],
    };
  };

  const populateFormFromEvent = (
    event: Event,
    eventType: string,
    pageData: Array<{ id: string; title: string; url: string }>
  ) => {
    switch (eventType) {
      case EEventType.PageView:
        setFormData({
          dimensions: event.dimensions,
          description: event.description,
          customTitle: event.customTitle,
          customUrl: event.customUrl,
        });
        break;

      case EEventType.TrackEvent:
      case EEventType.TrackEventWithPageView:
      case EEventType.BackendEvent:
      case EEventType.Outlink:
        setFormData({
          eventcategory: event.category,
          eventactionname: event.action,
          eventname: event.name || '',
          eventvalue: event.value || '',
          dimensions: event.dimensions,
          description: event.description,
        });
        break;
    }
  };

  const handleViewDescription = (id: string, description: string) => {
    setSelectedDescription({ id, description });
    setShowDescriptionModal(true);
  };

  return {
    formData,
    setFormData,
    isSubmitting,
    setIsSubmitting,
    showDescriptionModal,
    setShowDescriptionModal,
    selectedDescription,
    setSelectedDescription,
    resetForm,
    handleDimensionChange,
    prepareFormDataForSubmission,
    populateFormFromEvent,
    handleViewDescription,
  };
}
