'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

const EVENT_TYPES = [
  { id: 'pageview', name: 'Page View', color: '#2563EB' },
  {
    id: 'trackevent_pageview',
    name: 'TrackEvent with PageView',
    color: '#16A34A',
  },
  { id: 'trackevent', name: 'TrackEvent', color: '#9333EA' },
  { id: 'outlink', name: 'Outlink', color: '#DC2626' },
];

export type Rectangle = {
  id?: string; // Rectangle ID which maps to event ID
  startX: number;
  startY: number;
  width: number;
  height: number;
  eventType?: string;
  eventAction?: string; // Only needed for label display
};

type ResizeHandle =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'topLeft'
  | 'topRight'
  | 'bottomLeft'
  | 'bottomRight'
  | null;

interface ImageAnnotatorProps {
  initialImage?: string;
  width?: number;
  height?: number;
  onRectanglesChange?: (rectangles: Rectangle[]) => void;
  className?: string;
  onImageUpload?: (file: File) => void;
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

export default function ImageAnnotator({
  initialImage = '/placeholder.jpg',
  width = 800,
  height = 600,
  onRectanglesChange,
  onImageUpload,
  className = '',
  isDragMode,
  isDrawingEnabled,
  selectedEventType,
  onDrawComplete,
  initialRectangles = [],
  onEditEvent,
  onDeleteEvent,
  onGetEventDetails,
  onRectangleClick,
}: ImageAnnotatorProps) {
  const [image, setImage] = useState<string>(initialImage);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [rectangles, setRectangles] = useState<Rectangle[]>(initialRectangles);
  const [selectedRectIndex, setSelectedRectIndex] = useState<number>(-1);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle>(null);
  const [imageHeight, setImageHeight] = useState<number>(height);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedInfo, setSelectedInfo] = useState<{
    x: number;
    y: number;
    eventDetails: any;
  } | null>(null);

  const HANDLE_SIZE = 8;

  const getResizeHandle = (
    x: number,
    y: number,
    rect: Rectangle
  ): ResizeHandle => {
    const { startX, startY, width: rectWidth, height: rectHeight } = rect;
    const endX = startX + rectWidth;
    const endY = startY + rectHeight;

    // Check corners first
    if (
      Math.abs(x - startX) <= HANDLE_SIZE &&
      Math.abs(y - startY) <= HANDLE_SIZE
    )
      return 'topLeft';
    if (
      Math.abs(x - endX) <= HANDLE_SIZE &&
      Math.abs(y - startY) <= HANDLE_SIZE
    )
      return 'topRight';
    if (
      Math.abs(x - startX) <= HANDLE_SIZE &&
      Math.abs(y - endY) <= HANDLE_SIZE
    )
      return 'bottomLeft';
    if (Math.abs(x - endX) <= HANDLE_SIZE && Math.abs(y - endY) <= HANDLE_SIZE)
      return 'bottomRight';

    // Then check edges
    if (Math.abs(x - startX) <= HANDLE_SIZE && y > startY && y < endY)
      return 'left';
    if (Math.abs(x - endX) <= HANDLE_SIZE && y > startY && y < endY)
      return 'right';
    if (Math.abs(y - startY) <= HANDLE_SIZE && x > startX && x < endX)
      return 'top';
    if (Math.abs(y - endY) <= HANDLE_SIZE && x > startX && x < endX)
      return 'bottom';

    return null;
  };

