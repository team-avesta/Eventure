import { render, screen, fireEvent } from '@testing-library/react';
import ScreenshotCard from '@/components/screenshots/ScreenshotCard';
import { Screenshot, ScreenshotStatus } from '@/services/adminS3Service';

// Mock next/image since it's not available in test environment
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, fill, unoptimized, ...props }: any) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      data-fill={fill ? 'true' : undefined}
      data-unoptimized={unoptimized ? 'true' : undefined}
      {...props}
    />
  ),
}));

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, className }: any) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

// Mock @dnd-kit/sortable
jest.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: () => {},
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

describe('ScreenshotCard', () => {
  const mockScreenshot: Screenshot = {
    id: 'test-id',
    name: 'Test Screenshot',
    url: 'https://example.com/image.jpg',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    status: ScreenshotStatus.TODO,
    pageName: 'Test Page',
  };

  const mockProps = {
    screenshot: mockScreenshot,
    userRole: 'user',
    onStatusChange: jest.fn(),
    onDelete: jest.fn(),
    onNameChange: jest.fn(),
    isDragModeEnabled: false,
    isDeleting: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders screenshot details correctly', () => {
    render(<ScreenshotCard {...mockProps} />);

    expect(screen.getByText('Test Screenshot')).toBeInTheDocument();
    expect(screen.getByText('Added 1/1/2024')).toBeInTheDocument();
    expect(screen.getByText('TODO')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', mockScreenshot.url);
  });

  it('does not show admin controls for non-admin users', () => {
    render(<ScreenshotCard {...mockProps} />);

    expect(screen.queryByTitle('Edit name')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Delete screenshot')).not.toBeInTheDocument();
  });

  describe('Admin functionality', () => {
    const adminProps = {
      ...mockProps,
      userRole: 'admin',
    };

    it('shows admin controls for admin users', () => {
      render(<ScreenshotCard {...adminProps} />);

      expect(screen.getByTitle('Edit name')).toBeInTheDocument();
      expect(screen.getByTitle('Delete screenshot')).toBeInTheDocument();
    });

    it('allows status change when clicked by admin', () => {
      render(<ScreenshotCard {...adminProps} />);

      const statusButton = screen.getByTitle('Click to change status');
      fireEvent.click(statusButton);

      expect(mockProps.onStatusChange).toHaveBeenCalledWith(
        mockScreenshot.id,
        ScreenshotStatus.IN_PROGRESS
      );
    });

    it('opens edit name modal when edit button is clicked', () => {
      render(<ScreenshotCard {...adminProps} />);

      const editButton = screen.getByTitle('Edit name');
      fireEvent.click(editButton);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('calls onDelete when delete button is clicked', () => {
      render(<ScreenshotCard {...adminProps} />);

      const deleteButton = screen.getByTitle('Delete screenshot');
      fireEvent.click(deleteButton);

      expect(mockProps.onDelete).toHaveBeenCalledWith(mockScreenshot.id);
    });
  });

  describe('Status display', () => {
    it.each([
      [ScreenshotStatus.TODO, 'bg-orange-500'],
      [ScreenshotStatus.IN_PROGRESS, 'bg-blue-100'],
      [ScreenshotStatus.DONE, 'bg-green-100'],
    ])(
      'displays correct status style for %s status',
      (status, expectedClass) => {
        render(
          <ScreenshotCard
            {...mockProps}
            screenshot={{ ...mockScreenshot, status }}
          />
        );

        const statusElement = screen.getByText(status);
        expect(statusElement.className).toContain(expectedClass);
      }
    );
  });

  describe('Drag functionality', () => {
    it('applies drag mode styles when enabled for admin', () => {
      render(
        <ScreenshotCard
          {...mockProps}
          userRole="admin"
          isDragModeEnabled={true}
        />
      );

      const card = screen.getByRole('link').parentElement;
      expect(card?.className).toContain('ring-2 ring-blue-500');
    });

    it('does not apply drag mode styles for non-admin users', () => {
      render(
        <ScreenshotCard
          {...mockProps}
          userRole="user"
          isDragModeEnabled={true}
        />
      );

      const card = screen.getByRole('link').parentElement;
      expect(card?.className).not.toContain('ring-2 ring-blue-500');
    });
  });

  describe('Link behavior', () => {
    it('renders correct link to screenshot detail page', () => {
      render(<ScreenshotCard {...mockProps} />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', `/screenshots/${mockScreenshot.id}`);
    });

    it('disables link interaction when in drag mode', () => {
      render(
        <ScreenshotCard
          {...mockProps}
          userRole="admin"
          isDragModeEnabled={true}
        />
      );

      const link = screen.getByRole('link');
      expect(link.className).toContain('pointer-events-none');
    });
  });

  describe('Search highlighting', () => {
    it('highlights matching text when searchTerm is provided', () => {
      render(<ScreenshotCard {...mockProps} searchTerm="test" />);
      const highlightedText = screen.getByText('Test');
      expect(highlightedText).toHaveClass('bg-yellow-200');
    });

    it('handles case-insensitive search highlighting', () => {
      render(<ScreenshotCard {...mockProps} searchTerm="TEST" />);
      const highlightedText = screen.getByText('Test');
      expect(highlightedText).toHaveClass('bg-yellow-200');
    });

    it('highlights partial matches in the name', () => {
      render(<ScreenshotCard {...mockProps} searchTerm="Screen" />);
      const highlightedText = screen.getByText('Screen');
      expect(highlightedText).toHaveClass('bg-yellow-200');
    });

    it('does not highlight when searchTerm does not match', () => {
      render(<ScreenshotCard {...mockProps} searchTerm="xyz" />);
      const text = screen.getByText('Test Screenshot');
      expect(text).not.toHaveClass('bg-yellow-200');
    });

    it('handles multiple word search terms', () => {
      render(<ScreenshotCard {...mockProps} searchTerm="test screen" />);
      const highlightedTexts = screen.getAllByText(/test|screen/i);
      highlightedTexts.forEach((text) => {
        expect(text).toHaveClass('bg-yellow-200');
      });
    });

    it('renders without highlighting when searchTerm is empty', () => {
      render(<ScreenshotCard {...mockProps} searchTerm="" />);
      const text = screen.getByText('Test Screenshot');
      expect(text).not.toHaveClass('bg-yellow-200');
    });
  });
});
