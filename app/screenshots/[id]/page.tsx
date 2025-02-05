'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { Event } from '@/types';
import ImageAnnotatorWrapper from '@/components/imageAnnotator/ImageAnnotatorWrapper';
import type { Rectangle } from '@/components/imageAnnotator/ImageAnnotator';
import { adminS3Service } from '@/services/adminS3Service';
import EventTypeFilter from '@/components/eventFilter/EventTypeFilter';
import ConfirmationModal from '@/components/shared/ConfirmationModal';
import Breadcrumb from '@/components/common/Breadcrumb';
import DimensionDisplay from '@/components/common/DimensionDisplay';
import { Autocomplete } from '@/components/common/Autocomplete';

const EVENT_TYPES = [
  { id: 'pageview', name: 'Page View', color: '#2563EB' },
  {
    id: 'trackevent_pageview',
    name: 'TrackEvent with PageView',
    color: '#16A34A',
  },
  { id: 'trackevent', name: 'TrackEvent', color: '#9333EA' },
  { id: 'outlink', name: 'Outlink', color: '#DC2626' },
  { id: 'backendevent', name: 'Backend Event', color: '#F59E0B' },
];

type RectangleState = {
  id: string;
  startX: number;
  startY: number;
  width: number;
  height: number;
  color: string;
  eventType: string;
  action: string;
};

function getEventTypeBorderColor(eventType: string): string {
  const type = EVENT_TYPES.find((t) => t.id === eventType);
  return type ? type.color : '#3B82F6';
}

