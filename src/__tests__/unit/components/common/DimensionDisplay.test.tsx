import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DimensionDisplay from '@/components/common/DimensionDisplay';

// Mock react-tooltip to avoid actual tooltip rendering in tests
jest.mock('react-tooltip', () => ({
  Tooltip: ({ id, content }: { id: string; content: string }) => (
    <div data-testid={`mock-tooltip-${id}`} data-content={content} />
  ),
}));

describe('DimensionDisplay', () => {
  const mockEventId = 'event123';
  const baseDimension = {
    id: '1',
    name: 'Test Dimension',
  };

  it('renders basic dimension info correctly', () => {
    render(
      <DimensionDisplay dimension={baseDimension} eventId={mockEventId} />
    );

    // Check ID is padded and formatted
    expect(screen.getByText('01.')).toBeInTheDocument();
    expect(screen.getByText('Test Dimension')).toBeInTheDocument();
  });

  it('renders dimension with type', () => {
    const dimensionWithType = {
      ...baseDimension,
      type: 'string',
    };

    render(
      <DimensionDisplay dimension={dimensionWithType} eventId={mockEventId} />
    );

    expect(screen.getByText('(string)')).toBeInTheDocument();
    expect(screen.getByText('(string)')).toHaveClass(
      'text-xs',
      'text-gray-500',
      'italic',
      'ml-1'
    );
  });

  it('renders dimension with description and info icon', () => {
    const dimensionWithDescription = {
      ...baseDimension,
      description: 'Test Description',
    };

    render(
      <DimensionDisplay
        dimension={dimensionWithDescription}
        eventId={mockEventId}
      />
    );

    // Check info icon exists using SVG element
    const infoIcon = screen.getByTestId('info-icon');
    expect(infoIcon).toBeInTheDocument();
    expect(infoIcon).toHaveClass(
      'w-4',
      'h-4',
      'text-gray-400',
      'hover:text-gray-600',
      'cursor-pointer',
      'flex-shrink-0'
    );

    // Check tooltip setup
    const expectedTooltipId = `dimension-tooltip-${mockEventId}-${baseDimension.id}`;
    expect(infoIcon).toHaveAttribute('data-tooltip-id', expectedTooltipId);

    // Check tooltip content
    const tooltip = screen.getByTestId(`mock-tooltip-${expectedTooltipId}`);
    expect(tooltip).toHaveAttribute('data-content', 'Test Description');
  });

  it('does not render info icon or tooltip when no description', () => {
    render(
      <DimensionDisplay dimension={baseDimension} eventId={mockEventId} />
    );

    // Info icon should not exist
    const infoIcon = screen.queryByTestId('info-icon');
    expect(infoIcon).not.toBeInTheDocument();

    // Tooltip should not exist
    const tooltipId = `dimension-tooltip-${mockEventId}-${baseDimension.id}`;
    const tooltip = screen.queryByTestId(`mock-tooltip-${tooltipId}`);
    expect(tooltip).not.toBeInTheDocument();
  });

  it('handles long dimension names with truncation', () => {
    const longDimension = {
      ...baseDimension,
      name: 'This is a very long dimension name that should be truncated',
    };

    render(
      <DimensionDisplay dimension={longDimension} eventId={mockEventId} />
    );

    const nameElement = screen.getByText(longDimension.name);
    expect(nameElement).toHaveClass('truncate');
  });

  it('applies correct base styling', () => {
    render(
      <DimensionDisplay dimension={baseDimension} eventId={mockEventId} />
    );

    const container = screen.getByText('Test Dimension').closest('div');
    expect(container?.parentElement).toHaveClass(
      'text-sm',
      'text-gray-600',
      'flex',
      'items-center',
      'gap-2',
      'group',
      'relative',
      'py-1'
    );
  });

  it('renders double-digit IDs correctly', () => {
    const doubleDimension = {
      ...baseDimension,
      id: '12',
    };

    render(
      <DimensionDisplay dimension={doubleDimension} eventId={mockEventId} />
    );

    expect(screen.getByText('12.')).toBeInTheDocument();
  });
});
