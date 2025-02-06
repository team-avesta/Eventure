import { render, screen, fireEvent } from '@testing-library/react';
import EventTypeFilter from '@/components/eventFilter/EventTypeFilter';

describe('EventTypeFilter', () => {
  const mockRectangles = [
    { id: '1', eventType: 'pageview' },
    { id: '2', eventType: 'pageview' },
    { id: '3', eventType: 'trackevent' },
    { id: '4', eventType: 'trackevent_pageview' },
    { id: '5', eventType: 'outlink' },
    { id: '6', eventType: 'backendevent' },
  ];

  const mockOnFilterChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with initial selected filter', () => {
    render(
      <EventTypeFilter
        selectedFilter="all"
        onFilterChange={mockOnFilterChange}
        rectangles={mockRectangles}
      />
    );

    // Check if the button shows the selected filter name and total count
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('All Events');
    expect(button).toHaveTextContent('6');
  });

  it('opens dropdown when clicked', () => {
    render(
      <EventTypeFilter
        selectedFilter="all"
        onFilterChange={mockOnFilterChange}
        rectangles={mockRectangles}
      />
    );

    // Initially dropdown should be closed
    expect(screen.queryByText('Page View')).not.toBeInTheDocument();

    // Click to open dropdown
    fireEvent.click(screen.getByRole('button'));

    // Check if all event types are shown
    const dropdownItems = screen.getAllByRole('button');
    expect(dropdownItems).toHaveLength(7); // 1 main button + 6 dropdown items

    // Verify dropdown content
    const dropdownTexts = dropdownItems.map((item) =>
      item.textContent?.replace(/\d+/g, '').trim()
    );
    expect(dropdownTexts).toContain('All Events');
    expect(dropdownTexts).toContain('Page View');
    expect(dropdownTexts).toContain('TrackEvent with PageView');
    expect(dropdownTexts).toContain('TrackEvent');
    expect(dropdownTexts).toContain('Outlink');
    expect(dropdownTexts).toContain('Backend Event');
  });

  it('shows correct counts for each filter option', () => {
    render(
      <EventTypeFilter
        selectedFilter="all"
        onFilterChange={mockOnFilterChange}
        rectangles={mockRectangles}
      />
    );

    // Open dropdown
    fireEvent.click(screen.getByRole('button'));

    // Get all dropdown items
    const dropdownItems = screen.getAllByRole('button');

    // Create a map of expected counts
    const expectedCounts = {
      'All Events': '6',
      'Page View': '2',
      'TrackEvent with PageView': '1',
      TrackEvent: '1',
      Outlink: '1',
      'Backend Event': '1',
    };

    // Verify counts for each event type
    Object.entries(expectedCounts).forEach(([eventType, count]) => {
      const item = dropdownItems.find((item) =>
        item.textContent?.includes(eventType)
      );
      expect(item).toHaveTextContent(count);
    });
  });

  it('calls onFilterChange when a filter is selected', () => {
    render(
      <EventTypeFilter
        selectedFilter="all"
        onFilterChange={mockOnFilterChange}
        rectangles={mockRectangles}
      />
    );

    // Open dropdown
    fireEvent.click(screen.getByRole('button'));

    // Click on a filter option (find by both text and role to be specific)
    const pageViewButton = screen
      .getAllByRole('button')
      .find((button) => button.textContent?.includes('Page View'));
    fireEvent.click(pageViewButton!);

    // Check if onFilterChange was called with correct argument
    expect(mockOnFilterChange).toHaveBeenCalledWith('pageview');
  });

  it('closes dropdown when option is selected', () => {
    render(
      <EventTypeFilter
        selectedFilter="all"
        onFilterChange={mockOnFilterChange}
        rectangles={mockRectangles}
      />
    );

    // Open dropdown
    fireEvent.click(screen.getByRole('button'));

    // Verify dropdown is open
    expect(screen.getAllByRole('button')).toHaveLength(7);

    // Select an option
    const pageViewButton = screen
      .getAllByRole('button')
      .find((button) => button.textContent?.includes('Page View'));
    fireEvent.click(pageViewButton!);

    // Verify dropdown is closed (only main button remains)
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('closes dropdown when clicking outside', () => {
    render(
      <EventTypeFilter
        selectedFilter="all"
        onFilterChange={mockOnFilterChange}
        rectangles={mockRectangles}
      />
    );

    // Open dropdown
    fireEvent.click(screen.getByRole('button'));

    // Verify dropdown is open
    expect(screen.getAllByRole('button')).toHaveLength(7);

    // Click outside
    fireEvent.mouseDown(document.body);

    // Verify dropdown is closed (only main button remains)
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('updates display when selectedFilter changes', () => {
    const { rerender } = render(
      <EventTypeFilter
        selectedFilter="all"
        onFilterChange={mockOnFilterChange}
        rectangles={mockRectangles}
      />
    );

    // Initially shows "All Events"
    const initialButton = screen.getByRole('button');
    expect(initialButton).toHaveTextContent('All Events');

    // Update selected filter
    rerender(
      <EventTypeFilter
        selectedFilter="pageview"
        onFilterChange={mockOnFilterChange}
        rectangles={mockRectangles}
      />
    );

    // Should now show "Page View" and count
    const updatedButton = screen.getByRole('button');
    expect(updatedButton).toHaveTextContent('Page View');
    expect(updatedButton).toHaveTextContent('2');
  });

  it('handles empty rectangles array', () => {
    render(
      <EventTypeFilter
        selectedFilter="all"
        onFilterChange={mockOnFilterChange}
        rectangles={[]}
      />
    );

    // Open dropdown
    fireEvent.click(screen.getByRole('button'));

    // Get all dropdown items
    const dropdownItems = screen.getAllByRole('button');

    // Verify each item has count 0
    dropdownItems.forEach((item) => {
      const countElement = item.querySelector('.bg-gray-100');
      expect(countElement).toHaveTextContent('0');
    });
  });
});
