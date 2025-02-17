import { render } from '@testing-library/react';
import ImageAnnotatorWrapper from '@/components/imageAnnotator/ImageAnnotatorWrapper';
import ImageAnnotator from '@/components/imageAnnotator/ImageAnnotator';
import type { Rectangle } from '@/components/imageAnnotator/ImageAnnotator';

// Mock the ImageAnnotator component
jest.mock('@/components/imageAnnotator/ImageAnnotator', () => {
  return jest.fn(() => null);
});

describe('ImageAnnotatorWrapper', () => {
  const mockRectangle: Rectangle = {
    id: 'rect1',
    startX: 10,
    startY: 20,
    width: 100,
    height: 50,
    eventType: 'test',
  };

  const mockProps = {
    imageUrl: 'https://example.com/image.jpg',
    width: 800,
    height: 600,
    onRectanglesChange: jest.fn(),
    isDragMode: false,
    isDrawingEnabled: true,
    selectedEventType: {
      id: 'test-id',
      name: 'Test Event',
      color: '#ff0000',
    },
    onDrawComplete: jest.fn(),
    initialRectangles: [mockRectangle],
    onRectangleClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles undefined optional props', () => {
    const requiredProps = {
      imageUrl: mockProps.imageUrl,
      width: mockProps.width,
      height: mockProps.height,
      onRectanglesChange: mockProps.onRectanglesChange,
      isDragMode: mockProps.isDragMode,
      isDrawingEnabled: mockProps.isDrawingEnabled,
      selectedEventType: mockProps.selectedEventType,
    };

    render(<ImageAnnotatorWrapper {...requiredProps} />);

    expect(ImageAnnotator).toHaveBeenCalledWith(
      {
        initialImage: requiredProps.imageUrl,
        width: requiredProps.width,
        height: requiredProps.height,
        onRectanglesChange: requiredProps.onRectanglesChange,
        isDragMode: requiredProps.isDragMode,
        isDrawingEnabled: requiredProps.isDrawingEnabled,
        selectedEventType: requiredProps.selectedEventType,
        initialRectangles: [], // default value
        onDrawComplete: undefined,
        onEditEvent: undefined,
        onDeleteEvent: undefined,
        onGetEventDetails: undefined,
        onRectangleClick: undefined,
      },
      {}
    );
  });

  it('handles null selectedEventType', () => {
    const propsWithNullEvent = {
      ...mockProps,
      selectedEventType: null,
    };

    render(<ImageAnnotatorWrapper {...propsWithNullEvent} />);

    expect(ImageAnnotator).toHaveBeenCalledWith(
      expect.objectContaining({
        initialImage: propsWithNullEvent.imageUrl,
        selectedEventType: null,
        width: propsWithNullEvent.width,
        height: propsWithNullEvent.height,
        isDragMode: propsWithNullEvent.isDragMode,
        isDrawingEnabled: propsWithNullEvent.isDrawingEnabled,
        initialRectangles: propsWithNullEvent.initialRectangles,
      }),
      {}
    );
  });

  it('passes correct dimensions', () => {
    const dimensions = {
      ...mockProps,
      width: 1024,
      height: 768,
    };

    render(<ImageAnnotatorWrapper {...dimensions} />);

    expect(ImageAnnotator).toHaveBeenCalledWith(
      expect.objectContaining({
        width: 1024,
        height: 768,
      }),
      {}
    );
  });

  it('passes correct drag and drawing modes', () => {
    const modes = {
      ...mockProps,
      isDragMode: true,
      isDrawingEnabled: false,
    };

    render(<ImageAnnotatorWrapper {...modes} />);

    expect(ImageAnnotator).toHaveBeenCalledWith(
      expect.objectContaining({
        isDragMode: true,
        isDrawingEnabled: false,
      }),
      {}
    );
  });

  it('handles empty initialRectangles', () => {
    const propsWithoutRectangles = {
      ...mockProps,
      initialRectangles: undefined,
    };

    render(<ImageAnnotatorWrapper {...propsWithoutRectangles} />);

    expect(ImageAnnotator).toHaveBeenCalledWith(
      expect.objectContaining({
        initialRectangles: [],
      }),
      {}
    );
  });

  it('passes event handlers correctly', () => {
    const eventHandlers = {
      ...mockProps,
      onDrawComplete: jest.fn(),
      onRectangleClick: jest.fn(),
    };

    render(<ImageAnnotatorWrapper {...eventHandlers} />);

    expect(ImageAnnotator).toHaveBeenCalledWith(
      expect.objectContaining({
        onDrawComplete: eventHandlers.onDrawComplete,
        onRectangleClick: eventHandlers.onRectangleClick,
      }),
      {}
    );
  });
});
