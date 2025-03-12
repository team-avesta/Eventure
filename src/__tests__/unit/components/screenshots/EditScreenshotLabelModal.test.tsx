import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditScreenshotLabelModal from '@/components/screenshots/EditScreenshotLabelModal';
import { PageLabel } from '@/types/pageLabel';

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
        data-testid="label-select"
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

describe('EditScreenshotLabelModal', () => {
  // Sample data for tests
  const mockLabels: PageLabel[] = [
    { id: 'label_1', name: 'Home' },
    { id: 'label_2', name: 'Dashboard' },
    { id: 'label_3', name: 'Settings' },
  ];

  // Common props
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSave: jest.fn(),
    currentLabelId: 'label_1',
    availableLabels: mockLabels,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders correctly when open', () => {
      render(<EditScreenshotLabelModal {...defaultProps} />);

      expect(screen.getByTestId('modal')).toBeInTheDocument();
      expect(screen.getByText('Edit Screenshot Label')).toBeInTheDocument();
      expect(screen.getByTestId('label-select')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      render(<EditScreenshotLabelModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('renders all available labels in the select dropdown', () => {
      render(<EditScreenshotLabelModal {...defaultProps} />);

      // Check for "No label" option
      expect(screen.getByText('No label')).toBeInTheDocument();

      // Check for all mock labels
      mockLabels.forEach((label) => {
        expect(screen.getByText(label.name)).toBeInTheDocument();
      });
    });

    it('shows "Remove label" button when a label is currently selected', () => {
      render(<EditScreenshotLabelModal {...defaultProps} />);

      expect(screen.getByText('Remove label')).toBeInTheDocument();
    });

    it('does not show "Remove label" button when no label is currently selected', () => {
      render(
        <EditScreenshotLabelModal {...defaultProps} currentLabelId={null} />
      );

      expect(screen.queryByText('Remove label')).not.toBeInTheDocument();
    });
  });

  describe('State Management', () => {
    it('initializes with the current label selected', () => {
      render(<EditScreenshotLabelModal {...defaultProps} />);

      const selectElement = screen.getByTestId(
        'label-select'
      ) as HTMLSelectElement;
      expect(selectElement.value).toBe('label_1');
    });

    it('initializes with empty selection when currentLabelId is null', () => {
      render(
        <EditScreenshotLabelModal {...defaultProps} currentLabelId={null} />
      );

      const selectElement = screen.getByTestId(
        'label-select'
      ) as HTMLSelectElement;
      expect(selectElement.value).toBe('');
    });

    it('updates selected label when user makes a selection', async () => {
      const user = userEvent.setup();
      render(<EditScreenshotLabelModal {...defaultProps} />);

      const selectElement = screen.getByTestId('label-select');

      // Wrap in act to handle state updates
      await act(async () => {
        await user.selectOptions(selectElement, 'label_2');
      });

      expect((selectElement as HTMLSelectElement).value).toBe('label_2');
    });
  });

  describe('Interactions', () => {
    it('calls onSave with the selected label ID when Save is clicked', () => {
      render(<EditScreenshotLabelModal {...defaultProps} />);

      // Change selection to label_2
      act(() => {
        fireEvent.change(screen.getByTestId('label-select'), {
          target: { value: 'label_2' },
        });
      });

      // Click save button
      fireEvent.click(screen.getByText('Save'));

      // Verify onSave was called with the correct label ID
      expect(defaultProps.onSave).toHaveBeenCalledWith('label_2');
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('calls onSave with null when "No label" is selected', () => {
      render(<EditScreenshotLabelModal {...defaultProps} />);

      // Change selection to empty (No label)
      act(() => {
        fireEvent.change(screen.getByTestId('label-select'), {
          target: { value: '' },
        });
      });

      // Click save button
      fireEvent.click(screen.getByText('Save'));

      // Verify onSave was called with null
      expect(defaultProps.onSave).toHaveBeenCalledWith(null);
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('calls onSave with null when "Remove label" button is clicked', () => {
      render(<EditScreenshotLabelModal {...defaultProps} />);

      // Click remove label button
      fireEvent.click(screen.getByText('Remove label'));

      // Verify onSave was called with null
      expect(defaultProps.onSave).toHaveBeenCalledWith(null);
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  describe('Effect Behavior', () => {
    it('resets selected label when modal is reopened', async () => {
      const { rerender } = render(
        <EditScreenshotLabelModal {...defaultProps} isOpen={false} />
      );

      // Open modal with label_2 as current
      await act(async () => {
        rerender(
          <EditScreenshotLabelModal
            {...defaultProps}
            isOpen={true}
            currentLabelId="label_2"
          />
        );
      });

      const selectElement = screen.getByTestId(
        'label-select'
      ) as HTMLSelectElement;
      expect(selectElement.value).toBe('label_2');

      // Close modal
      rerender(
        <EditScreenshotLabelModal
          {...defaultProps}
          isOpen={false}
          currentLabelId="label_2"
        />
      );

      // Reopen with different label
      await act(async () => {
        rerender(
          <EditScreenshotLabelModal
            {...defaultProps}
            isOpen={true}
            currentLabelId="label_3"
          />
        );
      });

      // Should reset to new current label
      expect(
        (screen.getByTestId('label-select') as HTMLSelectElement).value
      ).toBe('label_3');
    });
  });
});
