import React from 'react';
import { render, screen } from '@testing-library/react';
import { ScreenshotGrid } from '@/components/screenshots/module';
import { ScreenshotStatus } from '@/services/adminS3Service';
import { PageLabel } from '@/types/pageLabel';
import { DragEndEvent } from '@dnd-kit/core';

// Mock the DnD context and related components
jest.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dnd-context">{children}</div>
  ),
  closestCenter: jest.fn(),
  KeyboardSensor: jest.fn(),
  PointerSensor: jest.fn(),
  useSensor: jest.fn(),
  useSensors: jest.fn(() => 'mock-sensors'),
  DragEndEvent: jest.fn(),
}));

jest.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sortable-context">{children}</div>
  ),
  sortableKeyboardCoordinates: jest.fn(),
  rectSortingStrategy: 'mock-strategy',
}));

// Mock the ScreenshotCard component
jest.mock('@/components/screenshots/ScreenshotCard', () => ({
  __esModule: true,
  default: ({
    screenshot,
    userRole,
    isDragModeEnabled,
    isDeleting,
    searchTerm,
    labelName,
    ...props
  }: any) => (
    <div
      data-testid={`screenshot-card-${screenshot.id}`}
      data-screenshot-id={screenshot.id}
      data-screenshot-name={screenshot.name}
      data-user-role={userRole}
      data-drag-mode={isDragModeEnabled ? 'true' : 'false'}
      data-deleting={isDeleting ? 'true' : 'false'}
      data-search-term={searchTerm}
      data-label-name={labelName || 'none'}
    >
      {screenshot.name}
    </div>
  ),
}));

describe('ScreenshotGrid', () => {
  // Mock props
  const mockScreenshots = [
    {
      id: 'screenshot1',
      name: 'Homepage Screenshot',
      url: 'https://example.com/1.jpg',
      pageName: 'Home',
      createdAt: '2023-01-01',
      updatedAt: '2023-01-02',
      status: ScreenshotStatus.DONE,
      labelId: 'label1',
    },
    {
      id: 'screenshot2',
      name: 'Dashboard Screenshot',
      url: 'https://example.com/2.jpg',
      pageName: 'Dashboard',
      createdAt: '2023-01-03',
      updatedAt: '2023-01-04',
      status: ScreenshotStatus.IN_PROGRESS,
      labelId: 'label2',
    },
  ];

  const mockLabels: PageLabel[] = [
    { id: 'label1', name: 'Homepage' },
    { id: 'label2', name: 'Dashboard' },
  ];

  const mockLabelMap: Record<string, string> = {
    label1: 'Homepage',
    label2: 'Dashboard',
  };

  const defaultProps = {
    screenshots: mockScreenshots,
    userRole: 'admin',
    onStatusChange: jest.fn().mockResolvedValue(undefined),
    onDelete: jest.fn(),
    onNameChange: jest.fn().mockResolvedValue(undefined),
    onLabelChange: jest.fn().mockResolvedValue(undefined),
    isDragModeEnabled: false,
    isDeleting: false,
    screenshotToDelete: null,
    searchTerm: '',
    availableLabels: mockLabels,
    labelMap: mockLabelMap,
    onDragEnd: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the DndContext and SortableContext', () => {
    render(<ScreenshotGrid {...defaultProps} />);

    expect(screen.getByTestId('dnd-context')).toBeInTheDocument();
    expect(screen.getByTestId('sortable-context')).toBeInTheDocument();
  });

  it('renders a grid with the correct classes', () => {
    const { container } = render(<ScreenshotGrid {...defaultProps} />);

    const grid = container.querySelector('.grid');
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveClass('grid-cols-1');
    expect(grid).toHaveClass('sm:grid-cols-2');
    expect(grid).toHaveClass('lg:grid-cols-3');
    expect(grid).toHaveClass('gap-6');
  });

  it('renders a ScreenshotCard for each screenshot', () => {
    render(<ScreenshotGrid {...defaultProps} />);

    mockScreenshots.forEach((screenshot) => {
      const card = screen.getByTestId(`screenshot-card-${screenshot.id}`);
      expect(card).toBeInTheDocument();
      expect(card).toHaveTextContent(screenshot.name);
    });

    // Check that we have the right number of cards
    expect(screen.getAllByTestId(/^screenshot-card-/)).toHaveLength(
      mockScreenshots.length
    );
  });

  it('passes the correct props to each ScreenshotCard', () => {
    render(<ScreenshotGrid {...defaultProps} />);

    mockScreenshots.forEach((screenshot) => {
      const card = screen.getByTestId(`screenshot-card-${screenshot.id}`);
      expect(card).toHaveAttribute('data-screenshot-id', screenshot.id);
      expect(card).toHaveAttribute('data-screenshot-name', screenshot.name);
      expect(card).toHaveAttribute('data-user-role', 'admin');
      expect(card).toHaveAttribute('data-drag-mode', 'false');
      expect(card).toHaveAttribute('data-deleting', 'false');
      expect(card).toHaveAttribute('data-search-term', '');
      expect(card).toHaveAttribute(
        'data-label-name',
        mockLabelMap[screenshot.labelId]
      );
    });
  });

  it('passes drag mode enabled to ScreenshotCards', () => {
    render(<ScreenshotGrid {...defaultProps} isDragModeEnabled={true} />);

    mockScreenshots.forEach((screenshot) => {
      const card = screen.getByTestId(`screenshot-card-${screenshot.id}`);
      expect(card).toHaveAttribute('data-drag-mode', 'true');
    });
  });

  it('passes deleting state to the correct ScreenshotCard', () => {
    render(
      <ScreenshotGrid
        {...defaultProps}
        isDeleting={true}
        screenshotToDelete="screenshot1"
      />
    );

    const card1 = screen.getByTestId('screenshot-card-screenshot1');
    const card2 = screen.getByTestId('screenshot-card-screenshot2');

    expect(card1).toHaveAttribute('data-deleting', 'true');
    expect(card2).toHaveAttribute('data-deleting', 'false');
  });

  it('passes search term to ScreenshotCards', () => {
    const searchTerm = 'dashboard';
    render(<ScreenshotGrid {...defaultProps} searchTerm={searchTerm} />);

    mockScreenshots.forEach((screenshot) => {
      const card = screen.getByTestId(`screenshot-card-${screenshot.id}`);
      expect(card).toHaveAttribute('data-search-term', searchTerm);
    });
  });

  it('renders EmptyState when no screenshots are provided', () => {
    render(<ScreenshotGrid {...defaultProps} screenshots={[]} />);

    expect(
      screen.getByText('No screenshots match your filters.')
    ).toBeInTheDocument();
    expect(screen.queryByTestId(/^screenshot-card-/)).not.toBeInTheDocument();
  });
});
