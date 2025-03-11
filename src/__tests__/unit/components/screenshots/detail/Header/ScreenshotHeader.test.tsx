import React from 'react';
import { render, screen } from '@testing-library/react';
import ScreenshotHeader from '@/components/screenshots/detail/Header/ScreenshotHeader';

// Mock the child components
jest.mock('@/components/common/Breadcrumb', () => {
  return function MockBreadcrumb({
    items,
  }: {
    items: Array<{ label: string; href?: string }>;
  }) {
    return (
      <div data-testid="mock-breadcrumb">
        {items.map((item, index) => (
          <span key={index} data-testid="breadcrumb-item">
            {item.label}
          </span>
        ))}
      </div>
    );
  };
});

jest.mock('@/components/screenshots/detail/Header/ActionButtons', () => {
  return function MockActionButtons(props: any) {
    // Store function names as strings since functions can't be serialized to JSON
    const serializedProps = {
      ...props,
      onAddEventClick: props.onAddEventClick ? 'function' : undefined,
      onReplaceImageClick: props.onReplaceImageClick ? 'function' : undefined,
      handleFileChange: props.handleFileChange ? 'function' : undefined,
      fileInputRef: props.fileInputRef ? 'ref' : undefined,
    };

    return (
      <div
        data-testid="mock-action-buttons"
        data-props={JSON.stringify(serializedProps)}
      />
    );
  };
});

jest.mock('@/components/screenshots/detail/Header/EventTypeLegend', () => {
  return function MockEventTypeLegend({ eventTypes }: { eventTypes: any[] }) {
    return (
      <div
        data-testid="mock-event-type-legend"
        data-event-types={JSON.stringify(eventTypes)}
      />
    );
  };
});

describe('ScreenshotHeader', () => {
  const defaultProps = {
    moduleName: 'Test Module',
    moduleKey: 'test-module',
    screenshotName: 'Test Screenshot',
    userRole: 'admin',
    isDraggable: false,
    setIsDraggable: jest.fn(),
    eventTypes: [
      { id: 'pageview', name: 'Page View', color: '#2563EB' },
      { id: 'trackevent', name: 'Track Event', color: '#9333EA' },
    ],
    onAddEventClick: jest.fn(),
    onReplaceImageClick: jest.fn(),
    handleFileChange: jest.fn(),
    fileInputRef: {
      current: document.createElement('input'),
    } as React.RefObject<HTMLInputElement>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with correct structure and styling', () => {
    const { container } = render(<ScreenshotHeader {...defaultProps} />);

    // Check main container classes
    expect(container.firstChild).toHaveClass(
      'bg-white',
      'border-b',
      'border-gray-200',
      'sticky',
      'top-0',
      'z-50'
    );

    // Check inner container structure
    const innerContainer = container.querySelector(
      '.max-w-\\[95\\%\\].mx-auto.px-6.py-3'
    );
    expect(innerContainer).toBeInTheDocument();

    const flexContainer = container.querySelector('.flex.flex-col.space-y-4');
    expect(flexContainer).toBeInTheDocument();
  });

  it('renders Breadcrumb with correct items', () => {
    render(<ScreenshotHeader {...defaultProps} />);

    const breadcrumb = screen.getByTestId('mock-breadcrumb');
    expect(breadcrumb).toBeInTheDocument();

    const breadcrumbItems = screen.getAllByTestId('breadcrumb-item');
    expect(breadcrumbItems.length).toBe(2);
    expect(breadcrumbItems[0].textContent).toBe('Test Module');
    expect(breadcrumbItems[1].textContent).toBe('Test Screenshot');
  });

  it('renders ActionButtons with correct props', () => {
    render(<ScreenshotHeader {...defaultProps} />);

    const actionButtons = screen.getByTestId('mock-action-buttons');
    expect(actionButtons).toBeInTheDocument();

    // Parse the props passed to ActionButtons
    const passedProps = JSON.parse(
      actionButtons.getAttribute('data-props') || '{}'
    );

    // Check if all required props are passed correctly
    expect(passedProps.userRole).toBe(defaultProps.userRole);
    expect(passedProps.isDraggable).toBe(defaultProps.isDraggable);

    // Check function props (serialized as strings)
    expect(passedProps.onAddEventClick).toBe('function');
    expect(passedProps.onReplaceImageClick).toBe('function');
    expect(passedProps.handleFileChange).toBe('function');
    expect(passedProps.fileInputRef).toBe('ref');
  });

  it('renders EventTypeLegend with correct event types', () => {
    render(<ScreenshotHeader {...defaultProps} />);

    const eventTypeLegend = screen.getByTestId('mock-event-type-legend');
    expect(eventTypeLegend).toBeInTheDocument();

    // Parse the event types passed to EventTypeLegend
    const passedEventTypes = JSON.parse(
      eventTypeLegend.getAttribute('data-event-types') || '[]'
    );

    // Check if event types are passed correctly
    expect(passedEventTypes).toHaveLength(defaultProps.eventTypes.length);
    expect(passedEventTypes[0].id).toBe(defaultProps.eventTypes[0].id);
    expect(passedEventTypes[0].name).toBe(defaultProps.eventTypes[0].name);
    expect(passedEventTypes[0].color).toBe(defaultProps.eventTypes[0].color);
  });

  it('renders correctly with different props', () => {
    const newProps = {
      ...defaultProps,
      moduleName: 'Different Module',
      moduleKey: 'different-module',
      screenshotName: 'Different Screenshot',
      userRole: 'user',
      isDraggable: true,
    };

    render(<ScreenshotHeader {...newProps} />);

    const breadcrumbItems = screen.getAllByTestId('breadcrumb-item');
    expect(breadcrumbItems[0].textContent).toBe('Different Module');
    expect(breadcrumbItems[1].textContent).toBe('Different Screenshot');

    const actionButtons = screen.getByTestId('mock-action-buttons');
    const passedProps = JSON.parse(
      actionButtons.getAttribute('data-props') || '{}'
    );
    expect(passedProps.userRole).toBe('user');
    expect(passedProps.isDraggable).toBe(true);
  });
});
