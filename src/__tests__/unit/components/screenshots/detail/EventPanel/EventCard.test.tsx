import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EventCard from '@/components/screenshots/detail/EventPanel/EventCard';
import { Event } from '@/types';
import { Rectangle } from '@/components/imageAnnotator/ImageAnnotator';

// Mock the ActionDropdown component
jest.mock('@/components/shared/ActionDropdown', () => {
  return function MockActionDropdown({ isOpen, onEdit, onDelete, event }: any) {
    if (!isOpen) return null;
    return (
      <div data-testid="action-dropdown">
        <button onClick={() => onEdit(event)} data-testid="edit-button">
          Edit
        </button>
        <button onClick={() => onDelete(event)} data-testid="delete-button">
          Delete
        </button>
      </div>
    );
  };
});

// Mock the DimensionDisplay component
jest.mock('@/components/common/DimensionDisplay', () => {
  return function MockDimensionDisplay({ dimension }: any) {
    return (
      <div data-testid={`dimension-${dimension.id}`}>{dimension.name}</div>
    );
  };
});

describe('EventCard Component', () => {
  const mockRect: Rectangle = {
    id: 'rect-1',
    startX: 10,
    startY: 20,
    width: 100,
    height: 50,
    eventType: 'pageview',
  };

  const mockEvent: Event = {
    id: 'rect-1',
    coordinates: {
      startX: 10,
      startY: 20,
      width: 100,
      height: 50,
    },
    screenshotId: 'screenshot-1',
    eventType: 'pageview',
    name: 'Home Page',
    category: 'https://example.com',
    action: '',
    value: '',
    dimensions: ['dim-1', 'dim-2'],
    description: 'This is a test description',
  };

  const mockTrackEvent: Event = {
    id: 'rect-2',
    coordinates: {
      startX: 30,
      startY: 40,
      width: 80,
      height: 60,
    },
    screenshotId: 'screenshot-1',
    eventType: 'trackevent',
    name: 'Click Button',
    category: 'User Interaction',
    action: 'Click',
    value: '1',
    dimensions: ['dim-1'],
    description: 'Track button click',
  };

  const mockDimensions = [
    { id: 'dim-1', name: 'Browser', type: 'string' },
    { id: 'dim-2', name: 'User Type', type: 'string' },
  ];

  const mockProps = {
    rect: mockRect,
    event: mockEvent,
    isHighlighted: false,
    isExpanded: false,
    eventTypeBorderColor: '#2563EB',
    userRole: 'user',
    activeDropdownId: undefined,
    dimensions: mockDimensions,
    onCardClick: jest.fn(),
    onDropdownToggle: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onViewDescription: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders pageview event card correctly', () => {
    render(<EventCard {...mockProps} />);

    // Check if pageview specific fields are rendered
    expect(screen.getByText('Custom Title:')).toBeInTheDocument();
    expect(screen.getByText('Home Page')).toBeInTheDocument();
    expect(screen.getByText('Custom URL:')).toBeInTheDocument();
    expect(screen.getByText('https://example.com')).toBeInTheDocument();
  });

  it('renders trackevent event card correctly', () => {
    const trackEventProps = {
      ...mockProps,
      rect: { ...mockRect, eventType: 'trackevent' },
      event: mockTrackEvent,
    };

    render(<EventCard {...trackEventProps} />);

    // Check if trackevent specific fields are rendered
    expect(screen.getByText('Event Category:')).toBeInTheDocument();
    expect(screen.getByText('User Interaction')).toBeInTheDocument();
    expect(screen.getByText('Event Action:')).toBeInTheDocument();
    expect(screen.getByText('Click')).toBeInTheDocument();
  });

  it('shows expanded details when isExpanded is true', () => {
    const expandedProps = {
      ...mockProps,
      isExpanded: true,
    };

    render(<EventCard {...expandedProps} />);

    // Check if dimensions are rendered in expanded view
    expect(screen.getByText('Dimensions:')).toBeInTheDocument();
    expect(screen.getByTestId('dimension-dim-1')).toBeInTheDocument();
    expect(screen.getByTestId('dimension-dim-2')).toBeInTheDocument();
  });

  it('applies highlight styles when isHighlighted is true', () => {
    const highlightedProps = {
      ...mockProps,
      isHighlighted: true,
    };

    const { container } = render(<EventCard {...highlightedProps} />);

    // Check if the highlighted class is applied
    const cardElement = container.firstChild as HTMLElement;
    expect(cardElement.className).toContain('border ring-1 ring-opacity-50');
  });

  it('calls onCardClick when card is clicked', async () => {
    const user = userEvent.setup();

    render(<EventCard {...mockProps} />);

    // Click on the card
    await user.click(screen.getByText('Custom Title:'));

    // Check if onCardClick was called with the correct ID
    expect(mockProps.onCardClick).toHaveBeenCalledWith('rect-1');
  });

  it('shows info button for non-admin users when description exists', () => {
    render(<EventCard {...mockProps} />);

    // Check if info button is rendered
    const infoButton = screen.getByRole('button');
    expect(infoButton).toBeInTheDocument();
  });

  it('shows action dropdown for admin users', async () => {
    const user = userEvent.setup();
    const adminProps = {
      ...mockProps,
      userRole: 'admin',
    };

    render(<EventCard {...adminProps} />);

    // Check if more options button is rendered
    const moreButton = screen.getByRole('button');

    // Click on more options button
    await user.click(moreButton);

    // Check if onDropdownToggle was called with the correct ID
    expect(mockProps.onDropdownToggle).toHaveBeenCalledWith('rect-1');
  });

  it('shows action dropdown and allows editing when dropdown is open', async () => {
    const user = userEvent.setup();
    const adminProps = {
      ...mockProps,
      userRole: 'admin',
      activeDropdownId: 'rect-1',
    };

    render(<EventCard {...adminProps} />);

    // Check if dropdown is rendered
    const editButton = screen.getByTestId('edit-button');

    // Click on edit button
    await user.click(editButton);

    // Check if onEdit was called with the correct rectangle
    expect(mockProps.onEdit).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'rect-1',
      })
    );
  });

  it('allows deleting when dropdown is open', async () => {
    const user = userEvent.setup();
    const adminProps = {
      ...mockProps,
      userRole: 'admin',
      activeDropdownId: 'rect-1',
    };

    render(<EventCard {...adminProps} />);

    // Check if dropdown is rendered
    const deleteButton = screen.getByTestId('delete-button');

    // Click on delete button
    await user.click(deleteButton);

    // Check if onDelete was called with the correct rectangle
    expect(mockProps.onDelete).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'rect-1',
      })
    );
  });

  it('calls onViewDescription when info button is clicked', async () => {
    const user = userEvent.setup();

    render(<EventCard {...mockProps} />);

    // Find and click the info button
    const infoButton = screen.getByRole('button');
    await user.click(infoButton);

    // Check if onViewDescription was called with the correct ID and description
    expect(mockProps.onViewDescription).toHaveBeenCalledWith(
      'rect-1',
      'This is a test description'
    );
  });
});
