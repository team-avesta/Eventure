import React from 'react';
import { render, screen } from '@testing-library/react';
import EventTypeLegend from '@/components/screenshots/detail/Header/EventTypeLegend';
import { EEventType } from '@/services/adminS3Service';
describe('EventTypeLegend', () => {
  const mockEventTypes = [
    { id: EEventType.PageView, name: 'Page View', color: '#2563EB' },
    { id: EEventType.TrackEvent, name: 'Track Event', color: '#9333EA' },
    { id: EEventType.Outlink, name: 'Outlink', color: '#DC2626' },
  ];

  it('renders all event types correctly', () => {
    render(<EventTypeLegend eventTypes={mockEventTypes} />);

    // Check if all event type names are rendered
    expect(screen.getByText('Page View')).toBeInTheDocument();
    expect(screen.getByText('Track Event')).toBeInTheDocument();
    expect(screen.getByText('Outlink')).toBeInTheDocument();
  });

  it('renders color indicators with correct background colors', () => {
    render(<EventTypeLegend eventTypes={mockEventTypes} />);

    // Get all color indicators
    const colorIndicators = document.querySelectorAll('.w-3.h-3.rounded-full');

    // Check if the number of indicators matches the number of event types
    expect(colorIndicators.length).toBe(mockEventTypes.length);

    // Check if each indicator has the correct background color
    mockEventTypes.forEach((type, index) => {
      expect(colorIndicators[index]).toHaveStyle(
        `background-color: ${type.color}`
      );
    });
  });

  it('renders nothing when no event types are provided', () => {
    const { container } = render(<EventTypeLegend eventTypes={[]} />);

    // Check if the container is empty (only has the outer divs)
    const legendItems = container.querySelectorAll('.flex.items-center.gap-2');
    expect(legendItems.length).toBe(0);
  });

  it('renders with correct layout classes', () => {
    const { container } = render(
      <EventTypeLegend eventTypes={mockEventTypes} />
    );

    // Check for the main container classes
    expect(container.firstChild).toHaveClass(
      'flex',
      'items-center',
      'border-t',
      'border-gray-100',
      'pt-3'
    );

    // Check for the inner container classes
    const innerContainer = container.querySelector('.flex.items-center.gap-6');
    expect(innerContainer).toBeInTheDocument();
  });
});
