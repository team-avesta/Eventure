import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditScreenshotStatusModal from '@/components/screenshots/EditScreenshotStatusModal';
import { ScreenshotStatus } from '@/services/adminS3Service';

// Mock the Modal component to avoid testing its implementation
jest.mock('@/components/shared/Modal', () => ({
  Modal: ({
    children,
    isOpen,
    title,
    onSubmit,
    submitLabel,
  }: {
    children: React.ReactNode;
    isOpen: boolean;
    title: string;
    onSubmit: () => void;
    submitLabel: string;
  }) =>
    isOpen ? (
      <div data-testid="modal">
        <h2>{title}</h2>
        <div>{children}</div>
        <button onClick={onSubmit}>{submitLabel}</button>
      </div>
    ) : null,
}));

// Mock the Select component to simplify testing
jest.mock('@/components/shared/Select', () => ({
  Select: ({
    id,
    label,
    value,
    onChange,
    options,
  }: {
    id: string;
    label: string;
    value: string;
    onChange: (e: { target: { value: string } }) => void;
    options: Array<{ value: string; label: string }>;
  }) => (
    <div>
      <label htmlFor={id}>{label}</label>
      <select
        data-testid="status-select"
        id={id}
        value={value}
        onChange={onChange}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  ),
}));

describe('EditScreenshotStatusModal', () => {
  // shared props
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSave: jest.fn(),
    currentStatus: ScreenshotStatus.TODO,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders correctly when open', () => {
      render(<EditScreenshotStatusModal {...defaultProps} />);

      expect(screen.getByTestId('modal')).toBeInTheDocument();
      expect(screen.getByText('Edit Screenshot Status')).toBeInTheDocument();
      expect(screen.getByTestId('status-select')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      render(<EditScreenshotStatusModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('renders all status options in the select dropdown', () => {
      render(<EditScreenshotStatusModal {...defaultProps} />);

      // Check for all status options
      Object.values(ScreenshotStatus).forEach((status) => {
        expect(screen.getByText(status)).toBeInTheDocument();
      });
    });
  });

  describe('State Management', () => {
    it('initializes with the current status selected', () => {
      render(<EditScreenshotStatusModal {...defaultProps} />);

      const selectElement = screen.getByTestId(
        'status-select'
      ) as HTMLSelectElement;
      expect(selectElement.value).toBe(ScreenshotStatus.TODO);
    });

    it('initializes with IN_PROGRESS status when provided', () => {
      render(
        <EditScreenshotStatusModal
          {...defaultProps}
          currentStatus={ScreenshotStatus.IN_PROGRESS}
        />
      );

      const selectElement = screen.getByTestId(
        'status-select'
      ) as HTMLSelectElement;
      expect(selectElement.value).toBe(ScreenshotStatus.IN_PROGRESS);
    });

    it('initializes with DONE status when provided', () => {
      render(
        <EditScreenshotStatusModal
          {...defaultProps}
          currentStatus={ScreenshotStatus.DONE}
        />
      );

      const selectElement = screen.getByTestId(
        'status-select'
      ) as HTMLSelectElement;
      expect(selectElement.value).toBe(ScreenshotStatus.DONE);
    });

    it('updates selected status when user makes a selection', async () => {
      const user = userEvent.setup();
      render(<EditScreenshotStatusModal {...defaultProps} />);

      const selectElement = screen.getByTestId('status-select');

      // Wrap in act to handle state updates
      await act(async () => {
        await user.selectOptions(selectElement, ScreenshotStatus.IN_PROGRESS);
      });

      expect((selectElement as HTMLSelectElement).value).toBe(
        ScreenshotStatus.IN_PROGRESS
      );
    });
  });

  describe('Interactions', () => {
    it('calls onSave with the selected status when Save is clicked', () => {
      render(<EditScreenshotStatusModal {...defaultProps} />);

      // Change selection to IN_PROGRESS
      act(() => {
        fireEvent.change(screen.getByTestId('status-select'), {
          target: { value: ScreenshotStatus.IN_PROGRESS },
        });
      });

      // Click save button
      fireEvent.click(screen.getByText('Save'));

      // Verify onSave was called with the correct status
      expect(defaultProps.onSave).toHaveBeenCalledWith(
        ScreenshotStatus.IN_PROGRESS
      );
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('calls onSave with the current status if no change is made', () => {
      render(<EditScreenshotStatusModal {...defaultProps} />);

      // Click save button without changing the selection
      fireEvent.click(screen.getByText('Save'));

      // Verify onSave was called with the current status
      expect(defaultProps.onSave).toHaveBeenCalledWith(ScreenshotStatus.TODO);
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  describe('Effect Behavior', () => {
    it('resets selected status when modal is reopened with different status', async () => {
      const { rerender } = render(
        <EditScreenshotStatusModal {...defaultProps} isOpen={false} />
      );

      // Open modal with TODO status
      await act(async () => {
        rerender(
          <EditScreenshotStatusModal
            {...defaultProps}
            isOpen={true}
            currentStatus={ScreenshotStatus.TODO}
          />
        );
      });

      const selectElement = screen.getByTestId(
        'status-select'
      ) as HTMLSelectElement;
      expect(selectElement.value).toBe(ScreenshotStatus.TODO);

      // Change selection to IN_PROGRESS
      act(() => {
        fireEvent.change(selectElement, {
          target: { value: ScreenshotStatus.IN_PROGRESS },
        });
      });
      expect(selectElement.value).toBe(ScreenshotStatus.IN_PROGRESS);

      // Close modal
      rerender(
        <EditScreenshotStatusModal
          {...defaultProps}
          isOpen={false}
          currentStatus={ScreenshotStatus.TODO}
        />
      );

      // Reopen with different status
      await act(async () => {
        rerender(
          <EditScreenshotStatusModal
            {...defaultProps}
            isOpen={true}
            currentStatus={ScreenshotStatus.DONE}
          />
        );
      });

      // Should reset to new current status
      expect(
        (screen.getByTestId('status-select') as HTMLSelectElement).value
      ).toBe(ScreenshotStatus.DONE);
    });
  });
});
