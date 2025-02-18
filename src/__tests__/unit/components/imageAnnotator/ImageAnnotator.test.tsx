import {
  render,
  screen,
  act,
  fireEvent,
  waitFor,
} from '@testing-library/react';
import ImageAnnotator from '@/components/imageAnnotator/ImageAnnotator';

// Mock next/image since we're in a test environment
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // Convert boolean attributes to strings
    const stringProps = {
      ...props,
      fill: props.fill?.toString() || undefined,
      priority: props.priority?.toString() || undefined,
      unoptimized: props.unoptimized?.toString() || undefined,
    };
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={props.alt || ''} {...stringProps} />;
  },
}));

// Mock canvas context
const mockContext = {
  beginPath: jest.fn(),
  rect: jest.fn(),
  fill: jest.fn(),
  stroke: jest.fn(),
  clearRect: jest.fn(),
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 0,
  font: '',
  measureText: jest.fn().mockReturnValue({ width: 100 }),
  fillText: jest.fn(),
  textBaseline: '',
  globalAlpha: 1,
  fillRect: jest.fn(),
  canvas: document.createElement('canvas'),
  getContextAttributes: jest.fn(),
  globalCompositeOperation: '',
  drawImage: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  translate: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
  transform: jest.fn(),
  createLinearGradient: jest.fn(),
  createRadialGradient: jest.fn(),
  createPattern: jest.fn(),
  clearHitRegions: jest.fn(),
  addHitRegion: jest.fn(),
  removeHitRegion: jest.fn(),
  isPointInPath: jest.fn(),
  isPointInStroke: jest.fn(),
  setLineDash: jest.fn(),
  getLineDash: jest.fn(),
  closePath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  quadraticCurveTo: jest.fn(),
  bezierCurveTo: jest.fn(),
  arcTo: jest.fn(),
  arc: jest.fn(),
  ellipse: jest.fn(),
  clip: jest.fn(),
  createImageData: jest.fn(),
  getImageData: jest.fn(),
  putImageData: jest.fn(),
  setTransform: jest.fn(),
  getTransform: jest.fn(),
  resetTransform: jest.fn(),
  direction: 'ltr',
  imageSmoothingEnabled: true,
  imageSmoothingQuality: 'high' as ImageSmoothingQuality,
  lineCap: 'butt' as CanvasLineCap,
  lineDashOffset: 0,
  lineJoin: 'miter' as CanvasLineJoin,
  miterLimit: 10,
  shadowBlur: 0,
  shadowColor: '',
  shadowOffsetX: 0,
  shadowOffsetY: 0,
} as unknown as CanvasRenderingContext2D;

