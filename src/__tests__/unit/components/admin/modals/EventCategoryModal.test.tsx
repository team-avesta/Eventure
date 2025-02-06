import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EventCategoryModal from '@/components/admin/modals/EventCategoryModal';

describe('EventCategoryModal', () => {
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
        render(<EventCategoryModal {...defaultProps} />);
      });

      expect(screen.getByLabelText('Category Name')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Enter category name')
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Add Category' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Cancel' })
      ).toBeInTheDocument();
    });

    it('renders with initial data in edit mode', async () => {
      const initialData = 'Existing Category';

      await act(async () => {
        render(
          <EventCategoryModal {...defaultProps} initialData={initialData} />
        );
      });

      expect(screen.getByLabelText('Category Name')).toHaveValue(
        'Existing Category'
      );
      expect(
        screen.getByRole('button', { name: 'Save Changes' })
      ).toBeInTheDocument();
    });

    it('does not render when closed', async () => {
      await act(async () => {
        render(<EventCategoryModal {...defaultProps} isOpen={false} />);
      });

      expect(
        screen.queryByText('Add New Event Category')
      ).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Category Name')).not.toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('disables submit button when input is empty', async () => {
      await act(async () => {
        render(<EventCategoryModal {...defaultProps} />);
      });

      const submitButton = screen.getByRole('button', { name: 'Add Category' });
      expect(submitButton).toBeDisabled();
    });

    it('disables submit button when input is only whitespace', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<EventCategoryModal {...defaultProps} />);
      });

      const input = screen.getByLabelText('Category Name');
      await act(async () => {
        await user.type(input, '   ');
      });

      const submitButton = screen.getByRole('button', { name: 'Add Category' });
      expect(submitButton).toBeDisabled();
    });

    it('enables submit button when input is valid', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<EventCategoryModal {...defaultProps} />);
      });

      const input = screen.getByLabelText('Category Name');
      await act(async () => {
        await user.type(input, 'Valid Category');
      });

      const submitButton = screen.getByRole('button', { name: 'Add Category' });
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('Form Submission', () => {
    it('submits form with trimmed data in add mode', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<EventCategoryModal {...defaultProps} />);
      });

      const input = screen.getByLabelText('Category Name');
      await act(async () => {
        await user.type(input, '  New Category  ');
      });

      const submitButton = screen.getByRole('button', { name: 'Add Category' });
      await act(async () => {
        await user.click(submitButton);
      });

      expect(defaultProps.onSubmit).toHaveBeenCalledWith('New Category');
    });

    it('submits form with trimmed data in edit mode', async () => {
      const user = userEvent.setup();
      const initialData = 'Old Category';

      await act(async () => {
        render(
          <EventCategoryModal {...defaultProps} initialData={initialData} />
        );
      });

      const input = screen.getByLabelText('Category Name');
      await act(async () => {
        await user.clear(input);
        await user.type(input, '  Updated Category  ');
      });

      const submitButton = screen.getByRole('button', { name: 'Save Changes' });
      await act(async () => {
        await user.click(submitButton);
      });

      expect(defaultProps.onSubmit).toHaveBeenCalledWith('Updated Category');
    });

    it('does not submit when input is empty', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<EventCategoryModal {...defaultProps} />);
      });

      const input = screen.getByLabelText('Category Name');
      const submitButton = screen.getByRole('button', { name: 'Add Category' });

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
        <EventCategoryModal {...defaultProps} isOpen={false} />
      );

      await act(async () => {
        rerender(<EventCategoryModal {...defaultProps} isOpen={true} />);
      });

      expect(screen.getByLabelText('Category Name')).toHaveValue('');
    });

    it('calls onClose when cancel button is clicked', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<EventCategoryModal {...defaultProps} />);
      });

      await act(async () => {
        await user.click(screen.getByRole('button', { name: 'Cancel' }));
      });

      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('disables inputs and buttons when submitting', async () => {
      await act(async () => {
        render(<EventCategoryModal {...defaultProps} isSubmitting={true} />);
      });

      expect(screen.getByLabelText('Category Name')).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Loading...' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    });
  });
});
