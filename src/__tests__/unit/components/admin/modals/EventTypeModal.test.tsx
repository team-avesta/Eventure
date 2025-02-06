import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EventTypeModal from '@/components/admin/modals/EventTypeModal';

describe('EventTypeModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSubmit: jest.fn(),
    isSubmitting: false,
    initialData: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders form fields correctly', async () => {
      await act(async () => {
        render(<EventTypeModal {...defaultProps} />);
      });

      expect(screen.getByLabelText('Type')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(
          'Enter dimension type (e.g., string, string-multi, long, boolean)'
        )
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Add Dimension Type' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Cancel' })
      ).toBeInTheDocument();
    });

    it('renders with initial data in edit mode', async () => {
      const initialData = 'string-multi';

      await act(async () => {
        render(<EventTypeModal {...defaultProps} initialData={initialData} />);
      });

      expect(screen.getByLabelText('Type')).toHaveValue('string-multi');
      expect(
        screen.getByRole('button', { name: 'Save Changes' })
      ).toBeInTheDocument();
    });

    it('does not render when closed', async () => {
      await act(async () => {
        render(<EventTypeModal {...defaultProps} isOpen={false} />);
      });

      expect(
        screen.queryByText('Add New Dimension Type')
      ).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Type')).not.toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('disables submit button when input is empty', async () => {
      await act(async () => {
        render(<EventTypeModal {...defaultProps} />);
      });

      const submitButton = screen.getByRole('button', {
        name: 'Add Dimension Type',
      });
      expect(submitButton).toBeDisabled();
    });

    it('disables submit button when input is only whitespace', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<EventTypeModal {...defaultProps} />);
      });

      const input = screen.getByLabelText('Type');
      await act(async () => {
        await user.type(input, '   ');
      });

      const submitButton = screen.getByRole('button', {
        name: 'Add Dimension Type',
      });
      expect(submitButton).toBeDisabled();
    });

    it('enables submit button when input is valid', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<EventTypeModal {...defaultProps} />);
      });

      const input = screen.getByLabelText('Type');
      await act(async () => {
        await user.type(input, 'string');
      });

      const submitButton = screen.getByRole('button', {
        name: 'Add Dimension Type',
      });
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('Form Submission', () => {
    it('submits form with trimmed data in add mode', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<EventTypeModal {...defaultProps} />);
      });

      const input = screen.getByLabelText('Type');
      await act(async () => {
        await user.type(input, '  string-multi  ');
      });

      const submitButton = screen.getByRole('button', {
        name: 'Add Dimension Type',
      });
      await act(async () => {
        await user.click(submitButton);
      });

      expect(defaultProps.onSubmit).toHaveBeenCalledWith('string-multi');
    });

    it('submits form with trimmed data in edit mode', async () => {
      const user = userEvent.setup();
      const initialData = 'string';

      await act(async () => {
        render(<EventTypeModal {...defaultProps} initialData={initialData} />);
      });

      const input = screen.getByLabelText('Type');
      await act(async () => {
        await user.clear(input);
        await user.type(input, '  string-multi  ');
      });

      const submitButton = screen.getByRole('button', { name: 'Save Changes' });
      await act(async () => {
        await user.click(submitButton);
      });

      expect(defaultProps.onSubmit).toHaveBeenCalledWith('string-multi');
    });

    it('does not submit when input is empty', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<EventTypeModal {...defaultProps} />);
      });

      const input = screen.getByLabelText('Type');
      const submitButton = screen.getByRole('button', {
        name: 'Add Dimension Type',
      });

      // Try to click submit with empty input
      await act(async () => {
        await user.click(submitButton);
      });

      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Modal State', () => {
    it('resets form when modal is reopened', async () => {
      const { rerender } = render(
        <EventTypeModal {...defaultProps} isOpen={false} />
      );

      await act(async () => {
        rerender(<EventTypeModal {...defaultProps} isOpen={true} />);
      });

      expect(screen.getByLabelText('Type')).toHaveValue('');
    });

    it('calls onClose when cancel button is clicked', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<EventTypeModal {...defaultProps} />);
      });

      await act(async () => {
        await user.click(screen.getByRole('button', { name: 'Cancel' }));
      });

      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('disables inputs and buttons when submitting', async () => {
      await act(async () => {
        render(<EventTypeModal {...defaultProps} isSubmitting={true} />);
      });

      expect(screen.getByLabelText('Type')).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Loading...' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    });
  });
});
