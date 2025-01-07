'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

export type Rectangle = {
  startX: number;
  startY: number;
  width: number;
  height: number;
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
}

export default function ImageAnnotator({
  initialImage = '/placeholder.jpg',
  width = 800,
  height = 600,
  onRectanglesChange,
  className = '',
}: ImageAnnotatorProps) {
  const [image, setImage] = useState<string>(initialImage);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragMode, setDragMode] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [rectangles, setRectangles] = useState<Rectangle[]>([]);
  const [selectedRectIndex, setSelectedRectIndex] = useState<number>(-1);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle>(null);
  const [imageHeight, setImageHeight] = useState<number>(height);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
        return dragMode ? 'move' : 'crosshair';
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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

    if (dragMode) {
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
        // If not resizing, check for dragging
        const dragIndex = rectangles.findIndex((r) => isPointInRect(x, y, r));
        if (dragIndex !== -1) {
          setIsDragging(true);
          setSelectedRectIndex(dragIndex);
        }
      }
    } else {
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
    } else if (dragMode && !isResizing && !isDragging) {
      // Update cursor based on hover over resize handles
      const rectIndex = rectangles.findIndex((r) => {
        const handle = getResizeHandle(x, y, r);
        return handle !== null;
      });
      if (rectIndex !== -1) {
        const handle = getResizeHandle(x, y, rectangles[rectIndex]);
        canvas.style.cursor = getCursorStyle(handle);
      } else {
        canvas.style.cursor = dragMode ? 'move' : 'crosshair';
      }
    } else {
      canvas.style.cursor = dragMode ? 'move' : 'crosshair';
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
      };
      if (newRect.width < 0) {
        newRect.startX += newRect.width;
        newRect.width = Math.abs(newRect.width);
      }
      if (newRect.height < 0) {
        newRect.startY += newRect.height;
        newRect.height = Math.abs(newRect.height);
      }
      setRectangles((prev) => {
        const newRectangles = [...prev, newRect];
        onRectanglesChange?.(newRectangles);
        return newRectangles;
      });
    }
    setIsDrawing(false);
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
    setSelectedRectIndex(-1);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2.5;

    // Draw all saved rectangles
    rectangles.forEach((rect, index) => {
      const isSelected = index === selectedRectIndex;

      // Draw rectangle
      ctx.beginPath();
      ctx.strokeStyle = isSelected ? 'green' : dragMode ? 'blue' : 'red';
      ctx.fillStyle = isSelected
        ? 'rgba(0, 255, 0, 0.1)'
        : dragMode
        ? 'rgba(0, 0, 255, 0.1)'
        : 'rgba(255, 0, 0, 0.1)';
      ctx.rect(rect.startX, rect.startY, rect.width, rect.height);
      ctx.fill();
      ctx.stroke();

      // Draw resize handles if selected in drag mode
      if (dragMode && isSelected) {
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
      ctx.strokeStyle = 'red';
      ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
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
    dragMode,
    selectedRectIndex,
    width,
    height,
  ]);

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div className={`relative w-[${width}px] h-[${height}px] overflow-auto`}>
        <div
          className="relative"
          style={{ width: `${width}px`, height: `${imageHeight}px` }}
        >
          <Image
            src={image}
            alt="Uploaded image"
            fill
            className="object-cover rounded-lg"
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
            className="absolute top-0 left-0 z-10"
            style={{ cursor: dragMode ? 'move' : 'crosshair' }}
          />
        </div>
      </div>
      <div className="flex gap-4">
        <button
          onClick={() => setDragMode(!dragMode)}
          className={`px-4 py-2 ${
            dragMode ? 'bg-blue-500' : 'bg-gray-500'
          } text-white rounded-lg hover:opacity-90 transition-colors`}
        >
          {dragMode ? 'Dragging Mode' : 'Drawing Mode'}
        </button>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          ref={fileInputRef}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Upload New Image
        </button>
      </div>
    </div>
  );
}
