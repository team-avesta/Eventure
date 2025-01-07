'use client';

import ImageAnnotator from './ImageAnnotator';
import type { Rectangle } from './ImageAnnotator';

interface ImageAnnotatorWrapperProps {
  imageUrl: string;
  width: number;
  height: number;
  onRectanglesChange: (rectangles: Rectangle[]) => void;
  isDragMode: boolean;
  isDrawingEnabled: boolean;
  selectedEventType: {
    id: string;
    name: string;
    color: string;
  } | null;
  onDrawComplete?: () => void;
  initialRectangles?: Rectangle[];
  onEditEvent?: (rectId: string) => void;
  onDeleteEvent?: (rectId: string) => void;
  onGetEventDetails?: (rectId: string) => Promise<any>;
  onRectangleClick?: (rectId: string) => void;
}

export default function ImageAnnotatorWrapper({
  imageUrl,
  width,
  height,
  onRectanglesChange,
  isDragMode,
  isDrawingEnabled,
  selectedEventType,
  onDrawComplete,
  initialRectangles = [],
  onEditEvent,
  onDeleteEvent,
  onGetEventDetails,
  onRectangleClick,
}: ImageAnnotatorWrapperProps) {
  return (
    <ImageAnnotator
      initialImage={imageUrl}
      width={width}
      height={height}
      onRectanglesChange={onRectanglesChange}
      isDragMode={isDragMode}
      isDrawingEnabled={isDrawingEnabled}
      selectedEventType={selectedEventType}
      onDrawComplete={onDrawComplete}
      initialRectangles={initialRectangles}
      onEditEvent={onEditEvent}
      onDeleteEvent={onDeleteEvent}
      onGetEventDetails={onGetEventDetails}
      onRectangleClick={onRectangleClick}
    />
  );
}
