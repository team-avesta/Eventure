import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EventNameModal from '@/components/admin/modals/EventNameModal';

describe('EventNameModal', () => {
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
        render(<EventNameModal {...defaultProps} />);
      });

      expect(screen.getByLabelText('Event Name')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Enter event name')
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Add Event' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Cancel' })
      ).toBeInTheDocument();
    });

    it('renders with initial data in edit mode', async () => {
      const initialData = 'Existing Event';

      await act(async () => {
        render(<EventNameModal {...defaultProps} initialData={initialData} />);
      });

      expect(screen.getByLabelText('Event Name')).toHaveValue('Existing Event');
      expect(
        screen.getByRole('button', { name: 'Save Changes' })
      ).toBeInTheDocument();
    });

    it('does not render when closed', async () => {
      await act(async () => {
        render(<EventNameModal {...defaultProps} isOpen={false} />);
      });

      expect(screen.queryByText('Add New Event Name')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Event Name')).not.toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('disables submit button when input is empty', async () => {
      await act(async () => {
        render(<EventNameModal {...defaultProps} />);
      });

      const submitButton = screen.getByRole('button', { name: 'Add Event' });
      expect(submitButton).toBeDisabled();
    });

    it('disables submit button when input is only whitespace', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<EventNameModal {...defaultProps} />);
      });

      const input = screen.getByLabelText('Event Name');
      await act(async () => {
        await user.type(input, '   ');
      });

      const submitButton = screen.getByRole('button', { name: 'Add Event' });
      expect(submitButton).toBeDisabled();
    });

    it('enables submit button when input is valid', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<EventNameModal {...defaultProps} />);
      });

      const input = screen.getByLabelText('Event Name');
      await act(async () => {
        await user.type(input, 'Valid Event');
      });

      const submitButton = screen.getByRole('button', { name: 'Add Event' });
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('Form Submission', () => {
    it('submits form with trimmed data in add mode', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<EventNameModal {...defaultProps} />);
      });

      const input = screen.getByLabelText('Event Name');
      await act(async () => {
        await user.type(input, '  New Event  ');
      });

      const submitButton = screen.getByRole('button', { name: 'Add Event' });
      await act(async () => {
        await user.click(submitButton);
      });

      expect(defaultProps.onSubmit).toHaveBeenCalledWith('New Event');
    });

    it('submits form with trimmed data in edit mode', async () => {
      const user = userEvent.setup();
      const initialData = 'Old Event';

      await act(async () => {
        render(<EventNameModal {...defaultProps} initialData={initialData} />);
      });

      const input = screen.getByLabelText('Event Name');
      await act(async () => {
        await user.clear(input);
        await user.type(input, '  Updated Event  ');
      });

      const submitButton = screen.getByRole('button', { name: 'Save Changes' });
      await act(async () => {
        await user.click(submitButton);
      });

      expect(defaultProps.onSubmit).toHaveBeenCalledWith('Updated Event');
    });

    it('does not submit when input is empty', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<EventNameModal {...defaultProps} />);
      });

      const input = screen.getByLabelText('Event Name');
      const submitButton = screen.getByRole('button', { name: 'Add Event' });

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
        <EventNameModal {...defaultProps} isOpen={false} />
      );

      await act(async () => {
        rerender(<EventNameModal {...defaultProps} isOpen={true} />);
      });

      expect(screen.getByLabelText('Event Name')).toHaveValue('');
    });

    it('calls onClose when cancel button is clicked', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<EventNameModal {...defaultProps} />);
      });

      await act(async () => {
        await user.click(screen.getByRole('button', { name: 'Cancel' }));
      });

      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('disables inputs and buttons when submitting', async () => {
      await act(async () => {
        render(<EventNameModal {...defaultProps} isSubmitting={true} />);
      });

      expect(screen.getByLabelText('Event Name')).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Loading...' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    });
  });
});
