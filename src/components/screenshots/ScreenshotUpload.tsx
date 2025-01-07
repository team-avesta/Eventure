'use client';

import { Select } from '@/components/common/Select';
import { FileUpload } from '@/components/common/FileUpload';
import { Button } from '@/components/common/Button';
import { useScreenshotUpload } from '@/hooks/useScreenshotUpload';

export default function ScreenshotUpload() {
  const {
    file,
    setFile,
    pageName,
    setPageName,
    error,
    modules,
    fileInputRef,
    isUploading,
    handleSubmit,
  } = useScreenshotUpload();

  const moduleOptions = [
    { value: '', label: 'Select a module' },
    ...(modules?.map((module) => ({
      value: module.key,
      label: module.name,
    })) || []),
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
