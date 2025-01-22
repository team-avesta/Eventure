import { useState, useRef } from 'react';
import toast from 'react-hot-toast';

interface UseScreenshotUploadProps {
  onSuccess?: () => void;
}

export function useScreenshotUpload({
  onSuccess,
}: UseScreenshotUploadProps = {}) {
  const [file, setFile] = useState<File | null>(null);
  const [pageName, setPageName] = useState<string>('');
  const [customName, setCustomName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setFile(null);
    setPageName('');
    setCustomName('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateFile = (file: File): string | null => {
    if (file.size > 10 * 1024 * 1024) {
      return 'File size exceeds 10MB limit';
    }
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      return 'Invalid file type. Only JPEG, PNG and GIF are allowed';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!file) {
      setError('Please select a file');
      return;
    }

    if (!pageName) {
      setError('Please select a module');
      return;
    }

    const fileError = validateFile(file);
    if (fileError) {
      setError(fileError);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('pageName', pageName);
    if (customName.trim()) {
      formData.append('customName', customName.trim());
    }

    setIsUploading(true);
    try {
      const response = await fetch('/api/s3/screenshots', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      toast.success('Screenshot uploaded successfully');
      resetForm();
      onSuccess?.();
    } catch (error: any) {
      if (error.message.includes('File size exceeds')) {
        setError('File size is too large. Maximum size is 10MB.');
      } else if (error.message.includes('Invalid file type')) {
        setError('Invalid file type. Only JPEG, PNG and GIF are allowed.');
      } else if (error.message.includes('Module not found')) {
        setError('Selected module was not found. Please try again.');
      } else {
        setError('Failed to upload screenshot. Please try again.');
        toast.error('Failed to upload screenshot');
      }
    } finally {
      setIsUploading(false);
    }
  };

  return {
    file,
    setFile,
    pageName,
    setPageName,
    customName,
    setCustomName,
    error,
    fileInputRef,
    isUploading,
    handleSubmit,
    resetForm,
  };
}
