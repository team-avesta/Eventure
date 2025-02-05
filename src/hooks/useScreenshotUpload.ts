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

    setIsUploading(true);
    try {
      // 1. Get presigned URL
      const presignedUrlResponse = await fetch(
        `/api/s3/presigned?fileType=${encodeURIComponent(
          file.type
        )}&moduleKey=${encodeURIComponent(pageName)}`
      );

      if (!presignedUrlResponse.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { presignedUrl, key } = await presignedUrlResponse.json();

      // 2. Upload to S3 directly
      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      // 3. Notify backend of successful upload
      const finalizeResponse = await fetch('/api/s3/screenshots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key,
          pageName,
          customName: customName.trim(),
        }),
      });

      if (!finalizeResponse.ok) {
        throw new Error('Failed to process upload');
      }

      toast.success('Screenshot uploaded successfully');
      resetForm();
      onSuccess?.();
    } catch (error: any) {
      setError('Failed to upload screenshot. Please try again.');
      toast.error('Failed to upload screenshot');
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
