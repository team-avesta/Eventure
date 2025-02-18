'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  PixelCoordinates,
  PercentageCoordinates,
  ImageSize,
  pixelsToPercentages,
  percentagesToPixels,
} from '@/utils/coordinateUtils';

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

export type Rectangle = {
  id?: string;
  startX: number;
  startY: number;
  width: number;
  height: number;
  eventType?: string;
  eventAction?: string;
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
  isDragMode: boolean;
  isDrawingEnabled: boolean;
  selectedEventType: {
    id: string;
    name: string;
    color: string;
  } | null;
  onDrawComplete?: () => void;
  initialRectangles?: Rectangle[];
  onRectangleClick?: (rectId: string) => void;
}

export default function ImageAnnotator({
  initialImage = '/placeholder.jpg',
  width = 800,
  height = 600,
  onRectanglesChange,
  isDragMode,
  isDrawingEnabled,
  selectedEventType,
  onDrawComplete,
  initialRectangles = [],
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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const HANDLE_SIZE = 8;

  const getResizeHandle = (
    x: number,
    y: number,
    rect: Rectangle
  ): ResizeHandle => {
    const imageSize = {
      width,
      height: imageHeight,
    };

    // Convert percentage coordinates to pixels for handle detection
    const pixelCoords = percentagesToPixels(rect, imageSize);
    const endX = pixelCoords.startX + pixelCoords.width;
    const endY = pixelCoords.startY + pixelCoords.height;

    // Check corners first
    if (
      Math.abs(x - pixelCoords.startX) <= HANDLE_SIZE &&
      Math.abs(y - pixelCoords.startY) <= HANDLE_SIZE
    )
      return 'topLeft';
    if (
      Math.abs(x - endX) <= HANDLE_SIZE &&
      Math.abs(y - pixelCoords.startY) <= HANDLE_SIZE
    )
      return 'topRight';
    if (
      Math.abs(x - pixelCoords.startX) <= HANDLE_SIZE &&
      Math.abs(y - endY) <= HANDLE_SIZE
    )
      return 'bottomLeft';
    if (Math.abs(x - endX) <= HANDLE_SIZE && Math.abs(y - endY) <= HANDLE_SIZE)
      return 'bottomRight';

    // Then check edges
    if (
      Math.abs(x - pixelCoords.startX) <= HANDLE_SIZE &&
      y > pixelCoords.startY &&
      y < endY
    )
      return 'left';
    if (Math.abs(x - endX) <= HANDLE_SIZE && y > pixelCoords.startY && y < endY)
      return 'right';
    if (
      Math.abs(y - pixelCoords.startY) <= HANDLE_SIZE &&
      x > pixelCoords.startX &&
      x < endX
    )
      return 'top';
    if (Math.abs(y - endY) <= HANDLE_SIZE && x > pixelCoords.startX && x < endX)
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

  const isPointInRect = (x: number, y: number, rect: Rectangle) => {
    const imageSize = {
      width,
      height: imageHeight,
    };
    const pixelCoords = percentagesToPixels(rect, imageSize);
    return (
      x >= pixelCoords.startX &&
      x <= pixelCoords.startX + pixelCoords.width &&
      y >= pixelCoords.startY &&
      y <= pixelCoords.startY + pixelCoords.height
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

    const imageSize = {
      width,
      height: imageHeight,
    };

    if (isResizing && selectedRectIndex !== -1) {
      canvas.style.cursor = getCursorStyle(resizeHandle);
      const dx = x - currentPos.x;
      const dy = y - currentPos.y;

      setRectangles((prev) =>
        prev.map((r, i) => {
          if (i === selectedRectIndex) {
            // Convert percentage coordinates to pixels for manipulation
            const pixelCoords = percentagesToPixels(r, imageSize);
            let newRect = { ...pixelCoords };

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

            // Convert back to percentages
            return {
              ...r,
              ...pixelsToPercentages(newRect, imageSize),
            };
          }
          return r;
        })
      );
    } else if (isDragging && selectedRectIndex !== -1) {
      canvas.style.cursor = 'move';
      const dx = ((x - currentPos.x) / imageSize.width) * 100;
      const dy = ((y - currentPos.y) / imageSize.height) * 100;

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
      const isOverRect = rectangles.some((r) => {
        const pixelCoords = percentagesToPixels(r, imageSize);
        return isPointInRect(x, y, pixelCoords);
      });
      if (isDragMode) {
        // Check for resize handles first
        const rectIndex = rectangles.findIndex((r) => {
          const pixelCoords = percentagesToPixels(r, imageSize);
          const handle = getResizeHandle(x, y, pixelCoords);
          return handle !== null;
        });
        if (rectIndex !== -1) {
          const pixelCoords = percentagesToPixels(
            rectangles[rectIndex],
            imageSize
          );
          const handle = getResizeHandle(x, y, pixelCoords);
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
      const imageSize = {
        width,
        height: imageHeight,
      };

      const pixelCoords = {
        startX: Math.min(startPos.x, currentPos.x),
        startY: Math.min(startPos.y, currentPos.y),
        width: Math.abs(currentPos.x - startPos.x),
        height: Math.abs(currentPos.y - startPos.y),
      };

      const percentageCoords = pixelsToPercentages(pixelCoords, imageSize);

      // Only add rectangle and trigger callback if the rectangle has some size
      if (percentageCoords.width > 0.5 && percentageCoords.height > 0.5) {
        const newRect: Rectangle = {
          ...percentageCoords,
          eventType: selectedEventType?.id,
        };

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
    if (isDragMode) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const imageSize = {
      width,
      height: imageHeight,
    };

    // Check if clicking on any rectangle or its label
    const clickedRectIndex = rectangles.findIndex((r) => {
      const pixelCoords = percentagesToPixels(r, imageSize);
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
            x >= pixelCoords.startX &&
            x <= pixelCoords.startX + labelWidth &&
            y >= pixelCoords.startY - labelHeight &&
            y <= pixelCoords.startY;

          return inRect || inLabel;
        }
      }
      return inRect;
    });

    if (clickedRectIndex !== -1) {
      const clickedRect = rectangles[clickedRectIndex];
      if (clickedRect.id) {
        onRectangleClick?.(clickedRect.id);
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageSize = {
      width,
      height: imageHeight,
    };

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2.5;

    // Draw all saved rectangles
    rectangles.forEach((rect: Rectangle, index) => {
      const isSelected = index === selectedRectIndex;
      const rectEventType = EVENT_TYPES.find((t) => t.id === rect.eventType);

      // Convert percentage coordinates to pixels for drawing
      const pixelCoords = percentagesToPixels(rect, imageSize);

      // Draw rectangle
      ctx.beginPath();
      ctx.strokeStyle = isSelected
        ? 'green'
        : rectEventType?.color || '#000000';
      ctx.fillStyle = isSelected
        ? 'rgba(0, 255, 0, 0.1)'
        : `${rectEventType?.color}1A` || 'rgba(0, 0, 0, 0.1)';
      ctx.rect(
        pixelCoords.startX,
        pixelCoords.startY,
        pixelCoords.width,
        pixelCoords.height
      );
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
          pixelCoords.startX,
          pixelCoords.startY - labelHeight,
          labelWidth,
          labelHeight
        );
        ctx.globalAlpha = 1.0;

        // Draw label text
        ctx.fillStyle = '#FFFFFF';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          labelText,
          pixelCoords.startX + padding,
          pixelCoords.startY - labelHeight / 2
        );
      }

      // Draw resize handles if selected in drag mode
      if (isDragMode && isSelected) {
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;

        // Corner handles
        const handles = [
          { x: pixelCoords.startX, y: pixelCoords.startY },
          { x: pixelCoords.startX + pixelCoords.width, y: pixelCoords.startY },
          { x: pixelCoords.startX, y: pixelCoords.startY + pixelCoords.height },
          {
            x: pixelCoords.startX + pixelCoords.width,
            y: pixelCoords.startY + pixelCoords.height,
          },
          // Edge handles
          {
            x: pixelCoords.startX + pixelCoords.width / 2,
            y: pixelCoords.startY,
          },
          {
            x: pixelCoords.startX + pixelCoords.width / 2,
            y: pixelCoords.startY + pixelCoords.height,
          },
          {
            x: pixelCoords.startX,
            y: pixelCoords.startY + pixelCoords.height / 2,
          },
          {
            x: pixelCoords.startX + pixelCoords.width,
            y: pixelCoords.startY + pixelCoords.height / 2,
          },
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
    imageHeight,
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

  return (
    <div className="flex flex-col gap-4">
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
            unoptimized
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
        </div>
      </div>
    </div>
  );
}