export default function ScreenshotDetailPage() {
  const params = useParams();
  const screenshotId = params.id as string;
  const [isDraggable, setIsDraggable] = useState(false);
  const [showEventTypeModal, setShowEventTypeModal] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [selectedEventType, setSelectedEventType] = useState<{
    id: string;
    name: string;
    color: string;
  } | null>(null);
  const [userRole, setUserRole] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<Event> | null>(null);
  const [dropdownData, setDropdownData] = useState<{
    pageData: Array<{
      id: string;
      title: string;
      url: string;
    }>;
    dimensions: Array<{
      id: string;
      name: string;
      description?: string;
      type: string;
    }>;
    eventCategories: string[];
    eventActionNames: string[];
    eventNames: string[];
  }>({
    pageData: [],
    dimensions: [],
    eventCategories: [],
    eventActionNames: [],
    eventNames: [],
  });
  const [selectedPageId, setSelectedPageId] = useState<string>('');
  const [rectangles, setRectangles] = useState<RectangleState[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [highlightedCardId, setHighlightedCardId] = useState<string | null>(
    null
  );
  const [formData, setFormData] = useState<{
    eventcategory?: string;
    eventactionname?: string;
    eventname?: string;
    eventvalue?: string;
    dimensions?: string[];
  }>({});
  const [isEditing, setIsEditing] = useState(false);
  const [modules, setModules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventFilter, setSelectedEventFilter] = useState<string>('all');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Rectangle | null>(null);

  useEffect(() => {
    const auth = sessionStorage.getItem('auth');
    if (auth) {
      const { role } = JSON.parse(auth);
      setUserRole(role);
    }
  }, []);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const modules = await adminS3Service.fetchModules();
        setModules(modules);
        setIsLoading(false);
      } catch (error) {
        toast.error('Failed to fetch modules');
        setIsLoading(false);
      }
    };

    fetchModules();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await adminS3Service.fetchEvents(screenshotId);
        setEvents(data);

        // Update rectangles state when events are loaded
        const savedRectangles = data.map((event: Event) => ({
          id: event.id,
          startX: event.coordinates.startX,
          startY: event.coordinates.startY,
          width: event.coordinates.width,
          height: event.coordinates.height,
          color:
            EVENT_TYPES.find((type) => type.id === event.eventType)?.color ||
            '#000000',
          eventType: event.eventType,
          action: event.action || 'No Action',
        }));
        setRectangles(savedRectangles);
      } catch (error) {
        toast.error('Failed to fetch events');
      }
    };

    if (screenshotId) {
      fetchEvents();
    }
  }, [screenshotId]);

  // Add refetch function for use in other parts of the component
  const refetchEvents = async () => {
    const data = await adminS3Service.fetchEvents(screenshotId);
    setEvents(data);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size should be less than 10MB');
      return;
    }

    try {
      // 1. Get presigned URL
      const presignedUrlResponse = await fetch(
        `/api/s3/presigned?fileType=${encodeURIComponent(
          file.type
        )}&moduleKey=${encodeURIComponent(parentModule.key)}`
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

      // 3. Update screenshot metadata
      const response = await fetch('/api/s3/screenshots/replace', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          screenshotId,
          key,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update screenshot metadata');
      }

      // Refetch modules to get updated screenshot
      const updatedModules = await adminS3Service.fetchModules();
      setModules(updatedModules);
      toast.success('Image replaced successfully');
    } catch (error) {
      console.error('Failed to replace image:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to replace image'
      );
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Find screenshot in any module
  const screenshot = modules
    ?.flatMap((mod) => mod.screenshots)
    .find((s: any) => s?.id === screenshotId);

  // Find the module containing this screenshot
  const parentModule = modules?.find((m) =>
    m.screenshots.some((s: any) => s.id === screenshotId)
  );

  const handleReplaceClick = () => {
    fileInputRef.current?.click();
  };

  const handleEventTypeSelect = (type: {
    id: string;
    name: string;
    color: string;
  }) => {
    setShowEventTypeModal(false);
    setSelectedEventType(type);
    // Clear form data for new event
    setFormData({});
    setSelectedPageId('');
    setIsEditing(false); // Reset editing state
    toast.success(`Click and drag on the image to add a ${type.name} event`);
  };

  // Handle form submission
  const handleEventFormSubmit = async (formData: {
    name: string;
    category: string;
    action: string;
    value: string;
    dimensions: string[];
  }) => {
    if (!newEvent) return;

    let eventData: any = {
      id: newEvent.id || Date.now().toString(),
      coordinates: newEvent.coordinates!,
      screenshotId,
      eventType: selectedEventType?.id || '',
      name:
        selectedEventType?.id === 'pageview'
          ? dropdownData.pageData.find((p) => p.id === formData.name)?.title ||
            ''
          : formData.name,
      category: formData.category,
      action: formData.action,
      value: formData.value,
      dimensions: formData.dimensions,
    };

    try {
      if (isEditing) {
        await adminS3Service.updateEvent(eventData);
      } else {
        await adminS3Service.createEvent(eventData);
        // Add to rectangles only after successful creation
        setRectangles((prev) => [
          ...prev,
          {
            id: eventData.id,
            startX: eventData.coordinates.startX,
            startY: eventData.coordinates.startY,
            width: eventData.coordinates.width,
            height: eventData.coordinates.height,
            color: selectedEventType?.color || '#000000',
            eventType: eventData.eventType,
            action: eventData.action || 'No Action',
          },
        ]);
      }

      // Refetch events to get the latest data
      await refetchEvents();

      setShowEventForm(false);
      setNewEvent(null);
      setSelectedEventType(null);
      setIsEditing(false);
      toast.success(
        isEditing ? 'Event updated successfully' : 'Event saved successfully'
      );
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error(
        isEditing ? 'Failed to update event' : 'Failed to save event'
      );
    }
  };

  // Add dropdown data fetching
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const data = await adminS3Service.fetchDropdownData();
        setDropdownData(data);
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
        toast.error('Failed to load form data');
      }
    };

    fetchDropdownData();
  }, []);

  // Handle title change for pageview
  const handleTitleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setSelectedPageId(selectedId);

    // Find corresponding URL
    const selectedPage = dropdownData.pageData.find(
      (page) => page.id === selectedId
    );
    if (selectedPage) {
      const urlInput = document.getElementById('customUrl') as HTMLInputElement;
      if (urlInput) {
        urlInput.value = selectedPage.url;
      }
    }
  };

  const renderFormFields = () => {
    if (!selectedEventType) return null;

    const dimensionsSection = (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Dimensions
        </label>
        <div className="max-h-[300px] overflow-y-auto border border-gray-300 rounded-md p-3 space-y-2">
          {dropdownData.dimensions.map((dimension) => (
            <label
              key={dimension.id}
              className="flex items-center space-x-3 hover:bg-gray-50 p-1 rounded cursor-pointer"
            >
              <input
                type="checkbox"
                name="dimensions"
                value={dimension.id}
                checked={formData.dimensions?.includes(dimension.id)}
                onChange={(e) => {
                  const dimensionId = dimension.id;
                  setFormData((prev) => ({
                    ...prev,
                    dimensions: e.target.checked
                      ? [...(prev.dimensions || []), dimensionId]
                      : (prev.dimensions || []).filter(
                          (id) => id !== dimensionId
                        ),
                  }));
                }}
                className="h-4 w-4 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                {String(dimension.id).padStart(2, '0')}. {dimension.name}
              </span>
            </label>
          ))}
        </div>
      </div>
    );

    switch (selectedEventType.id) {
      case 'pageview':
        return (
          <>
            <div>
              <Autocomplete
                id="customTitle"
                name="customTitle"
                label="Custom Title"
                options={dropdownData.pageData.map((page) => page.title)}
                value={
                  dropdownData.pageData.find((p) => p.id === selectedPageId)
                    ?.title || ''
                }
                onChange={(value) => {
                  const selectedPage = dropdownData.pageData.find(
                    (p) => p.title === value
                  );
                  if (selectedPage) {
                    setSelectedPageId(selectedPage.id);
                    setFormData((prev) => ({
                      ...prev,
                      customUrl: selectedPage.url,
                    }));
                  }
                }}
                required
                placeholder="Search custom title..."
              />
            </div>

            <div>
              <label
                htmlFor="customUrl"
                className="block text-sm font-medium text-gray-700"
              >
                Custom URL *
              </label>
              <input
                type="text"
                name="customUrl"
                id="customUrl"
                required
                readOnly
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm bg-gray-100 text-gray-600 cursor-not-allowed"
                placeholder="URL will be set automatically"
                value={
                  dropdownData.pageData.find((p) => p.id === selectedPageId)
                    ?.url || ''
                }
              />
            </div>

            {dimensionsSection}
          </>
        );

      case 'trackevent':
      case 'trackevent_pageview':
      case 'backendevent':
        return (
          <>
            <div>
              <Autocomplete
                id="eventcategory"
                name="eventcategory"
                label="Event Category"
                options={dropdownData.eventCategories}
                value={formData.eventcategory || ''}
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    eventcategory: value,
                  }))
                }
                required
                placeholder="Search event category..."
              />
            </div>

            <div>
              <Autocomplete
                id="eventactionname"
                name="eventactionname"
                label="Event Action Name"
                options={dropdownData.eventActionNames}
                value={formData.eventactionname || ''}
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    eventactionname: value,
                  }))
                }
                required
                placeholder="Search event action..."
              />
            </div>

            <div>
              <Autocomplete
                id="eventname"
                name="eventname"
                label="Event Name (Optional)"
                options={dropdownData.eventNames}
                value={formData.eventname || ''}
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    eventname: value,
                  }))
                }
                placeholder="Search event name..."
              />
            </div>

            <div>
              <label
                htmlFor="eventvalue"
                className="block text-sm font-medium text-gray-700"
              >
                Event Value (Optional)
              </label>
              <input
                type="text"
                name="eventvalue"
                id="eventvalue"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                placeholder="Enter Event Value"
                value={formData.eventvalue || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    eventvalue: e.target.value,
                  }))
                }
              />
            </div>

            {dimensionsSection}
          </>
        );

      case 'outlink':
        return (
          <>
            <div>
              <Autocomplete
                id="eventcategory"
                name="eventcategory"
                label="Event Category"
                options={dropdownData.eventCategories}
                value={formData.eventcategory || ''}
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    eventcategory: value,
                  }))
                }
                required
                placeholder="Search event category..."
              />
            </div>

            <div>
              <label
                htmlFor="eventactionname"
                className="block text-sm font-medium text-gray-700"
              >
                Event Action Name *
              </label>
              <input
                type="text"
                name="eventactionname"
                id="eventactionname"
                value="Outlink"
                readOnly
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>

            <div>
              <Autocomplete
                id="eventname"
                name="eventname"
                label="Event Name (Optional)"
                options={dropdownData.eventNames}
                value={formData.eventname || ''}
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    eventname: value,
                  }))
                }
                placeholder="Search event name..."
              />
            </div>

            <div>
              <label
                htmlFor="eventvalue"
                className="block text-sm font-medium text-gray-700"
              >
                Event Value (Optional)
              </label>
              <input
                type="text"
                name="eventvalue"
                id="eventvalue"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                placeholder="Enter Event Value"
                value={formData.eventvalue || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    eventvalue: e.target.value,
                  }))
                }
              />
            </div>

            {dimensionsSection}
          </>
        );
    }
  };

  const handleRectanglesChange = async (newRectangles: Rectangle[]) => {
    // If it's a new rectangle being drawn
    if (!isDraggable && selectedEventType) {
      const lastRect = newRectangles[newRectangles.length - 1];
      if (lastRect) {
        const newEventId = Date.now().toString();

        // Only set newEvent for the form
        setNewEvent({
          id: newEventId,
          coordinates: {
            startX: lastRect.startX,
            startY: lastRect.startY,
            width: lastRect.width,
            height: lastRect.height,
          },
          screenshotId,
          eventType: selectedEventType.id,
        });

        setShowEventForm(true);
      }
    } else if (isDraggable) {
      // If rectangles are being dragged/resized, update only the changed rectangle
      const updatedRectangles = await Promise.all(
        rectangles.map(async (rect) => {
          // Find the corresponding rectangle in newRectangles by matching id
          const newRect = newRectangles.find((r) => r.id === rect.id);
          if (!newRect) return rect;

          // Only update if position/size has changed
          if (
            rect.startX !== newRect.startX ||
            rect.startY !== newRect.startY ||
            rect.width !== newRect.width ||
            rect.height !== newRect.height
          ) {
            // Find the original event to preserve its data
            const originalEvent = events.find((e: Event) => e.id === rect.id);
            if (!originalEvent) return rect;

            // Create updated event with new coordinates
            const updatedEvent: any = {
              ...originalEvent,
              coordinates: {
                startX: newRect.startX,
                startY: newRect.startY,
                width: newRect.width,
                height: newRect.height,
              },
            };

            try {
              await adminS3Service.updateEvent(updatedEvent);
              await refetchEvents();

              // Return updated rectangle with new position
              return {
                ...rect,
                startX: newRect.startX,
                startY: newRect.startY,
                width: newRect.width,
                height: newRect.height,
              };
            } catch (error) {
              console.error('Error updating event:', error);
              toast.error('Failed to update event position');
              return rect; // Return original rectangle if update fails
            }
          }
          return rect;
        })
      );

      // Update local state with new positions
      setRectangles(updatedRectangles);
    }
  };

  const handleCancelEventForm = () => {
    setShowEventForm(false);
    setNewEvent(null);
    setSelectedEventType(null);
    // Reset any form data
    setFormData({});
    setSelectedPageId('');
  };

  const handleEditEvent = (rect: Rectangle) => {
    const event = events.find((e: Event) => e.id === rect.id);

    if (event) {
      setIsEditing(true); // Set editing state
      setSelectedEventType(
        EVENT_TYPES.find((t) => t.id === event.eventType) || null
      );

      // Pre-fill form data based on event type
      switch (event.eventType) {
        case 'pageview':
          const pageData = dropdownData.pageData.find(
            (p) => p.title === event.name
          );
          if (pageData) {
            setSelectedPageId(pageData.id);
            setFormData({
              dimensions: event.dimensions,
            });
          }
          break;

        case 'trackevent':
        case 'trackevent_pageview':
        case 'backendevent':
        case 'outlink':
          setFormData({
            eventcategory: event.category,
            eventactionname: event.action,
            eventname: event.name || '',
            eventvalue: event.value || '',
            dimensions: event.dimensions,
          });
          break;
      }

      setNewEvent({
        id: event.id,
        coordinates: event.coordinates,
        screenshotId,
        eventType: event.eventType,
      });

      setShowEventForm(true);
    }
  };

  const handleDeleteEvent = (rect: Rectangle) => {
    setEventToDelete(rect);
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;

    const event = rectangles.find(
      (r) =>
        r.startX === eventToDelete.startX &&
        r.startY === eventToDelete.startY &&
        r.width === eventToDelete.width &&
        r.height === eventToDelete.height
    );

    if (event) {
      try {
        await adminS3Service.deleteEvent(event.id);
        setRectangles((prev) => prev.filter((r) => r.id !== event.id));
        toast.success('Event deleted successfully');
      } catch (error) {
        console.error('Error deleting event:', error);
        toast.error('Failed to delete event');
      } finally {
        setShowDeleteConfirmation(false);
        setEventToDelete(null);
      }
    }
  };

  useEffect(() => {
    setContainerWidth(window.innerWidth - 0);
    const handleResize = () => {
      setContainerWidth(window.innerWidth - 0);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleRectangleClick = (rectId: string) => {
    const clickedRect = rectangles.find((r) => r.id === rectId);
    if (clickedRect) {
      // Auto-switch filter if needed
      if (
        selectedEventFilter !== 'all' &&
        selectedEventFilter !== clickedRect.eventType
      ) {
        setSelectedEventFilter(clickedRect.eventType);
        toast.success(
          `Switched to ${
            EVENT_TYPES.find((t) => t.id === clickedRect.eventType)?.name
          } filter`
        );
      }
      setHighlightedCardId(rectId);
      const card = document.getElementById(`event-card-${rectId}`);
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // Filter rectangles for right panel display
  const filteredRectangles = rectangles.filter(
    (rect) =>
      selectedEventFilter === 'all' || rect.eventType === selectedEventFilter
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!screenshot || !parentModule) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Screenshot not found</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-[95%] mx-auto px-6 py-3">
          <div className="flex flex-col space-y-4">
            {/* Top row with breadcrumb */}
            <div className="flex items-center justify-between">
              <Breadcrumb
                items={[
                  {
                    label: parentModule.name,
                    href: `/screenshots/modules/${parentModule.key}`,
                  },
                  {
                    label: screenshot.name,
                  },
                ]}
              />

              {userRole === 'admin' && (
                <div className="flex items-center gap-4">
                  {/* Add Event Button */}
                  <button
                    onClick={() => setShowEventTypeModal(true)}
                    className="inline-flex items-center h-11 px-5 rounded-md bg-[#0073CF] text-white hover:bg-[#005ba3] transition-colors duration-200 shadow-sm"
                  >
                    <svg
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <span className="text-sm font-medium">Add Event</span>
                  </button>

                  {/* Hidden file input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />

                  {/* Replace Image Button */}
                  <button
                    onClick={handleReplaceClick}
                    className="inline-flex items-center h-11 px-5 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors duration-200 shadow-sm"
                  >
                    <svg
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-sm font-medium">Replace Image</span>
                  </button>

                  {/* Drag Switch */}
                  <div className="h-11 px-5 rounded-md border border-gray-300 bg-white flex items-center shadow-sm">
                    <label className="flex items-center cursor-pointer">
                      <span className="text-sm font-medium text-gray-700 mr-3">
                        Drag
                      </span>
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={isDraggable}
                          onChange={(e) => setIsDraggable(e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0073CF] rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0073CF]"></div>
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom row with legend */}
            <div className="flex items-center border-t border-gray-100 pt-3">
              <div className="flex items-center gap-6">
                {EVENT_TYPES.map((type) => (
                  <div key={type.id} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: type.color }}
                    />
                    <span className="text-sm text-gray-600">{type.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-[95%] w-full mx-auto py-4 overflow-hidden">
        <div className="flex gap-2 h-full">
          <div className="overflow-auto flex-1">
            <ImageAnnotatorWrapper
              imageUrl={screenshot.url}
              width={containerWidth * 0.729}
              height={containerWidth * 0.729 * 0.6}
              onRectanglesChange={handleRectanglesChange}
              isDragMode={isDraggable}
              isDrawingEnabled={!!selectedEventType}
              selectedEventType={selectedEventType}
              onDrawComplete={() => setShowEventForm(true)}
              initialRectangles={rectangles.map((rect) => ({
                id: rect.id,
                startX: rect.startX,
                startY: rect.startY,
                width: rect.width,
                height: rect.height,
                eventType: rect.eventType,
                eventAction: rect.action || '',
              }))}
              onRectangleClick={handleRectangleClick}
            />
          </div>

          {/* Right Panel */}
          <div className="w-[400px] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="sticky top-0 bg-white z-10 border-b border-gray-200">
              <div className="flex items-center justify-between p-3">
                <h3 className="text-base font-semibold text-gray-900">
                  Event Details
                </h3>
                <EventTypeFilter
                  selectedFilter={selectedEventFilter}
                  onFilterChange={setSelectedEventFilter}
                  rectangles={rectangles}
                />
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              <div className="space-y-3 p-4">
                {filteredRectangles
                  .sort((a, b) => {
                    const order = {
                      pageview: 1,
                      trackevent_pageview: 2,
                      trackevent: 3,
                      backendevent: 4,
                      outlink: 5,
                    };
                    return (
                      order[a.eventType as keyof typeof order] -
                      order[b.eventType as keyof typeof order]
                    );
                  })
                  .map((rect) => {
                    const eventType = EVENT_TYPES.find(
                      (t) => t.id === rect.eventType
                    );
                    const event = events.find((e: Event) => e.id === rect.id);
                    const tooltipId = `dimension-tooltip-${rect.id}-${rect.eventType}`;
                    return (
                      <div
                        key={rect.id}
                        id={`event-card-${rect.id}`}
                        className={`p-4 rounded-md transition-all relative cursor-pointer ${
                          expandedId === rect.id ? 'bg-gray-50' : ''
                        } ${
                          highlightedCardId === rect.id
                            ? 'border ring-1 ring-opacity-50'
                            : 'border border-gray-200 hover:border-blue-500'
                        }`}
                        style={
                          highlightedCardId === rect.id
                            ? ({
                                borderColor: getEventTypeBorderColor(
                                  rect.eventType
                                ),
                                '--tw-ring-color': getEventTypeBorderColor(
                                  rect.eventType
                                ),
                              } as React.CSSProperties)
                            : undefined
                        }
                        onClick={() =>
                          setExpandedId(expandedId === rect.id ? null : rect.id)
                        }
                      >
                        {/* Show category and action for non-pageview events */}
                        {event?.category && eventType?.id !== 'pageview' && (
                          <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
                            <span className="font-medium min-w-[90px] whitespace-nowrap">
                              Event Category:
                            </span>
                            <span
                              className="truncate pr-16"
                              title={event.category}
                            >
                              {event.category}
                            </span>
                          </div>
                        )}
                        {event?.action && (
                          <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
                            <span className="font-medium min-w-[90px] whitespace-nowrap">
                              Event Action:
                            </span>
                            <span
                              className="truncate pr-16"
                              title={event.action}
                            >
                              {event.action}
                            </span>
                          </div>
                        )}

                        {/* Show additional fields for pageview */}
                        {eventType?.id === 'pageview' && (
                          <>
                            <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
                              <span className="font-medium min-w-[90px] whitespace-nowrap">
                                Custom Title:
                              </span>
                              <span
                                className="truncate pr-4"
                                title={event?.name}
                              >
                                {event?.name}
                              </span>
                            </div>
                            <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
                              <span className="font-medium min-w-[90px] whitespace-nowrap">
                                Custom URL:
                              </span>
                              <span
                                className="truncate pr-4"
                                title={event?.category}
                              >
                                {event?.category}
                              </span>
                            </div>
                          </>
                        )}

                        {/* Action Buttons - Only show when card is expanded AND user is admin */}
                        {expandedId === rect.id && userRole === 'admin' && (
                          <div className="absolute top-3 right-3 flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditEvent({
                                  id: rect.id,
                                  startX: rect.startX,
                                  startY: rect.startY,
                                  width: rect.width,
                                  height: rect.height,
                                  eventType: rect.eventType,
                                  eventAction: rect.action || '',
                                });
                              }}
                              className="p-1.5 text-gray-500 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteEvent({
                                  id: rect.id,
                                  startX: rect.startX,
                                  startY: rect.startY,
                                  width: rect.width,
                                  height: rect.height,
                                  eventType: rect.eventType,
                                  eventAction: rect.action || '',
                                });
                              }}
                              className="p-1.5 text-gray-500 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        )}

                        {/* Expanded Details */}
                        {expandedId === rect.id && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            {event?.name && (
                              <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
                                <span className="font-medium min-w-[90px] whitespace-nowrap">
                                  Event Name:
                                </span>
                                <span
                                  className="truncate pr-4"
                                  title={event.name}
                                >
                                  {event.name}
                                </span>
                              </div>
                            )}
                            {event?.value && (
                              <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
                                <span className="font-medium min-w-[90px] whitespace-nowrap">
                                  Event Value:
                                </span>
                                <span
                                  className="truncate pr-4"
                                  title={event.value}
                                >
                                  {event.value}
                                </span>
                              </div>
                            )}
                            {event?.dimensions &&
                              event.dimensions.length > 0 && (
                                <div className="text-sm text-gray-600">
                                  <span className="font-medium">
                                    Dimensions:
                                  </span>
                                  <div className="mt-2 space-y-1.5">
                                    {event.dimensions.map((dim: string) => {
                                      const dimension =
                                        dropdownData.dimensions.find(
                                          (d) => d.id === dim
                                        );
                                      return dimension ? (
                                        <DimensionDisplay
                                          key={dim}
                                          dimension={dimension}
                                          eventId={event.id}
                                        />
                                      ) : null;
                                    })}
                                  </div>
                                </div>
                              )}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Type Selection Modal */}
      {showEventTypeModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowEventTypeModal(false)}
            />

            <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
              <div className="absolute right-0 top-0 pr-4 pt-4">
                <button
                  type="button"
                  className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={() => setShowEventTypeModal(false)}
                >
                  <span className="sr-only">Close</span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg
                    className="h-6 w-6 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <h3 className="text-lg font-semibold leading-6 text-gray-900">
                    Add New Event
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Select the type of event you want to add to this screenshot.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {EVENT_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleEventTypeSelect(type)}
                    className="relative w-full rounded-lg border p-4 hover:border-blue-500 transition-all duration-200 group"
                  >
                    <div className="flex items-center">
                      <div
                        className="h-4 w-4 rounded-full mr-4"
                        style={{ backgroundColor: type.color }}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 group-hover:text-blue-600">
                          {type.name}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          {getEventTypeDescription(type.id)}
                        </p>
                      </div>
                      <svg
                        className="h-5 w-5 text-gray-400 group-hover:text-blue-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Form Modal */}
      {showEventForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={handleCancelEventForm}
            />

            <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
              <div className="absolute right-0 top-0 pr-4 pt-4">
                <button
                  type="button"
                  className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={handleCancelEventForm}
                >
                  <span className="sr-only">Close</span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                  <h3 className="text-lg font-semibold leading-6 text-gray-900">
                    Event Details
                  </h3>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);

                      if (selectedEventType?.id === 'pageview') {
                        handleEventFormSubmit({
                          name: formData.get('customTitle') as string,
                          category: formData.get('customUrl') as string,
                          dimensions: Array.from(
                            formData.getAll('dimensions')
                          ) as string[],
                          action: '', // Not used for pageview
                          value: '', // Not used for pageview
                        });
                      } else if (
                        selectedEventType?.id === 'trackevent_pageview' ||
                        selectedEventType?.id === 'trackevent' ||
                        selectedEventType?.id === 'backendevent'
                      ) {
                        const eventData = {
                          name: (formData.get('eventname') as string) || '',
                          category: formData.get('eventcategory') as string,
                          action: formData.get('eventactionname') as string,
                          value: (formData.get('eventvalue') as string) || '',
                          dimensions: Array.from(
                            formData.getAll('dimensions')
                          ) as string[],
                        };
                        handleEventFormSubmit(eventData);
                      } else if (selectedEventType?.id === 'outlink') {
                        const eventData = {
                          name: (formData.get('eventname') as string) || '',
                          category: formData.get('eventcategory') as string, // Hardcoded for outlink
                          action: 'Outlink', // Hardcoded for outlink
                          value: (formData.get('eventvalue') as string) || '',
                          dimensions: Array.from(
                            formData.getAll('dimensions')
                          ) as string[],
                        };
                        handleEventFormSubmit(eventData);
                      }
                    }}
                    className="mt-6 space-y-4"
                  >
                    {renderFormFields()}

                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={handleCancelEventForm}
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Save Event
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={() => {
          setShowDeleteConfirmation(false);
          setEventToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
        confirmText="Delete Event"
        cancelText="Cancel"
      />
    </div>
  );
}

function getEventTypeDescription(typeId: string): string {
  switch (typeId) {
    case 'pageview':
      return 'Track when users view specific pages or sections';
    case 'trackevent_pageview':
      return 'Combine page view tracking with custom event data';
    case 'trackevent':
      return 'Track specific user interactions and custom events';
    case 'outlink':
      return 'Monitor clicks on external links and resources';
    case 'backendevent':
      return 'Track backend-specific events and operations';
    default:
      return '';
  }
}
