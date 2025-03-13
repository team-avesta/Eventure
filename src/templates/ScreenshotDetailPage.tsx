'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { Event, EventType } from '@/types';
import ImageAnnotatorWrapper from '@/components/imageAnnotator/ImageAnnotatorWrapper';
import type { Rectangle } from '@/components/imageAnnotator/ImageAnnotator';
import { adminS3Service, EEventType } from '@/services/adminS3Service';
import ConfirmationModal from '@/components/shared/ConfirmationModal';
import DescriptionModal from '@/components/shared/DescriptionModal';
import EmptyState from '@/components/screenshots/module/EmptyState';
import EventPanel from '@/components/screenshots/detail/EventPanel/EventPanel';
import EventTypeSelector from '@/components/screenshots/detail/EventTypeSelector';
import { ScreenshotHeader } from '@/components/screenshots/detail/Header';
import { EVENT_TYPES, getEventTypeDescription } from '@/constants/constants';
import { RectangleState } from '@/types/types';
import { useDropdownData } from '@/hooks/useDropdownData';
import { useEventForm } from '@/hooks/useEventForm';
import EventModalWrapper from '@/components/screenshots/detail/EventModals/EventModalWrapper';

const ScreenshotDetailPage = ({ userRole }: { userRole: string }) => {
  const params = useParams();
  const screenshotId = params.id as string;
  const [isDraggable, setIsDraggable] = useState(false);
  const [showEventTypeModal, setShowEventTypeModal] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState<EventType | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<Event> | null>(null);
  const { data: dropdownData, error: dropdownError } = useDropdownData();
  const [rectangles, setRectangles] = useState<RectangleState[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [highlightedCardId, setHighlightedCardId] = useState<string | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [modules, setModules] = useState<any[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventFilter, setSelectedEventFilter] = useState<string>('all');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Rectangle | null>(null);
  const [activeDropdownId, setActiveDropdownId] = useState<string | undefined>(
    undefined
  );
  const [containerWidth, setContainerWidth] = useState(0);

  const {
    isSubmitting,
    setIsSubmitting,
    showDescriptionModal,
    setShowDescriptionModal,
    selectedDescription,
    setSelectedDescription,
    resetForm,
    prepareFormDataForSubmission,
    populateFormFromEvent,
    handleViewDescription,
    formData,
    setFormData,
    handleDimensionChange,
  } = useEventForm();

  useEffect(() => {
    if (dropdownError) {
      toast.error('Failed to load form data');
    }
  }, [dropdownError]);

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
          eventType: event.eventType || '',
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

  const handleEventTypeSelect = (type: EventType) => {
    setShowEventTypeModal(false);
    setSelectedEventType(type);
    resetForm();
    setIsEditing(false);
    toast.success(`Click and drag on the image to add a ${type.name} event`);
  };

  const handleEventFormSubmit = async (e: any) => {
    e.preventDefault();
    const formValues = new FormData(e.currentTarget);

    if (!newEvent) return;

    setIsSubmitting(true);

    const formData = prepareFormDataForSubmission(
      formValues,
      selectedEventType?.id || ''
    );

    let eventData: Event = {
      id: newEvent.id || Date.now().toString(),
      coordinates: newEvent.coordinates!,
      screenshotId,
      eventType: selectedEventType?.id,
      ...(selectedEventType?.id === EEventType.PageView && {
        customTitle: formData.customTitle,
        customUrl: formData.customUrl,
      }),
      ...(selectedEventType?.id !== EEventType.PageView && {
        category: formData.category,
        action: formData.action,
        value: formData.value,
      }),
      description: formData.description || undefined,
      dimensions: formData.dimensions,
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
            eventType: eventData.eventType || '',
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
      populateFormFromEvent(
        event,
        event.eventType || '',
        dropdownData.pageData
      );

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

  const handleCardClick = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
    if (activeDropdownId) {
      setActiveDropdownId(undefined);
    }
  };

  const renderEventFormModal = () => {
    return (
      <EventModalWrapper
        showEventForm={showEventForm}
        handleCancelEventForm={handleCancelEventForm}
        isSubmitting={isSubmitting}
        handleEventFormSubmit={handleEventFormSubmit}
        selectedEventType={selectedEventType}
        formData={formData}
        setFormData={setFormData}
        handleDimensionChange={handleDimensionChange}
      />
    );
  };

  const renderConfirmationModal = () => {
    return (
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
    );
  };

  const renderDescriptionModal = () => {
    return (
      <DescriptionModal
        isOpen={showDescriptionModal}
        onClose={() => {
          setShowDescriptionModal(false);
          setSelectedDescription(null);
        }}
        description={selectedDescription?.description || ''}
      />
    );
  };

  const renderContent = () => {
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
            />
          </div>
        </div>

        <EventTypeSelector
          isOpen={showEventTypeModal}
          eventTypes={EVENT_TYPES}
          onClose={() => setShowEventTypeModal(false)}
          onSelect={handleEventTypeSelect}
        />

        {renderEventFormModal()}
        {renderConfirmationModal()}
        {renderDescriptionModal()}
      </div>
    );
  };

  return renderContent();
};

export default ScreenshotDetailPage;
