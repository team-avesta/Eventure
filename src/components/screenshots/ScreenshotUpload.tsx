'use client';

import { Select } from '@/components/shared/Select';
import { FileUpload } from '@/components/shared/FileUpload';
import { Button } from '@/components/shared/Button';
import { useScreenshotUpload } from '@/hooks/useScreenshotUpload';
import { Module } from '@/services/adminS3Service';
import { Input } from '@/components/shared/Input';
import { useEffect, useState } from 'react';
import { PageLabel } from '@/types/pageLabel';
import { pageLabelService } from '@/services/pageLabelService';

interface ScreenshotUploadProps {
  modules: Module[];
  onSuccess?: () => void;
}

export default function ScreenshotUpload({
  modules,
  onSuccess,
}: ScreenshotUploadProps) {
  const [availableLabels, setAvailableLabels] = useState<PageLabel[]>([]);
  const [selectedLabel, setSelectedLabel] = useState<string>('');

  const {
    file,
    setFile,
    pageName,
    setPageName,
    customName,
    setCustomName,
    setSelectedLabel: setHookSelectedLabel,
    error,
    fileInputRef,
    isUploading,
    handleSubmit,
  } = useScreenshotUpload({ onSuccess });

  // Fetch all labels regardless of module
  useEffect(() => {
    const fetchLabels = async () => {
      try {
        const labels = await pageLabelService.getAllLabels();
        setAvailableLabels(labels);
      } catch (error) {
        setAvailableLabels([]);
      }
    };

    fetchLabels();
  }, []);

  // Update the hook's selectedLabel when the component's selectedLabel changes
  useEffect(() => {
    setHookSelectedLabel(selectedLabel);
  }, [selectedLabel, setHookSelectedLabel]);

  const moduleOptions = [
    { value: '', label: 'Select a module' },
    ...(modules?.map((module) => ({
      value: module.key,
      label: module.name,
    })) || []),
  ];

  const labelOptions = [
    { value: '', label: 'Select a label (optional)' },
    ...availableLabels.map((label) => ({
      value: label.id,
      label: label.name,
    })),
  ];

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          id="pageName"
          label="Module"
          value={pageName}
          onChange={(e) => setPageName(e.target.value)}
          options={moduleOptions}
        />

        {availableLabels.length > 0 && (
          <Select
            id="label"
            label="Label (Optional)"
            value={selectedLabel}
            onChange={(e) => setSelectedLabel(e.target.value)}
            options={labelOptions}
          />
        )}

        <Input
          id="customName"
          label="Screenshot Name"
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          placeholder="Enter a descriptive name for this screenshot"
        />

        <FileUpload
          onChange={setFile}
          inputRef={fileInputRef}
          selectedFile={file}
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end">
          <Button type="submit" isLoading={isUploading}>
            {isUploading ? 'Uploading...' : 'Upload Screenshot'}
          </Button>
        </div>
      </form>
    </div>
  );
}
