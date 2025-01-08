import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createScreenshot } from '@/services/screenshots';

export function useScreenshotUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [pageName, setPageName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: createScreenshot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['screenshots'] });
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      resetForm();
    },
    onError: (error: any) => {
      if (error.message.includes('File size exceeds')) {
        setError('File size is too large. Maximum size is 10MB.');
      } else if (error.message.includes('Invalid file type')) {
        setError('Invalid file type. Only JPEG, PNG and GIF are allowed.');
      } else if (error.message.includes('Module not found')) {
        setError('Selected module was not found. Please try again.');
      } else {
        setError('Failed to upload screenshot. Please try again.');
      }
    },
  });

  const resetForm = () => {
    setFile(null);
    setPageName('');
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

    uploadMutation.mutate(formData);
  };

  return {
    file,
    setFile,
    pageName,
    setPageName,
    error,
    fileInputRef,
    isUploading: uploadMutation.isPending,
    handleSubmit,
    resetForm,
  };
}
