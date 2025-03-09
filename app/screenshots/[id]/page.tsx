'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { Event } from '@/types';
import ImageAnnotatorWrapper from '@/components/imageAnnotator/ImageAnnotatorWrapper';
import type { Rectangle } from '@/components/imageAnnotator/ImageAnnotator';
import { adminS3Service, EventType } from '@/services/adminS3Service';
import EventTypeFilter from '@/components/eventFilter/EventTypeFilter';
import ConfirmationModal from '@/components/shared/ConfirmationModal';
import DescriptionModal from '@/components/shared/DescriptionModal';
import ActionDropdown from '@/components/shared/ActionDropdown';
import Breadcrumb from '@/components/common/Breadcrumb';
import { Autocomplete } from '@/components/common/Autocomplete';
import DimensionDisplay from '@/components/common/DimensionDisplay';
import InputField from '@/components/common/InputField';
import CheckboxField from '@/components/common/CheckboxField';
import DimensionsSection from '@/components/common/DimensionsSection';
import EmptyState from '@/components/screenshots/module/EmptyState';
import {
  FiPlus,
  FiX,
  FiMoreVertical,
  FiChevronRight,
  FiImage,
  FiInfo,
} from 'react-icons/fi';

const EVENT_TYPES = [
  { id: EventType.PageView, name: 'Page View', color: '#2563EB' },
  {
    id: EventType.TrackEventWithPageView,
    name: 'TrackEvent with PageView',
    color: '#16A34A',
  },
  { id: EventType.TrackEvent, name: 'TrackEvent', color: '#9333EA' },
  { id: EventType.Outlink, name: 'Outlink', color: '#DC2626' },
  { id: EventType.BackendEvent, name: 'Backend Event', color: '#F59E0B' },
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
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState<{
    id: string;
    description: string;
  } | null>(null);
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
    description?: string;
  }>({});
  const [isEditing, setIsEditing] = useState(false);
  const [modules, setModules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventFilter, setSelectedEventFilter] = useState<string>('all');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Rectangle | null>(null);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
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
    description?: string;
  }) => {
    if (!newEvent) return;

    setIsSubmitting(true);

    let eventData: any = {
      id: newEvent.id || Date.now().toString(),
      coordinates: newEvent.coordinates!,
      screenshotId,
      eventType: selectedEventType?.id || '',
      name:
        selectedEventType?.id === EventType.PageView
          ? dropdownData.pageData.find(
              (p) => p.title.toLowerCase() === formData.name.toLowerCase()
            )?.title || ''
          : formData.name,
      category: formData.category,
      action: formData.action,
      value: formData.value,
      dimensions: formData.dimensions,
      description: formData.description || undefined,
    };

    try {
      if (isEditing) {
        await adminS3Service.updateEvent(eventData);
      } else {
        await adminS3Service.createEvent(eventData);
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

      await refetchEvents();
      setShowEventForm(false);
      setNewEvent(null);
      setSelectedEventType(null);
      setIsEditing(false);
      toast.success(
        isEditing ? 'Event updated successfully' : 'Event saved successfully'
      );
    } catch (error) {
      toast.error(
        isEditing ? 'Failed to update event' : 'Failed to save event'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add dropdown data fetching
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const data = await adminS3Service.fetchDropdownData();
        setDropdownData(data);
      } catch (error) {
        toast.error('Failed to load form data');
      }
    };

    fetchDropdownData();
  }, []);

  const handleDimensionChange = (dimensionId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      dimensions: checked
        ? [...(prev.dimensions || []), dimensionId]
        : (prev.dimensions || []).filter((id) => id !== dimensionId),
    }));
  };

  const renderFormFields = () => {
    if (!selectedEventType) return null;

    const dimensionsSection = (
      <DimensionsSection
        dimensions={dropdownData.dimensions}
        selectedDimensions={formData.dimensions || []}
        onDimensionChange={handleDimensionChange}
      />
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

            <InputField
              id="customUrl"
              name="customUrl"
              label="Custom URL"
              value={
                dropdownData.pageData.find((p) => p.id === selectedPageId)
                  ?.url || ''
              }
              readOnly
              required
              placeholder="URL will be set automatically"
            />

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
              <InputField
                id="eventvalue"
                name="eventvalue"
                label="Event Value (Optional)"
                value={formData.eventvalue || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    eventvalue: e.target.value,
                  }))
                }
                placeholder="Enter Event Value"
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
              <InputField
                id="eventactionname"
                name="eventactionname"
                label="Event Action Name"
                value="Outlink"
                readOnly
                required
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
              <InputField
                id="eventvalue"
                name="eventvalue"
                label="Event Value (Optional)"
                value={formData.eventvalue || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    eventvalue: e.target.value,
                  }))
                }
                placeholder="Enter Event Value"
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
              description: event.description,
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
            description: event.description,
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

  // Add click handler for document to close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdownId) {
        const dropdownElement = document.querySelector(
          `[data-dropdown-id="${activeDropdownId}"]`
        );
        if (
          dropdownElement &&
          !dropdownElement.contains(event.target as Node)
        ) {
          setActiveDropdownId(null);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeDropdownId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!screenshot || !parentModule) {
    return <EmptyState message="Screenshot not found" />;
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
                    <FiPlus className="h-5 w-5 mr-2" />
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
                    <FiImage className="h-5 w-5 mr-2" />
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
                    return (
                      <div
                        key={rect.id}
                        id={`event-card-${rect.id}`}
                        className={`p-4 rounded-md transition-all relative cursor-pointer ${
                          highlightedCardId === rect.id
                            ? 'border ring-1 ring-opacity-50'
                            : 'border border-gray-200 hover:bg-gray-50'
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
                        onClick={() => {
                          setExpandedId(
                            expandedId === rect.id ? null : rect.id
                          );
                          // Close any open dropdown when clicking on a card
                          if (activeDropdownId) {
                            setActiveDropdownId(null);
                          }
                        }}
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

                        {/* Action Menu - Different UI for admin and non-admin */}
                        <div className="absolute top-3 right-3">
                          {userRole === 'admin' ? (
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent card click
                                  setActiveDropdownId(
                                    activeDropdownId === rect.id
                                      ? null
                                      : rect.id
                                  );
                                }}
                                className="p-1.5 text-gray-500 hover:text-gray-600 rounded-md hover:bg-gray-50 transition-colors"
                              >
                                <FiMoreVertical className="w-4 h-4" />
                              </button>
                              <ActionDropdown
                                isOpen={activeDropdownId === rect.id}
                                onClose={() => setActiveDropdownId(null)}
                                onEdit={handleEditEvent}
                                onDelete={handleDeleteEvent}
                                onViewDescription={(id, description) => {
                                  setSelectedDescription({ id, description });
                                  setShowDescriptionModal(true);
                                }}
                                event={{
                                  id: rect.id,
                                  startX: rect.startX,
                                  startY: rect.startY,
                                  width: rect.width,
                                  height: rect.height,
                                  eventType: rect.eventType,
                                  eventAction: rect.action || '',
                                  description: event?.description,
                                }}
                                isAdmin={userRole === 'admin'}
                              />
                            </div>
                          ) : event?.description ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDescription({
                                  id: rect.id,
                                  description: event.description || '',
                                });
                                setShowDescriptionModal(true);
                              }}
                              className="p-1.5 text-gray-500 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                            >
                              <FiInfo
                                className="w-4 h-4"
                                stroke="currentColor"
                              />
                            </button>
                          ) : null}
                        </div>

                        {/* Expanded Details */}
                        {expandedId === rect.id && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            {event?.name && eventType?.id !== 'pageview' && (
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
                  <FiX className="h-6 w-6" />
                </button>
              </div>

              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                  <FiPlus className="h-6 w-6 text-blue-600" />
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
                      <FiChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500" />
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
                  <FiX className="h-6 w-6" />
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
                          description: formData.get('description') as string,
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
                          description: formData.get('description') as string,
                        };
                        handleEventFormSubmit(eventData);
                      } else if (selectedEventType?.id === 'outlink') {
                        const eventData = {
                          name: (formData.get('eventname') as string) || '',
                          category: formData.get('eventcategory') as string,
                          action: 'Outlink',
                          value: (formData.get('eventvalue') as string) || '',
                          dimensions: Array.from(
                            formData.getAll('dimensions')
                          ) as string[],
                          description: formData.get('description') as string,
                        };
                        handleEventFormSubmit(eventData);
                      }
                    }}
                    className="mt-6 space-y-4"
                  >
                    <div>
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Description (for developers)
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows={2}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                        placeholder="Add description to help other developers understand this event's purpose"
                        value={formData.description || ''}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                      />
                    </div>

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
                        className={`rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Saving...' : 'Save Event'}
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

      <DescriptionModal
        isOpen={showDescriptionModal}
        onClose={() => {
          setShowDescriptionModal(false);
          setSelectedDescription(null);
        }}
        description={selectedDescription?.description || ''}
      />
    </div>
  );
}

function getEventTypeDescription(typeId: string): string {
  switch (typeId) {
    case EventType.PageView:
      return 'Track when users view a page';
    case EventType.TrackEventWithPageView:
      return 'Track user interactions that also trigger a page view';
    case EventType.TrackEvent:
      return 'Track user interactions without a page view';
    case EventType.Outlink:
      return 'Track when users click links to external sites';
    case EventType.BackendEvent:
      return 'Track backend-specific events and operations';
    default:
      return '';
  }
}