describe('ImageAnnotator', () => {
  const mockEventType = {
    id: 'pageview',
    name: 'Page View',
    color: '#2563EB',
  };

  const defaultProps = {
    initialImage: '/test-image.jpg',
    width: 800,
    height: 600,
    onRectanglesChange: jest.fn(),
    isDragMode: false,
    isDrawingEnabled: true,
    selectedEventType: mockEventType,
    onDrawComplete: jest.fn(),
    onRectangleClick: jest.fn(),
    initialRectangles: [],
  };

  const mockRect = {
    startX: 12.5,
    startY: 16.67,
    width: 25,
    height: 25,
    eventType: 'pageview',
    id: 'rect1',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock canvas getContext
    HTMLCanvasElement.prototype.getContext = jest.fn((contextId: string) => {
      if (contextId === '2d') {
        return mockContext;
      }
      return null;
    }) as jest.MockedFunction<typeof HTMLCanvasElement.prototype.getContext>;
  });

  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<ImageAnnotator {...defaultProps} />);
      expect(screen.getByRole('img')).toBeInTheDocument();
      expect(screen.getByRole('img')).toHaveAttribute('src', '/test-image.jpg');
    });

    it('renders with custom dimensions', () => {
      render(<ImageAnnotator {...defaultProps} width={1000} height={800} />);
      const canvas = document.querySelector('canvas');
      expect(canvas).toHaveAttribute('width', '1000');
      expect(canvas).toHaveAttribute('height', '800');
    });

    it('renders initial rectangles', () => {
      const initialRectangles = [mockRect];
      render(
        <ImageAnnotator
          {...defaultProps}
          initialRectangles={initialRectangles}
        />
      );
      const canvas = document.querySelector('canvas');
      expect(canvas).toBeInTheDocument();
      expect(mockContext.rect).toHaveBeenCalled();
    });
  });

  describe('Drawing Mode', () => {
    it('enables drawing when isDrawingEnabled is true', async () => {
      render(<ImageAnnotator {...defaultProps} isDrawingEnabled={true} />);
      const canvas = document.querySelector('canvas')!;
      expect(canvas.style.cursor).toBe('crosshair');
    });

    it('disables drawing when isDrawingEnabled is false', () => {
      render(<ImageAnnotator {...defaultProps} isDrawingEnabled={false} />);
      const canvas = document.querySelector('canvas')!;
      expect(canvas.style.cursor).toBe('pointer');
    });

    it('creates new rectangle on mouse drag', async () => {
      const onRectanglesChange = jest.fn();

      render(
        <ImageAnnotator
          {...defaultProps}
          isDrawingEnabled={true}
          onRectanglesChange={onRectanglesChange}
          selectedEventType={mockEventType}
        />
      );
      const canvas = document.querySelector('canvas')!;

      jest.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        width: 800,
        height: 600,
        right: 800,
        bottom: 600,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });

      // Simulate drawing a rectangle
      await act(async () => {
        fireEvent.mouseDown(canvas, { clientX: 100, clientY: 100 });
      });

      await act(async () => {
        fireEvent.mouseMove(canvas, { clientX: 300, clientY: 200 });
      });

      await act(async () => {
        fireEvent.mouseUp(canvas);
      });

      // Wait for state updates and verify percentage-based coordinates
      await waitFor(() => {
        const result = onRectanglesChange.mock.calls[0][0][0];
        expect(result.startX).toBeCloseTo(12.5, 1);
        expect(result.startY).toBeCloseTo(16.67, 1);
        expect(result.width).toBeCloseTo(25, 1);
        expect(result.height).toBeCloseTo(16.67, 1);
        expect(result.eventType).toBe('pageview');
      });
      expect(defaultProps.onDrawComplete).toHaveBeenCalled();
    });
  });

  describe('Drag Mode', () => {
    it('enables dragging when isDragMode is true', () => {
      render(
        <ImageAnnotator
          {...defaultProps}
          isDragMode={true}
          initialRectangles={[mockRect]}
          isDrawingEnabled={false}
        />
      );
      const canvas = document.querySelector('canvas')!;

      jest.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        width: 800,
        height: 600,
        right: 800,
        bottom: 600,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });

      // Click in the middle of the rectangle (in pixel coordinates)
      fireEvent.mouseDown(canvas, { clientX: 150, clientY: 150 });
      expect(canvas.style.cursor).toBe('move');
    });

    it('allows resizing rectangles', async () => {
      const onRectanglesChange = jest.fn();

      render(
        <ImageAnnotator
          {...defaultProps}
          isDragMode={true}
          initialRectangles={[mockRect]}
          onRectanglesChange={onRectanglesChange}
          isDrawingEnabled={false}
        />
      );
      const canvas = document.querySelector('canvas')!;

      jest.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        width: 800,
        height: 600,
        right: 800,
        bottom: 600,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });

      // Calculate pixel coordinates for the bottom-right corner
      const cornerX =
        (mockRect.startX * 800) / 100 + (mockRect.width * 800) / 100;
      const cornerY =
        (mockRect.startY * 600) / 100 + (mockRect.height * 600) / 100;

      // Simulate resizing from the bottom-right corner
      await act(async () => {
        fireEvent.mouseDown(canvas, {
          clientX: cornerX,
          clientY: cornerY,
        });
      });

      await act(async () => {
        fireEvent.mouseMove(canvas, {
          clientX: cornerX + 50,
          clientY: cornerY + 50,
        });
      });

      await act(async () => {
        fireEvent.mouseUp(canvas);
      });

      // Verify percentage-based coordinates after resize
      await waitFor(() => {
        const result = onRectanglesChange.mock.calls[0][0][0];
        expect(result.startX).toBeCloseTo(mockRect.startX, 1);
        expect(result.startY).toBeCloseTo(mockRect.startY, 1);
        expect(result.width).toBeCloseTo(mockRect.width + (50 / 800) * 100, 1);
        expect(result.height).toBeCloseTo(
          mockRect.height + (50 / 600) * 100,
          1
        );
        expect(result.eventType).toBe('pageview');
        expect(result.id).toBe('rect1');
      });
    });
  });

  describe('Event Handling', () => {
    it('calls onRectangleClick when clicking a rectangle', async () => {
      render(
        <ImageAnnotator
          {...defaultProps}
          initialRectangles={[mockRect]}
          isDragMode={false}
        />
      );
      const canvas = document.querySelector('canvas')!;

      jest.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        width: 800,
        height: 600,
        right: 800,
        bottom: 600,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });

      // Click in the middle of the rectangle (convert from percentage to pixels)
      const clickX =
        (mockRect.startX * 800) / 100 + (mockRect.width * 800) / 200;
      const clickY =
        (mockRect.startY * 600) / 100 + (mockRect.height * 600) / 200;

      await act(async () => {
        fireEvent.click(canvas, { clientX: clickX, clientY: clickY });
      });

      expect(defaultProps.onRectangleClick).toHaveBeenCalledWith('rect1');
    });
  });

  describe('State Updates', () => {
    it('updates rectangles when initialRectangles prop changes', () => {
      const { rerender } = render(
        <ImageAnnotator {...defaultProps} initialRectangles={[]} />
      );

      const newRectangles = [mockRect];
      rerender(
        <ImageAnnotator {...defaultProps} initialRectangles={newRectangles} />
      );

      const canvas = document.querySelector('canvas');
      expect(canvas).toBeInTheDocument();
      expect(mockContext.rect).toHaveBeenCalled();
    });

    it('updates image when initialImage prop changes', () => {
      const { rerender } = render(<ImageAnnotator {...defaultProps} />);

      rerender(
        <ImageAnnotator {...defaultProps} initialImage="/new-image.jpg" />
      );

      expect(screen.getByRole('img')).toHaveAttribute('src', '/new-image.jpg');
    });
  });
});