  const getCursorStyle = (handle: ResizeHandle): string => {
    if (isDrawingEnabled) return 'crosshair';
    if (isDragMode) {
      switch (handle) {
        case 'top':
        case 'bottom':
          return 'ns-resize';
        case 'left':
        case 'right':
          return 'ew-resize';
        case 'topLeft':
        case 'bottomRight':
          return 'nwse-resize';
        case 'topRight':
        case 'bottomLeft':
          return 'nesw-resize';
        default:
          return 'move';
      }
    }
    return 'pointer';
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload?.(file);
      const imageUrl = URL.createObjectURL(file);
      const img = document.createElement('img');
      img.onload = () => {
        const aspectRatio = img.height / img.width;
        const newHeight = Math.max(height, width * aspectRatio);
        setImageHeight(newHeight);
      };
      img.src = imageUrl;
      setImage(imageUrl);
    }
  };

  const isPointInRect = (x: number, y: number, rect: Rectangle) => {
    return (
      x >= rect.startX &&
      x <= rect.startX + rect.width &&
      y >= rect.startY &&
      y <= rect.startY + rect.height
    );
  };

  const startDrawing = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDragMode) {
      // Check for resize handles first
      let foundResizeHandle: ResizeHandle = null;
      const rectIndex = rectangles.findIndex((r) => {
        const handle = getResizeHandle(x, y, r);
        if (handle) {
          foundResizeHandle = handle;
          return true;
        }
        return false;
      });

      if (rectIndex !== -1) {
        setResizeHandle(foundResizeHandle);
        setIsResizing(true);
        setSelectedRectIndex(rectIndex);
      } else {
        // Check if clicking inside any rectangle for dragging
        const dragIndex = rectangles.findIndex((r) => isPointInRect(x, y, r));
        if (dragIndex !== -1) {
          setIsDragging(true);
          setSelectedRectIndex(dragIndex);
        }
      }
    } else if (isDrawingEnabled && selectedEventType) {
      setIsDrawing(true);
    }

    setStartPos({ x, y });
    setCurrentPos({ x, y });
  };

  const draw = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isResizing && selectedRectIndex !== -1) {
      canvas.style.cursor = getCursorStyle(resizeHandle);
      const dx = x - currentPos.x;
      const dy = y - currentPos.y;

      setRectangles((prev) =>
        prev.map((r, i) => {
          if (i === selectedRectIndex) {
            let newRect = { ...r };

            switch (resizeHandle) {
              case 'topLeft':
                newRect.startX += dx;
                newRect.startY += dy;
                newRect.width -= dx;
                newRect.height -= dy;
                break;
              case 'topRight':
                newRect.startY += dy;
                newRect.width += dx;
                newRect.height -= dy;
                break;
              case 'bottomLeft':
                newRect.startX += dx;
                newRect.width -= dx;
                newRect.height += dy;
                break;
              case 'bottomRight':
                newRect.width += dx;
                newRect.height += dy;
                break;
              case 'top':
                newRect.startY += dy;
                newRect.height -= dy;
                break;
              case 'bottom':
                newRect.height += dy;
                break;
              case 'left':
                newRect.startX += dx;
                newRect.width -= dx;
                break;
              case 'right':
                newRect.width += dx;
                break;
            }

            // Ensure width and height don't go negative
            if (newRect.width < 0) {
              newRect.startX += newRect.width;
              newRect.width = Math.abs(newRect.width);
            }
            if (newRect.height < 0) {
              newRect.startY += newRect.height;
              newRect.height = Math.abs(newRect.height);
            }

            return newRect;
          }
          return r;
        })
      );
    } else if (isDragging && selectedRectIndex !== -1) {
      canvas.style.cursor = 'move';
      const dx = x - currentPos.x;
      const dy = y - currentPos.y;

      setRectangles((prev) =>
        prev.map((r, i) => {
          if (i === selectedRectIndex) {
            return {
              ...r,
              startX: r.startX + dx,
              startY: r.startY + dy,
            };
          }
          return r;
        })
      );
    } else if (isDrawing) {
      canvas.style.cursor = 'crosshair';
      setCurrentPos({ x, y });
    } else {
      // Update cursor based on hover
      const isOverRect = rectangles.some((r) => isPointInRect(x, y, r));
      if (isDragMode) {
        // Check for resize handles first
        const rectIndex = rectangles.findIndex((r) => {
          const handle = getResizeHandle(x, y, r);
          return handle !== null;
        });
        if (rectIndex !== -1) {
          const handle = getResizeHandle(x, y, rectangles[rectIndex]);
          canvas.style.cursor = getCursorStyle(handle);
        } else {
          canvas.style.cursor = isOverRect ? 'move' : 'default';
        }
      } else {
        canvas.style.cursor = isOverRect ? 'pointer' : 'default';
      }
    }

    setCurrentPos({ x, y });
  };

  const stopDrawing = () => {
    if (isDrawing) {
      const newRect: Rectangle = {
        startX: startPos.x,
        startY: startPos.y,
        width: currentPos.x - startPos.x,
        height: currentPos.y - startPos.y,
        eventType: selectedEventType?.id,
      };
      if (newRect.width < 0) {
        newRect.startX += newRect.width;
        newRect.width = Math.abs(newRect.width);
      }
      if (newRect.height < 0) {
        newRect.startY += newRect.height;
        newRect.height = Math.abs(newRect.height);
      }

      // Only add rectangle and trigger callback if the rectangle has some size
      if (newRect.width > 5 && newRect.height > 5) {
        setRectangles((prev) => {
          const newRectangles = [...prev, newRect];
          onRectanglesChange?.(newRectangles);
          return newRectangles;
        });
        onDrawComplete?.();
      }
    } else if (isDragging || isResizing) {
      // Trigger callback with updated positions after drag/resize
      onRectanglesChange?.(rectangles);
    }

    setIsDrawing(false);
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
    setSelectedRectIndex(-1);
  };

  const handleClick = async (e: React.MouseEvent) => {
    // Don't show info when in drag mode
    if (isDragMode) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking on any rectangle or its label
    const clickedRectIndex = rectangles.findIndex((r) => {
      // Check rectangle bounds
      const inRect = isPointInRect(x, y, r);

      // Check label bounds
      const labelText = r.eventType === 'pageview' ? 'PageView' : r.eventAction;
      if (labelText) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.font = 'bold 12px Arial';
          const textMetrics = ctx.measureText(labelText);
          const padding = 4;
          const labelWidth = textMetrics.width + padding * 2;
          const labelHeight = 20;

          const inLabel =
            x >= r.startX &&
            x <= r.startX + labelWidth &&
            y >= r.startY - labelHeight &&
            y <= r.startY;

          return inRect || inLabel;
        }
      }
      return inRect;
    });

    if (clickedRectIndex !== -1) {
      const clickedRect = rectangles[clickedRectIndex];
      if (clickedRect.id) {
        // Trigger the click handler for the rectangle
        onRectangleClick?.(clickedRect.id);

        // Show event details if available
        if (onGetEventDetails) {
          const eventDetails = await onGetEventDetails(clickedRect.id);
          setSelectedInfo({
            x: e.clientX,
            y: e.clientY,
            eventDetails,
          });
        }
      }
    } else {
      setSelectedInfo(null);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2.5;

    // Draw all saved rectangles
    rectangles.forEach((rect: any, index) => {
      const isSelected = index === selectedRectIndex;
      const rectEventType = EVENT_TYPES.find((t) => t.id === rect.eventType);

      // Draw rectangle
      ctx.beginPath();
      ctx.strokeStyle = isSelected
        ? 'green'
        : rectEventType?.color || '#000000';
      ctx.fillStyle = isSelected
        ? 'rgba(0, 255, 0, 0.1)'
        : `${rectEventType?.color}1A` || 'rgba(0, 0, 0, 0.1)';
      ctx.rect(rect.startX, rect.startY, rect.width, rect.height);
      ctx.fill();
      ctx.stroke();

      // Add label with improved UI
      const labelText =
        rect.eventType === 'pageview' ? 'PageView' : rect.eventAction;
      if (labelText && labelText !== 'No Action') {
        // Draw label background
        ctx.font = 'bold 12px Arial';
        const textMetrics = ctx.measureText(labelText);
        const padding = 4;
        const labelWidth = textMetrics.width + padding * 2;
        const labelHeight = 20;

        ctx.fillStyle = rectEventType?.color || '#000000';
        ctx.globalAlpha = 0.9;
        ctx.fillRect(
          rect.startX,
          rect.startY - labelHeight,
          labelWidth,
          labelHeight
        );
        ctx.globalAlpha = 1.0;

        // Draw label text
        ctx.fillStyle = '#FFFFFF';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          labelText,
          rect.startX + padding,
          rect.startY - labelHeight / 2
        );
      }

      // Draw resize handles if selected in drag mode
      if (isDragMode && isSelected) {
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;

        // Corner handles
        const handles = [
          { x: rect.startX, y: rect.startY },
          { x: rect.startX + rect.width, y: rect.startY },
          { x: rect.startX, y: rect.startY + rect.height },
          { x: rect.startX + rect.width, y: rect.startY + rect.height },
          // Edge handles
          { x: rect.startX + rect.width / 2, y: rect.startY },
          { x: rect.startX + rect.width / 2, y: rect.startY + rect.height },
          { x: rect.startX, y: rect.startY + rect.height / 2 },
          { x: rect.startX + rect.width, y: rect.startY + rect.height / 2 },
        ];

        handles.forEach((handle) => {
          ctx.beginPath();
          ctx.rect(
            handle.x - HANDLE_SIZE / 2,
            handle.y - HANDLE_SIZE / 2,
            HANDLE_SIZE,
            HANDLE_SIZE
          );
          ctx.fill();
          ctx.stroke();
        });
      }
    });

    // Draw current rectangle if drawing
    if (isDrawing) {
      ctx.beginPath();
      ctx.strokeStyle = selectedEventType?.color || '#000000';
      ctx.fillStyle = `${selectedEventType?.color}1A` || 'rgba(0, 0, 0, 0.1)';
      ctx.lineWidth = 2.5;
      ctx.rect(
        startPos.x,
        startPos.y,
        currentPos.x - startPos.x,
        currentPos.y - startPos.y
      );
      ctx.fill();
      ctx.stroke();
    }
  }, [
    isDrawing,
    startPos,
    currentPos,
    rectangles,
    isDragMode,
    selectedRectIndex,
    width,
    height,
    selectedEventType,
  ]);

  useEffect(() => {
    setImage(initialImage);
    // Also update image height when image changes
    const img = document.createElement('img');
    img.onload = () => {
      const aspectRatio = img.height / img.width;
      const newHeight = Math.max(height, width * aspectRatio);
      setImageHeight(newHeight);
    };
    img.src = initialImage;
  }, [initialImage, height, width]);

  // Update rectangles when initialRectangles changes
  useEffect(() => {
    setRectangles(initialRectangles);
  }, [initialRectangles]);

  // Add effect to hide info when entering drag mode
  useEffect(() => {
    if (isDragMode) {
      setSelectedInfo(null);
    }
  }, [isDragMode]);

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div
        className="relative"
        style={{ width: `${width}px`, height: `${imageHeight}px` }}
      >
        <div className="absolute inset-0">
          <Image
            src={image}
            alt="Uploaded image"
            fill
            className="object-contain rounded-lg"
            priority
          />
          <canvas
            ref={canvasRef}
            width={width}
            height={imageHeight}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onClick={handleClick}
            className="absolute top-0 left-0 z-10"
            style={{ cursor: getCursorStyle(resizeHandle) }}
          />
          {selectedInfo && (
            <div
              className="absolute z-20 bg-white rounded-lg shadow-lg p-4 min-w-[300px] text-sm"
              style={{
                left: selectedInfo.x + 10,
                top: selectedInfo.y + 10,
              }}
            >
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <div className="font-semibold text-gray-900">
                    Event Details
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        selectedInfo.eventDetails?.id &&
                        onEditEvent?.(selectedInfo.eventDetails.id)
                      }
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() =>
                        selectedInfo.eventDetails?.id &&
                        onDeleteEvent?.(selectedInfo.eventDetails.id)
                      }
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {selectedInfo.eventDetails?.eventType === 'pageview' ? (
                    <div className="flex flex-col gap-1.5">
                      <div>
                        <span className="text-gray-500">Custom Title:</span>{' '}
                        <span className="text-gray-900">
                          {selectedInfo.eventDetails.name || '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Custom URL:</span>{' '}
                        <span className="text-gray-900">
                          {selectedInfo.eventDetails.category || '-'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      <div>
                        <span className="text-gray-500">Category:</span>{' '}
                        <span className="text-gray-900">
                          {selectedInfo.eventDetails?.category || '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Action Name:</span>{' '}
                        <span className="text-gray-900">
                          {selectedInfo.eventDetails?.action || '-'}
                        </span>
                      </div>
                      {selectedInfo.eventDetails?.name && (
                        <div>
                          <span className="text-gray-500">Name:</span>{' '}
                          <span className="text-gray-900">
                            {selectedInfo.eventDetails.name}
                          </span>
                        </div>
                      )}
                      {selectedInfo.eventDetails?.value && (
                        <div>
                          <span className="text-gray-500">Value:</span>{' '}
                          <span className="text-gray-900">
                            {selectedInfo.eventDetails.value}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="pt-1">
                    <div className="text-gray-500 mb-1.5">Dimensions:</div>
                    {selectedInfo.eventDetails?.dimensions?.length > 0 ? (
                      <div className="space-y-1">
                        {selectedInfo.eventDetails.dimensions.map(
                          (dimId: string, index: number) => (
                            <div
                              key={dimId}
                              className="flex items-center gap-2"
                            >
                              <span className="text-gray-500 min-w-[24px]">
                                {dimId}.
                              </span>
                              <span className="text-gray-900">
                                {
                                  selectedInfo.eventDetails.dimensionNames?.[
                                    index
                                  ]
                                }
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <div className="text-gray-500 italic">
                        No dimensions available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
