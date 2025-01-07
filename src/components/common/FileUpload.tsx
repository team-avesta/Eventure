import React, { useCallback } from 'react';
import { Input } from './Input';
import { UploadIcon } from './icons/UploadIcon';

interface FileUploadProps {
  onChange: (file: File | null) => void;
  inputRef?: React.RefObject<HTMLInputElement>;
  accept?: string;
  selectedFile?: File | null;
  error?: string;
  label?: string;
}

export function FileUpload({
  onChange,
  inputRef,
  accept = 'image/*',
  selectedFile,
  error,
  label = 'Screenshot',
}: FileUploadProps) {
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) onChange(file);
    },
    [onChange]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div className="space-y-2">
      <Input
        type="file"
        label={label}
        ref={inputRef}
        accept={accept}
        onChange={(e) => onChange(e.target.files?.[0] || null)}
        error={error}
        className="hidden"
        id="file-upload"
      />

      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-primary transition-colors duration-200"
      >
        <div className="space-y-2 text-center">
          <UploadIcon />
          <div className="flex text-sm text-gray-600">
            <label
              htmlFor="file-upload"
              className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary-hover focus-within:outline-none"
            >
              <span>Upload a file</span>
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
          {selectedFile && (
            <p className="text-sm text-gray-500">
              Selected: {selectedFile.name}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
