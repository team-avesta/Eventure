import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EventPanel from '@/components/screenshots/detail/EventPanel/EventPanel';
import { Event } from '@/types';
import { Rectangle } from '@/components/imageAnnotator/ImageAnnotator';
import { EEventType } from '@/services/adminS3Service';

// Mock the EventTypeFilter component
jest.mock('@/components/eventFilter/EventTypeFilter', () => {
  return function MockEventTypeFilter({ selectedFilter, onFilterChange }: any) {
    return (
      <div data-testid="event-type-filter">
        <select
          data-testid="filter-select"
          value={selectedFilter}
          onChange={(e) => onFilterChange(e.target.value)}
        >
          <option value="all">All</option>
          <option value="pageview">Page View</option>
          <option value="trackevent">Track Event</option>
        </select>
      </div>
    );
  };
});

// Mock the EventCard component
jest.mock('@/components/screenshots/detail/EventPanel/EventCard', () => {
  return function MockEventCard({
    rect,
    event,
    isHighlighted,
    isExpanded,
    onCardClick,
    onDropdownToggle,
    onEdit,
    onDelete,
    onViewDescription,
  }: any) {
    return (
      <div
        data-testid={`event-card-${rect.id}`}
        data-highlighted={isHighlighted}
        data-expanded={isExpanded}
        onClick={() => onCardClick(rect.id)}
      >
        <span>{event.eventType}</span>
        <span>{event.name}</span>
        <button
          data-testid={`toggle-dropdown-${rect.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onDropdownToggle(rect.id);
          }}
        >
          Toggle
        </button>
        <button data-testid={`edit-${rect.id}`} onClick={() => onEdit(rect)}>
          Edit
        </button>
        <button
          data-testid={`delete-${rect.id}`}
          onClick={() => onDelete(rect)}
        >
          Delete
        </button>
        <button
          data-testid={`view-description-${rect.id}`}
          onClick={() => onViewDescription(rect.id, event.description || '')}
        >
          View Description
        </button>
      </div>
    );
  };
});

describe('EventPanel Component', () => {
  const mockRectangles: Rectangle[] = [
    {
      id: 'rect-1',
      startX: 10,
      startY: 20,
      width: 100,
      height: 50,
      eventType: 'pageview',
    },
    {
      id: 'rect-2',
      startX: 30,
      startY: 40,
      width: 80,
      height: 60,
      eventType: 'trackevent',
    },
    {
      id: 'rect-3',
      startX: 50,
      startY: 60,
      width: 120,
      height: 40,
      eventType: 'outlink',
    },
  ];

  const mockEvents: Event[] = [
    {
      id: 'rect-1',
      coordinates: {
        startX: 10,
        startY: 20,
        width: 100,
        height: 50,
      },
      screenshotId: 'screenshot-1',
      eventType: EEventType.PageView,
      name: 'Home Page',
      category: 'https://example.com',
      action: '',
      value: '',
      dimensions: ['dim-1', 'dim-2'],
      description: 'This is a test description',
    },
    {
      id: 'rect-2',
      coordinates: {
        startX: 30,
        startY: 40,
        width: 80,
        height: 60,
      },
      screenshotId: 'screenshot-1',
      eventType: EEventType.TrackEvent,
      name: 'Click Button',
      category: 'User Interaction',
      action: 'Click',
      value: '1',
      dimensions: ['dim-1'],
      description: 'Track button click',
    },
    {
      id: 'rect-3',
      coordinates: {
        startX: 50,
        startY: 60,
        width: 120,
        height: 40,
      },
      screenshotId: 'screenshot-1',
      eventType: EEventType.Outlink,
      name: 'External Link',
      category: 'Navigation',
      action: 'Outlink',
      value: 'https://external.com',
      dimensions: [],
      description: 'External link click',
    },
  ];

  const mockDimensions = [
    { id: 'dim-1', name: 'Browser', type: 'string' },
    { id: 'dim-2', name: 'User Type', type: 'string' },
  ];

  const mockProps = {
    events: mockEvents,
    rectangles: mockRectangles,
    selectedEventFilter: 'all',
    highlightedCardId: null,
    expandedId: null,
    userRole: 'user',
    activeDropdownId: undefined,
    dimensions: mockDimensions,
    onFilterChange: jest.fn(),
    onCardClick: jest.fn(),
    onDropdownToggle: jest.fn(),
    onEditEvent: jest.fn(),
    onDeleteEvent: jest.fn(),
    onViewDescription: jest.fn(),
    getEventTypeBorderColor: jest.fn((eventType) => '#2563EB'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the event panel with all events when filter is "all"', () => {
    render(<EventPanel {...mockProps} />);

    // Check if all event cards are rendered
    expect(screen.getByTestId('event-card-rect-1')).toBeInTheDocument();
    expect(screen.getByTestId('event-card-rect-2')).toBeInTheDocument();
    expect(screen.getByTestId('event-card-rect-3')).toBeInTheDocument();
  });

  it('filters events based on selectedEventFilter', () => {
    const filteredProps = {
      ...mockProps,
      selectedEventFilter: 'pageview',
    };

    render(<EventPanel {...filteredProps} />);

    // Check if only pageview event card is rendered
    expect(screen.getByTestId('event-card-rect-1')).toBeInTheDocument();
    expect(screen.queryByTestId('event-card-rect-2')).not.toBeInTheDocument();
    expect(screen.queryByTestId('event-card-rect-3')).not.toBeInTheDocument();
  });

  it('highlights the selected card', () => {
    const highlightedProps = {
      ...mockProps,
      highlightedCardId: 'rect-2',
    };

    render(<EventPanel {...highlightedProps} />);

    // Check if the correct card is highlighted
    expect(screen.getByTestId('event-card-rect-2')).toHaveAttribute(
      'data-highlighted',
      'true'
    );
    expect(screen.getByTestId('event-card-rect-1')).toHaveAttribute(
      'data-highlighted',
      'false'
    );
  });

  it('expands the selected card', () => {
    const expandedProps = {
      ...mockProps,
      expandedId: 'rect-3',
    };

    render(<EventPanel {...expandedProps} />);

    // Check if the correct card is expanded
    expect(screen.getByTestId('event-card-rect-3')).toHaveAttribute(
      'data-expanded',
      'true'
    );
    expect(screen.getByTestId('event-card-rect-1')).toHaveAttribute(
      'data-expanded',
      'false'
    );
  });

  it('calls onFilterChange when filter is changed', async () => {
    const user = userEvent.setup();

    render(<EventPanel {...mockProps} />);

    // Change the filter
    const filterSelect = screen.getByTestId('filter-select');
    await user.selectOptions(filterSelect, 'trackevent');

    // Check if onFilterChange was called with the correct value
    expect(mockProps.onFilterChange).toHaveBeenCalledWith('trackevent');
  });

  it('calls onCardClick when a card is clicked', async () => {
    const user = userEvent.setup();

    render(<EventPanel {...mockProps} />);

    // Click on a card
    await user.click(screen.getByTestId('event-card-rect-1'));

    // Check if onCardClick was called with the correct ID
    expect(mockProps.onCardClick).toHaveBeenCalledWith('rect-1');
  });

  it('calls onDropdownToggle when dropdown toggle is clicked', async () => {
    const user = userEvent.setup();

    render(<EventPanel {...mockProps} />);

    // Click on dropdown toggle
    await user.click(screen.getByTestId('toggle-dropdown-rect-2'));

    // Check if onDropdownToggle was called with the correct ID
    expect(mockProps.onDropdownToggle).toHaveBeenCalledWith('rect-2');
  });

  it('calls onEditEvent when edit button is clicked', async () => {
    const user = userEvent.setup();

    render(<EventPanel {...mockProps} />);

    // Click on edit button
    await user.click(screen.getByTestId('edit-rect-3'));

    // Check if onEditEvent was called with the correct rectangle
    expect(mockProps.onEditEvent).toHaveBeenCalledWith(mockRectangles[2]);
  });

  it('calls onDeleteEvent when delete button is clicked', async () => {
    const user = userEvent.setup();

    render(<EventPanel {...mockProps} />);

    // Click on delete button
    await user.click(screen.getByTestId('delete-rect-1'));

    // Check if onDeleteEvent was called with the correct rectangle
    expect(mockProps.onDeleteEvent).toHaveBeenCalledWith(mockRectangles[0]);
  });

  it('calls onViewDescription when view description button is clicked', async () => {
    const user = userEvent.setup();

    render(<EventPanel {...mockProps} />);

    // Click on view description button
    await user.click(screen.getByTestId('view-description-rect-2'));

    // Check if onViewDescription was called with the correct ID and description
    expect(mockProps.onViewDescription).toHaveBeenCalledWith(
      'rect-2',
      'Track button click'
    );
  });

  it('sorts events by event type', () => {
    // Render with events in a different order
    const shuffledEvents = [...mockEvents].reverse();
    const shuffledRectangles = [...mockRectangles].reverse();

    const shuffledProps = {
      ...mockProps,
      events: shuffledEvents,
      rectangles: shuffledRectangles,
    };

    render(<EventPanel {...shuffledProps} />);

    // Get all event cards
    const eventCards = screen.getAllByTestId(/^event-card-/);

    // Check if they are in the correct order (pageview first, then trackevent, then outlink)
    expect(eventCards[0]).toHaveTextContent('pageview');
    expect(eventCards[1]).toHaveTextContent('trackevent');
    expect(eventCards[2]).toHaveTextContent('outlink');
  });
});
