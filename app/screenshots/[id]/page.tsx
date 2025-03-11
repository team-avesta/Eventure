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
import { Autocomplete } from '@/components/common/Autocomplete';
import DimensionDisplay from '@/components/common/DimensionDisplay';
import InputField from '@/components/common/InputField';
import CheckboxField from '@/components/common/CheckboxField';
import DimensionsSection from '@/components/common/DimensionsSection';
import EmptyState from '@/components/screenshots/module/EmptyState';
import { FiX, FiMoreVertical, FiChevronRight, FiInfo } from 'react-icons/fi';
import { Textarea } from '@/components/common/Textarea';
import EventPanel from '@/components/screenshots/detail/EventPanel/EventPanel';
import EventTypeSelector from '@/components/screenshots/detail/EventTypeSelector';
import { ScreenshotHeader } from '@/components/screenshots/detail/Header';
import {
  EVENT_TYPES,
  getEventTypeBorderColor,
  getEventTypeDescription,
} from '../../../src/constants/constants';
import { RectangleState } from '../../../src/types/types';
import { useDropdownData } from '@/hooks/useDropdownData';
import { useEventForm } from '@/hooks/useEventForm';

export default function ScreenshotDetailPage() {
  const params = useParams();
  const screenshotId = params.id as string;
  const [isDraggable, setIsDraggable] = useState(false);
  const [showEventTypeModal, setShowEventTypeModal] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState<{
    id: string;
    name: string;
    color: string;
  } | null>(null);
  const [userRole, setUserRole] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<Event> | null>(null);
  const {
    data: dropdownData,
    error: dropdownError,
    getPageById,
    getPageByTitle,
  } = useDropdownData();
  const [rectangles, setRectangles] = useState<RectangleState[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [highlightedCardId, setHighlightedCardId] = useState<string | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [modules, setModules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventFilter, setSelectedEventFilter] = useState<string>('all');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Rectangle | null>(null);
  const [activeDropdownId, setActiveDropdownId] = useState<string | undefined>(
    undefined
  );
  const [containerWidth, setContainerWidth] = useState(0);

  const {
    formData,
    setFormData,
    selectedPageId,
    setSelectedPageId,
    isSubmitting,
    setIsSubmitting,
    showDescriptionModal,
    setShowDescriptionModal,
    selectedDescription,
    setSelectedDescription,
    resetForm,
    handleDimensionChange,
    prepareFormDataForSubmission,
    populateFormFromEvent,
    handleViewDescription,
  } = useEventForm();

  useEffect(() => {
    if (dropdownError) {
      toast.error('Failed to load form data');
    }
  }, [dropdownError]);

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

  const getEventTypeBorderColor = (eventType: string): string => {
    const type = EVENT_TYPES.find((t) => t.id === eventType);
    return type ? type.color : '#3B82F6';
  };

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
    resetForm();
    setIsEditing(false); // Reset editing state
    toast.success(`Click and drag on the image to add a ${type.name} event`);
  };

  // Handle form submission
  const handleEventFormSubmit = async (formValues: FormData) => {
    if (!newEvent) return;

    setIsSubmitting(true);

    // Use the prepareFormDataForSubmission function from useEventForm
    const formData = prepareFormDataForSubmission(
      formValues,
      selectedEventType?.id || ''
    );

    let eventData: any = {
      id: newEvent.id || Date.now().toString(),
      coordinates: newEvent.coordinates!,
      screenshotId,
      eventType: selectedEventType?.id || '',
      name:
        selectedEventType?.id === EventType.PageView
          ? getPageByTitle(formData.name)?.title || ''
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
      resetForm();
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
                value={getPageById(selectedPageId)?.title || ''}
                onChange={(value) => {
                  const selectedPage = getPageByTitle(value);
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
              value={getPageById(selectedPageId)?.url || ''}
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
    // Reset form data
    resetForm();
  };

  const handleEditEvent = (rect: Rectangle) => {
    const event = events.find((e) => e.id === rect.id);
    if (!event) return;

    if (event) {
      setIsEditing(true); // Set editing state
      setSelectedEventType(
        EVENT_TYPES.find((t) => t.id === event.eventType) || null
      );

      // Use populateFormFromEvent from useEventForm
      populateFormFromEvent(event, event.eventType, dropdownData.pageData);

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
          setActiveDropdownId(undefined);
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

  const handleCardClick = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
    if (activeDropdownId) {
      setActiveDropdownId(undefined);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <ScreenshotHeader
        moduleName={parentModule.name}
        moduleKey={parentModule.key}
        screenshotName={screenshot.name}
        userRole={userRole}
        isDraggable={isDraggable}
        setIsDraggable={setIsDraggable}
        eventTypes={EVENT_TYPES}
        onAddEventClick={() => setShowEventTypeModal(true)}
        onReplaceImageClick={handleReplaceClick}
        handleFileChange={handleFileChange}
        fileInputRef={fileInputRef}
      />

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
          <EventPanel
            events={events}
            rectangles={rectangles}
            selectedEventFilter={selectedEventFilter}
            highlightedCardId={highlightedCardId}
            expandedId={expandedId}
            userRole={userRole}
            activeDropdownId={activeDropdownId}
            dimensions={dropdownData.dimensions}
            onFilterChange={setSelectedEventFilter}
            onCardClick={handleCardClick}
            onDropdownToggle={setActiveDropdownId}
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleDeleteEvent}
            onViewDescription={handleViewDescription}
            getEventTypeBorderColor={getEventTypeBorderColor}
          />
        </div>
      </div>

      {/* Event Type Selection Modal */}
      <EventTypeSelector
        isOpen={showEventTypeModal}
        eventTypes={EVENT_TYPES}
        onClose={() => setShowEventTypeModal(false)}
        onSelect={handleEventTypeSelect}
        getEventTypeDescription={getEventTypeDescription}
      />

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
                      handleEventFormSubmit(new FormData(e.currentTarget));
                    }}
                    className="mt-6 space-y-4"
                  >
                    <Textarea
                      id="description"
                      label="Description (for developers)"
                      value={formData.description || ''}
                      rows={2}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                    />
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
