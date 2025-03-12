import { Autocomplete } from '@/components/common/Autocomplete';
import { Textarea } from '@/components/common/Textarea';
import React from 'react';
import { useDropdownData } from '@/hooks/useDropdownData';
import InputField from '@/components/common/InputField';
import DimensionsSection from '@/components/common/DimensionsSection';
import { FormState } from '@/types/types';

interface OutlinkEventFormProps {
  formData: FormState;
  setFormData: React.Dispatch<React.SetStateAction<FormState>>;
  handleDimensionChange: (dimensionId: string, checked: boolean) => void;
}

const OutlinkEventForm = ({
  formData,
  setFormData,
  handleDimensionChange,
}: OutlinkEventFormProps) => {
  const { data: dropdownData } = useDropdownData();

  const handleChange = (key: keyof FormState, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <>
      <Textarea
        id="description"
        label="Description (for developers)"
        value={formData.description || ''}
        rows={2}
        onChange={(e) => handleChange('description', e.target.value)}
      />
      <Autocomplete
        id="eventcategory"
        name="eventcategory"
        label="Event Category"
        options={dropdownData.eventCategories}
        value={formData.eventcategory || ''}
        onChange={(value) => handleChange('eventcategory', value)}
        required
        placeholder="Search event category..."
      />
      <InputField
        id="eventactionname"
        name="eventactionname"
        label="Event Action Name"
        value="Outlink"
        readOnly
        required
      />
      <Autocomplete
        id="eventname"
        name="eventname"
        label="Event Name (Optional)"
        options={dropdownData.eventNames}
        value={formData.eventname || ''}
        onChange={(value) => handleChange('eventname', value)}
        placeholder="Search event name..."
      />
      <InputField
        id="eventvalue"
        name="eventvalue"
        label="Event Value (Optional)"
        value={formData.eventvalue || ''}
        onChange={(e) => handleChange('eventvalue', e.target.value)}
        placeholder="Enter Event Value"
      />
      <DimensionsSection
        dimensions={dropdownData.dimensions}
        selectedDimensions={formData.dimensions || []}
        onDimensionChange={handleDimensionChange}
      />
    </>
  );
};

export default OutlinkEventForm;
