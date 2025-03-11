import { useState, useEffect } from 'react';
import { adminS3Service } from '@/services/adminS3Service';
import toast from 'react-hot-toast';

export type PageData = {
  id: string;
  title: string;
  url: string;
};

export type DimensionData = {
  id: string;
  name: string;
  description?: string;
  type: string;
};

export type DropdownData = {
  pageData: PageData[];
  dimensions: DimensionData[];
  eventCategories: string[];
  eventActionNames: string[];
  eventNames: string[];
};

export function useDropdownData() {
  const [data, setData] = useState<DropdownData>({
    pageData: [],
    dimensions: [],
    eventCategories: [],
    eventActionNames: [],
    eventNames: [],
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch dropdown data on mount
  useEffect(() => {
    fetchDropdownData();
  }, []);

  // Fetch dropdown data from API
  const fetchDropdownData = async () => {
    setError(null);

    try {
      const fetchedData = await adminS3Service.fetchDropdownData();
      setData(fetchedData);
    } catch (err) {
      const errorMessage = 'Failed to load dropdown data';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  // Get page data by ID
  const getPageById = (id: string): PageData | undefined => {
    return data.pageData.find((page) => page.id === id);
  };

  // Get page data by title
  const getPageByTitle = (title: string): PageData | undefined => {
    return data.pageData.find(
      (page) => page.title.toLowerCase() === title.toLowerCase()
    );
  };

  return {
    data,
    error,
    getPageById,
    getPageByTitle,
    fetchDropdownData,
  };
}
