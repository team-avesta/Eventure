import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EventActionModal from '@/components/admin/modals/EventActionModal';

describe('EventActionModal', () => {
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
        render(<EventActionModal {...defaultProps} />);
      });

      expect(screen.getByLabelText('Action Name')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Enter action name')
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Add Action' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Cancel' })
      ).toBeInTheDocument();
    });

    it('renders with initial data in edit mode', async () => {
      const initialData = 'Existing Action';

      await act(async () => {
        render(
          <EventActionModal {...defaultProps} initialData={initialData} />
        );
      });

      expect(screen.getByLabelText('Action Name')).toHaveValue(
        'Existing Action'
      );
      expect(
        screen.getByRole('button', { name: 'Save Changes' })
      ).toBeInTheDocument();
    });

    it('does not render when closed', async () => {
      await act(async () => {
        render(<EventActionModal {...defaultProps} isOpen={false} />);
      });

      expect(
        screen.queryByText('Add New Event Action')
      ).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Action Name')).not.toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('disables submit button when input is empty', async () => {
      await act(async () => {
        render(<EventActionModal {...defaultProps} />);
      });

      const submitButton = screen.getByRole('button', { name: 'Add Action' });
      expect(submitButton).toBeDisabled();
    });

    it('disables submit button when input is only whitespace', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<EventActionModal {...defaultProps} />);
      });

      const input = screen.getByLabelText('Action Name');
      await act(async () => {
        await user.type(input, '   ');
      });

      const submitButton = screen.getByRole('button', { name: 'Add Action' });
      expect(submitButton).toBeDisabled();
    });

    it('enables submit button when input is valid', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<EventActionModal {...defaultProps} />);
      });

      const input = screen.getByLabelText('Action Name');
      await act(async () => {
        await user.type(input, 'Valid Action');
      });

      const submitButton = screen.getByRole('button', { name: 'Add Action' });
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('Form Submission', () => {
    it('submits form with trimmed data in add mode', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<EventActionModal {...defaultProps} />);
      });

      const input = screen.getByLabelText('Action Name');
      await act(async () => {
        await user.type(input, '  New Action  ');
      });

      const submitButton = screen.getByRole('button', { name: 'Add Action' });
      await act(async () => {
        await user.click(submitButton);
      });

      expect(defaultProps.onSubmit).toHaveBeenCalledWith('New Action');
    });

    it('submits form with trimmed data in edit mode', async () => {
      const user = userEvent.setup();
      const initialData = 'Old Action';

      await act(async () => {
        render(
          <EventActionModal {...defaultProps} initialData={initialData} />
        );
      });

      const input = screen.getByLabelText('Action Name');
      await act(async () => {
        await user.clear(input);
        await user.type(input, '  Updated Action  ');
      });

      const submitButton = screen.getByRole('button', { name: 'Save Changes' });
      await act(async () => {
        await user.click(submitButton);
      });

      expect(defaultProps.onSubmit).toHaveBeenCalledWith('Updated Action');
    });

    it('does not submit when input is empty', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<EventActionModal {...defaultProps} />);
      });

      const input = screen.getByLabelText('Action Name');
      const submitButton = screen.getByRole('button', { name: 'Add Action' });

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
        <EventActionModal {...defaultProps} isOpen={false} />
      );

      await act(async () => {
        rerender(<EventActionModal {...defaultProps} isOpen={true} />);
      });

      expect(screen.getByLabelText('Action Name')).toHaveValue('');
    });

    it('calls onClose when cancel button is clicked', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<EventActionModal {...defaultProps} />);
      });

      await act(async () => {
        await user.click(screen.getByRole('button', { name: 'Cancel' }));
      });

      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('disables inputs and buttons when submitting', async () => {
      await act(async () => {
        render(<EventActionModal {...defaultProps} isSubmitting={true} />);
      });

      expect(screen.getByLabelText('Action Name')).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Loading...' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    });
  });
});
