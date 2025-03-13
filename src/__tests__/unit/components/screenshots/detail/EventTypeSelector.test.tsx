import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EventTypeSelector from '@/components/screenshots/detail/EventTypeSelector';
import { EEventType } from '@/services/adminS3Service';
describe('EventTypeSelector Component', () => {
  const mockEventTypes = [
    { id: EEventType.PageView, name: 'Page View', color: '#2563EB' },
    { id: EEventType.TrackEvent, name: 'TrackEvent', color: '#9333EA' },
    { id: EEventType.Outlink, name: 'Outlink', color: '#DC2626' },
  ];

  const mockOnClose = jest.fn();
  const mockOnSelect = jest.fn();
  const mockGetEventTypeDescription = jest.fn((typeId: string) => {
    const descriptions: Record<string, string> = {
      pageview: 'Track when users view a page',
      trackevent: 'Track user interactions without a page view',
      outlink: 'Track when users click links to external sites',
    };
    return descriptions[typeId] || '';
  });

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnSelect.mockClear();
    mockGetEventTypeDescription.mockClear();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <EventTypeSelector
        isOpen={false}
        eventTypes={mockEventTypes}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
      />
    );

    // Container should be empty
    expect(container.firstChild).toBeNull();
  });

  it('renders the modal when isOpen is true', () => {
    render(
      <EventTypeSelector
        isOpen={true}
        eventTypes={mockEventTypes}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
      />
    );

    // Check if the modal title is rendered
    expect(screen.getByText('Add New Event')).toBeInTheDocument();

    // Check if the description is rendered
    expect(
      screen.getByText(
        'Select the type of event you want to add to this screenshot.'
      )
    ).toBeInTheDocument();
  });

  it('renders all event type options', () => {
    render(
      <EventTypeSelector
        isOpen={true}
        eventTypes={mockEventTypes}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
      />
    );

    // Check if all event types are rendered
    mockEventTypes.forEach((type) => {
      expect(screen.getByText(type.name)).toBeInTheDocument();
    });

    // Check if descriptions are rendered
    expect(
      screen.getByText('Track when users view a page')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Track user interactions without a page view')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Track when users click links to external sites')
    ).toBeInTheDocument();
  });

  it('calls onSelect when an event type is clicked', async () => {
    const user = userEvent.setup();

    render(
      <EventTypeSelector
        isOpen={true}
        eventTypes={mockEventTypes}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
      />
    );

    // Click on the Page View option
    await user.click(screen.getByText('Page View'));

    // Check if onSelect was called with the correct event type
    expect(mockOnSelect).toHaveBeenCalledWith(mockEventTypes[0]);
  });

  it('calls onClose when the backdrop is clicked', async () => {
    const user = userEvent.setup();

    render(
      <EventTypeSelector
        isOpen={true}
        eventTypes={mockEventTypes}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
      />
    );

    // Click on the backdrop (the semi-transparent overlay)
    const backdrop = screen
      .getByText('Select the type of event you want to add to this screenshot.')
      .closest('.fixed.inset-0.z-50')
      ?.querySelector('.fixed.inset-0.bg-gray-500');

    if (backdrop) {
      await user.click(backdrop);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });

  it('calls onClose when the close button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <EventTypeSelector
        isOpen={true}
        eventTypes={mockEventTypes}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
      />
    );

    // Find and click the close button
    const closeButton = screen.getByRole('button', { name: 'Close' });
    await user.click(closeButton);

    // Check if onClose was called
    expect(mockOnClose).toHaveBeenCalled();
  });
});
