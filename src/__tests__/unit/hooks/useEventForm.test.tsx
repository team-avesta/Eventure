import { renderHook, act } from '@testing-library/react';
import { useEventForm } from '@/hooks/useEventForm';
import { EEventType } from '@/services/adminS3Service';
import { Event } from '@/types';

describe('useEventForm', () => {
  // Test initial state
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useEventForm());

    expect(result.current.formData).toEqual({});
    expect(result.current.selectedPageId).toBe('');
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.showDescriptionModal).toBe(false);
    expect(result.current.selectedDescription).toBe(null);
  });

  // Test resetForm
  it('should reset form state', () => {
    const { result } = renderHook(() => useEventForm());

    // Set some initial values
    act(() => {
      result.current.setFormData({ eventname: 'Test Event' });
      result.current.setSelectedPageId('page-123');
      result.current.setIsSubmitting(true);
    });

    // Verify values were set
    expect(result.current.formData).toEqual({ eventname: 'Test Event' });
    expect(result.current.selectedPageId).toBe('page-123');
    expect(result.current.isSubmitting).toBe(true);

    // Reset form
    act(() => {
      result.current.resetForm();
    });

    // Verify reset
    expect(result.current.formData).toEqual({});
    expect(result.current.selectedPageId).toBe('');
    expect(result.current.isSubmitting).toBe(false);
  });

  // Test handleDimensionChange
  it('should add dimension when checked is true', () => {
    const { result } = renderHook(() => useEventForm());

    act(() => {
      result.current.handleDimensionChange('dim1', true);
    });

    expect(result.current.formData.dimensions).toEqual(['dim1']);

    act(() => {
      result.current.handleDimensionChange('dim2', true);
    });

    expect(result.current.formData.dimensions).toEqual(['dim1', 'dim2']);
  });

  it('should remove dimension when checked is false', () => {
    const { result } = renderHook(() => useEventForm());

    // Add dimensions first
    act(() => {
      result.current.setFormData({ dimensions: ['dim1', 'dim2', 'dim3'] });
    });

    // Remove one dimension
    act(() => {
      result.current.handleDimensionChange('dim2', false);
    });

    expect(result.current.formData.dimensions).toEqual(['dim1', 'dim3']);
  });

  // Test prepareFormDataForSubmission
  describe('prepareFormDataForSubmission', () => {
    // Mock FormData
    const createMockFormData = (data: Record<string, string | string[]>) => {
      const formData = {
        get: jest.fn((key) => {
          if (Array.isArray(data[key])) return null;
          return data[key] as string;
        }),
        getAll: jest.fn((key) => {
          if (Array.isArray(data[key])) return data[key];
          return [];
        }),
      };
      return formData;
    };

    it('should prepare PageView form data correctly', () => {
      const { result } = renderHook(() => useEventForm());

      const mockFormData = createMockFormData({
        customTitle: 'Home Page',
        customUrl: '/home',
        description: 'Home page view',
        dimensions: ['dim1', 'dim2'],
      });

      const formData = result.current.prepareFormDataForSubmission(
        mockFormData,
        EEventType.PageView
      );

      expect(formData).toEqual({
        name: 'Home Page',
        category: '/home',
        action: '',
        value: '',
        dimensions: ['dim1', 'dim2'],
        description: 'Home page view',
      });
    });

    it('should prepare TrackEvent form data correctly', () => {
      const { result } = renderHook(() => useEventForm());

      const mockFormData = createMockFormData({
        eventname: 'Button Click',
        eventcategory: 'User Interaction',
        eventactionname: 'Click',
        eventvalue: '1',
        description: 'User clicked button',
        dimensions: ['dim1', 'dim3'],
      });

      const formData = result.current.prepareFormDataForSubmission(
        mockFormData,
        EEventType.TrackEvent
      );

      expect(formData).toEqual({
        name: 'Button Click',
        category: 'User Interaction',
        action: 'Click',
        value: '1',
        dimensions: ['dim1', 'dim3'],
        description: 'User clicked button',
      });
    });

    it('should prepare Outlink form data correctly', () => {
      const { result } = renderHook(() => useEventForm());

      const mockFormData = createMockFormData({
        eventname: 'External Link',
        eventcategory: 'Navigation',
        eventvalue: 'https://example.com',
        description: 'User clicked external link',
        dimensions: ['dim4'],
      });

      const formData = result.current.prepareFormDataForSubmission(
        mockFormData,
        EEventType.Outlink
      );

      expect(formData).toEqual({
        name: 'External Link',
        category: 'Navigation',
        action: 'Outlink',
        value: 'https://example.com',
        dimensions: ['dim4'],
        description: 'User clicked external link',
      });
    });

    it('should return default empty data for unknown event type', () => {
      const { result } = renderHook(() => useEventForm());

      const mockFormData = createMockFormData({});

      const formData = result.current.prepareFormDataForSubmission(
        mockFormData,
        'unknown-type' as EEventType
      );

      expect(formData).toEqual({
        name: '',
        category: '',
        action: '',
        value: '',
        dimensions: [],
      });
    });
  });

  // Test populateFormFromEvent
  describe('populateFormFromEvent', () => {
    it('should populate form for PageView event', () => {
      const { result } = renderHook(() => useEventForm());

      const event: Event = {
        id: 'event-123',
        name: 'Home Page',
        category: '/home',
        action: '',
        value: '',
        eventType: EEventType.PageView,
        coordinates: {
          startX: 0,
          startY: 0,
          width: 100,
          height: 100,
        },
        screenshotId: 'screenshot-123',
        updatedAt: '2023-01-01',
        dimensions: ['dim1', 'dim2'],
        description: 'Home page view',
      };

      const pageData: Array<{ id: string; title: string; url: string }> = [
        { id: 'page-123', title: 'Home Page', url: '/home' },
        { id: 'page-456', title: 'About Page', url: '/about' },
      ];

      act(() => {
        result.current.populateFormFromEvent(
          event,
          EEventType.PageView,
          pageData
        );
      });

      expect(result.current.selectedPageId).toBe('page-123');
      expect(result.current.formData).toEqual({
        dimensions: ['dim1', 'dim2'],
        description: 'Home page view',
      });
    });

    it('should populate form for TrackEvent event', () => {
      const { result } = renderHook(() => useEventForm());

      const event: Event = {
        id: 'event-456',
        name: 'Button Click',
        category: 'User Interaction',
        action: 'Click',
        value: '1',
        eventType: EEventType.TrackEvent,
        coordinates: {
          startX: 100,
          startY: 200,
          width: 50,
          height: 30,
        },
        screenshotId: 'screenshot-456',
        updatedAt: '2023-01-02',
        dimensions: ['dim3'],
        description: 'User clicked button',
      };

      const pageData: Array<{ id: string; title: string; url: string }> = [];

      act(() => {
        result.current.populateFormFromEvent(
          event,
          EEventType.TrackEvent,
          pageData
        );
      });

      expect(result.current.formData).toEqual({
        eventcategory: 'User Interaction',
        eventactionname: 'Click',
        eventname: 'Button Click',
        eventvalue: '1',
        dimensions: ['dim3'],
        description: 'User clicked button',
      });
    });
  });

  // Test handleViewDescription
  it('should set selected description and show modal', () => {
    const { result } = renderHook(() => useEventForm());

    act(() => {
      result.current.handleViewDescription(
        'dim-123',
        'This is a dimension description'
      );
    });

    expect(result.current.selectedDescription).toEqual({
      id: 'dim-123',
      description: 'This is a dimension description',
    });
    expect(result.current.showDescriptionModal).toBe(true);
  });
});
