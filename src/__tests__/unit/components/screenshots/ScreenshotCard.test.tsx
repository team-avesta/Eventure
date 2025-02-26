import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ScreenshotCard from '@/components/screenshots/ScreenshotCard';
import { Screenshot, ScreenshotStatus } from '@/services/adminS3Service';
import userEvent from '@testing-library/user-event';
import { PageLabel } from '@/types/pageLabel';
import { act } from 'react';

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

// Mock the modal components
jest.mock('@/components/screenshots/EditScreenshotNameModal', () => {
  const mockFn = jest.fn();
  return {
    __esModule: true,
    default: mockFn,
  };
});

jest.mock('@/components/screenshots/EditScreenshotLabelModal', () => {
  const mockFn = jest.fn();
  return {
    __esModule: true,
    default: mockFn,
  };
});

jest.mock('@/components/screenshots/EditScreenshotStatusModal', () => {
  const mockFn = jest.fn();
  return {
    __esModule: true,
    default: mockFn,
  };
});

describe('ScreenshotCard', () => {
  const mockScreenshot: Screenshot = {
    id: 'test-id',
    name: 'Test Screenshot',
    url: 'https://example.com/image.jpg',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    status: ScreenshotStatus.TODO,
    pageName: 'Test Page',
    labelId: undefined,
  };

  const mockAvailableLabels = [
    { id: 'label-1', name: 'Label 1' },
    { id: 'label-2', name: 'Label 2' },
  ];

  const mockProps = {
    screenshot: mockScreenshot,
    userRole: 'user',
    onStatusChange: jest.fn(),
    onDelete: jest.fn(),
    onNameChange: jest.fn(),
    onLabelChange: jest.fn(),
    isDragModeEnabled: false,
    isDeleting: false,
    availableLabels: mockAvailableLabels,
    labelName: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    const EditScreenshotNameModal =
      require('@/components/screenshots/EditScreenshotNameModal').default;
    const EditScreenshotLabelModal =
      require('@/components/screenshots/EditScreenshotLabelModal').default;
    const EditScreenshotStatusModal =
      require('@/components/screenshots/EditScreenshotStatusModal').default;

    EditScreenshotNameModal.mockImplementation(
      ({
        isOpen,
        onClose,
        onSave,
        currentName,
      }: {
        isOpen: boolean;
        onClose: () => void;
        onSave: (name: string) => void;
        currentName: string;
      }) =>
        isOpen ? (
          <div role="dialog" aria-label="Edit Screenshot Name">
            <input data-testid="name-input" defaultValue={currentName} />
            <button onClick={() => onSave('New Name')}>Save</button>
            <button onClick={onClose}>Cancel</button>
          </div>
        ) : null
    );

    EditScreenshotLabelModal.mockImplementation(
      ({
        isOpen,
        onClose,
        onSave,
        currentLabelId,
        availableLabels,
      }: {
        isOpen: boolean;
        onClose: () => void;
        onSave: (labelId: string | null) => void;
        currentLabelId: string | null | undefined;
        availableLabels: PageLabel[];
      }) =>
        isOpen ? (
          <div role="dialog" aria-label="Edit Screenshot Label">
            <select
              data-testid="label-select"
              defaultValue={currentLabelId || ''}
            >
              <option value="">No Label</option>
              {availableLabels?.map((label) => (
                <option key={label.id} value={label.id}>
                  {label.name}
                </option>
              ))}
            </select>
            <button onClick={() => onSave('label-1')}>Save</button>
            <button onClick={() => onSave(null)}>Remove Label</button>
            <button onClick={onClose}>Cancel</button>
          </div>
        ) : null
    );

    EditScreenshotStatusModal.mockImplementation(
      ({
        isOpen,
        onClose,
        onSave,
        currentStatus,
      }: {
        isOpen: boolean;
        onClose: () => void;
        onSave: (status: ScreenshotStatus) => void;
        currentStatus: ScreenshotStatus;
      }) =>
        isOpen ? (
          <div role="dialog" aria-label="Edit Screenshot Status">
            <select data-testid="status-select" defaultValue={currentStatus}>
              <option value={ScreenshotStatus.TODO}>
                {ScreenshotStatus.TODO}
              </option>
              <option value={ScreenshotStatus.IN_PROGRESS}>
                {ScreenshotStatus.IN_PROGRESS}
              </option>
              <option value={ScreenshotStatus.DONE}>
                {ScreenshotStatus.DONE}
              </option>
            </select>
            <button onClick={() => onSave(ScreenshotStatus.DONE)}>Save</button>
            <button onClick={onClose}>Cancel</button>
          </div>
        ) : null
    );
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

    it('calls onDelete when delete button is clicked', async () => {
      render(<ScreenshotCard {...adminProps} />);

      const deleteButton = screen.getByTitle('Delete screenshot');
      await act(async () => {
        fireEvent.click(deleteButton);
      });

      expect(mockProps.onDelete).toHaveBeenCalledWith(mockScreenshot.id);
    });

    it('opens edit name modal when edit button is clicked', async () => {
      const user = userEvent.setup();
      render(<ScreenshotCard {...adminProps} />);

      await act(async () => {
        await user.click(screen.getByTitle('Edit name'));
      });

      expect(
        screen.getByRole('dialog', { name: 'Edit Screenshot Name' })
      ).toBeInTheDocument();
    });

    it('calls onNameChange when name is saved', async () => {
      const user = userEvent.setup();
      render(<ScreenshotCard {...adminProps} />);

      // Open the modal
      await act(async () => {
        await user.click(screen.getByTitle('Edit name'));
      });

      // Click save
      await act(async () => {
        await user.click(screen.getByRole('button', { name: 'Save' }));
      });

      expect(mockProps.onNameChange).toHaveBeenCalledWith(
        mockScreenshot.id,
        'New Name'
      );
    });

    it('opens status modal when status chip is clicked', async () => {
      const user = userEvent.setup();
      render(<ScreenshotCard {...adminProps} />);

      await act(async () => {
        await user.click(screen.getByText('TODO'));
      });

      expect(
        screen.getByRole('dialog', { name: 'Edit Screenshot Status' })
      ).toBeInTheDocument();
    });

    it('calls onStatusChange when status is saved', async () => {
      const user = userEvent.setup();
      render(<ScreenshotCard {...adminProps} />);

      // Open the modal
      await act(async () => {
        await user.click(screen.getByText('TODO'));
      });

      // Click save
      await act(async () => {
        await user.click(screen.getByRole('button', { name: 'Save' }));
      });

      expect(mockProps.onStatusChange).toHaveBeenCalledWith(
        mockScreenshot.id,
        ScreenshotStatus.DONE
      );
    });
  });

  describe('Label functionality', () => {
    it('displays label chip when label is provided', () => {
      render(<ScreenshotCard {...mockProps} labelName="Test Label" />);
      expect(screen.getByText('Test Label')).toBeInTheDocument();
    });

    it('displays add label button for admin when no label is present', () => {
      render(
        <ScreenshotCard {...mockProps} labelName={null} userRole="admin" />
      );

      expect(screen.getByText('Add label')).toBeInTheDocument();
    });

    it('does not display add label button for non-admin users', () => {
      render(
        <ScreenshotCard {...mockProps} labelName={null} userRole="user" />
      );

      expect(screen.queryByText('Add label')).not.toBeInTheDocument();
    });

    it('opens label modal when label chip is clicked by admin', async () => {
      const user = userEvent.setup();
      const EditScreenshotLabelModal =
        require('@/components/screenshots/EditScreenshotLabelModal').default;

      render(
        <ScreenshotCard
          {...mockProps}
          labelName="Test Label"
          userRole="admin"
        />
      );

      await act(async () => {
        await user.click(screen.getByText('Test Label'));
      });

      expect(EditScreenshotLabelModal).toHaveBeenCalledWith(
        expect.objectContaining({
          isOpen: true,
          currentLabelId: null,
        }),
        expect.anything()
      );
    });

    it('opens label modal when add label button is clicked', async () => {
      const user = userEvent.setup();
      const EditScreenshotLabelModal =
        require('@/components/screenshots/EditScreenshotLabelModal').default;

      render(
        <ScreenshotCard {...mockProps} labelName={null} userRole="admin" />
      );

      await act(async () => {
        await user.click(screen.getByText('Add label'));
      });

      expect(EditScreenshotLabelModal).toHaveBeenCalledWith(
        expect.objectContaining({
          isOpen: true,
          currentLabelId: null,
        }),
        expect.anything()
      );
    });

    it('calls onLabelChange when label is saved', async () => {
      const onLabelChange = jest.fn();
      const user = userEvent.setup();
      const EditScreenshotLabelModal =
        require('@/components/screenshots/EditScreenshotLabelModal').default;

      render(
        <ScreenshotCard
          {...mockProps}
          labelName={null}
          userRole="admin"
          onLabelChange={onLabelChange}
        />
      );

      // Open the modal
      await act(async () => {
        await user.click(screen.getByText('Add label'));
      });

      // Get the onSave callback from the last call to the modal
      const onSaveCallback = EditScreenshotLabelModal.mock.calls[0][0].onSave;

      // Call the onSave callback with a new label ID
      await act(async () => {
        onSaveCallback('new-label-id');
      });

      expect(onLabelChange).toHaveBeenCalledWith('test-id', 'new-label-id');
    });

    it('calls onLabelChange with null when label is removed', async () => {
      const onLabelChange = jest.fn();
      const user = userEvent.setup();
      const EditScreenshotLabelModal =
        require('@/components/screenshots/EditScreenshotLabelModal').default;

      render(
        <ScreenshotCard
          {...mockProps}
          labelName="Test Label"
          userRole="admin"
          onLabelChange={onLabelChange}
        />
      );

      // Open the modal
      await act(async () => {
        await user.click(screen.getByText('Test Label'));
      });

      // Get the onSave callback from the last call to the modal
      const onSaveCallback = EditScreenshotLabelModal.mock.calls[0][0].onSave;

      // Call the onSave callback with null to remove the label
      await act(async () => {
        onSaveCallback(null);
      });

      expect(onLabelChange).toHaveBeenCalledWith('test-id', null);
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
