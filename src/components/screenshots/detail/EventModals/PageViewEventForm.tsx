import { Autocomplete } from '@/components/shared/Autocomplete';
import DimensionsSection from '@/components/shared/DimensionsSection';
import InputField from '@/components/shared/InputField';
import { Textarea } from '@/components/shared/Textarea';
import { useDropdownData } from '@/hooks/useDropdownData';
import { FormState } from '@/types/types';
import { ChangeEvent, useState, useEffect } from 'react';

interface PageViewEventFormProps {
  formData: FormState;
  setFormData: React.Dispatch<React.SetStateAction<FormState>>;
  handleDimensionChange: (dimensionId: string, checked: boolean) => void;
  selectedPageId: string;
  setSelectedPageId: React.Dispatch<React.SetStateAction<string>>;
  customTitle: string;
  customUrl: string;
}

const PageViewEventForm = ({
  formData,
  setFormData,
  handleDimensionChange,
  selectedPageId,
  setSelectedPageId,
  customTitle,
  customUrl,
}: PageViewEventFormProps) => {
  const { data: dropdownData, getPageById, getPageByTitle } = useDropdownData();

  const onChangeCustomTitle = (value: string) => {
    const selectedPage = getPageByTitle(value);
    if (selectedPage) {
      setSelectedPageId(selectedPage.id);
      setFormData((prev) => ({
        ...prev,
        customUrl: selectedPage.url,
      }));
    }
  };

  const onChangeDescription = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      description: e.target.value,
    }));
  };

  return (
    <>
      <Textarea
        id="description"
        label="Description (for developers)"
        value={formData.description || ''}
        rows={2}
        onChange={onChangeDescription}
      />
      <Autocomplete
        id="customTitle"
        name="customTitle"
        label="Custom Title"
        options={dropdownData.pageData.map((page) => page.title)}
        value={customTitle}
        onChange={onChangeCustomTitle}
        required
        placeholder="Search custom title..."
      />
      <InputField
        id="customUrl"
        name="customUrl"
        label="Custom URL"
        value={customUrl}
        readOnly
        required
        placeholder="URL will be set automatically"
      />
      <DimensionsSection
        dimensions={dropdownData.dimensions}
        selectedDimensions={formData.dimensions || []}
        onDimensionChange={handleDimensionChange}
      />
    </>
  );
};

export default PageViewEventForm;
