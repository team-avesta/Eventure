import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ModuleModal from '@/components/admin/modals/ModuleModal';

describe('ModuleModal', () => {
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
    it('renders form fields correctly in add mode', async () => {
      render(<ModuleModal {...defaultProps} />);

      expect(screen.getByText('Add New Module')).toBeInTheDocument();
      expect(screen.getByLabelText('Module Name')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Enter module name')
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Add Module' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Cancel' })
      ).toBeInTheDocument();
    });

    it('renders form fields correctly in edit mode', async () => {
      const initialData = { name: 'Existing Module' };

      render(<ModuleModal {...defaultProps} initialData={initialData} />);

      expect(screen.getByText('Edit Module')).toBeInTheDocument();
      expect(screen.getByLabelText('Module Name')).toHaveValue(
        'Existing Module'
      );
      expect(
        screen.getByRole('button', { name: 'Save Changes' })
      ).toBeInTheDocument();
    });

    it('does not render when closed', async () => {
      render(<ModuleModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('Add New Module')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Module Name')).not.toBeInTheDocument();
    });
  });

  describe('Input Handling', () => {
    it('updates input value on change', async () => {
      const user = userEvent.setup();
      render(<ModuleModal {...defaultProps} />);

      const input = screen.getByLabelText('Module Name');
      await act(async () => {
        await user.type(input, 'New Module');
      });

      expect(input).toHaveValue('New Module');
    });

    it('clears input when modal is reopened in add mode', async () => {
      const { rerender } = render(
        <ModuleModal {...defaultProps} isOpen={false} />
      );

      await act(async () => {
        rerender(<ModuleModal {...defaultProps} isOpen={true} />);
      });

      expect(screen.getByLabelText('Module Name')).toHaveValue('');
    });

    it('populates input with initial data in edit mode', async () => {
      const initialData = { name: 'Existing Module' };

      await act(async () => {
        render(<ModuleModal {...defaultProps} initialData={initialData} />);
      });

      expect(screen.getByLabelText('Module Name')).toHaveValue(
        'Existing Module'
      );
    });
  });

  describe('Form Submission', () => {
    it('calls onSubmit with trimmed input value', async () => {
      const user = userEvent.setup();
      render(<ModuleModal {...defaultProps} />);

      const input = screen.getByLabelText('Module Name');
      await act(async () => {
        await user.type(input, '  New Module  ');
        await user.click(screen.getByRole('button', { name: 'Add Module' }));
      });

      expect(defaultProps.onSubmit).toHaveBeenCalledWith('New Module');
    });

    it('does not submit if input is empty or only whitespace', async () => {
      const user = userEvent.setup();
      render(<ModuleModal {...defaultProps} />);

      const input = screen.getByLabelText('Module Name');
      await act(async () => {
        await user.type(input, '   ');
        await user.click(screen.getByRole('button', { name: 'Add Module' }));
      });

      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });

    it('disables form elements when submitting', async () => {
      render(<ModuleModal {...defaultProps} isSubmitting={true} />);

      expect(screen.getByLabelText('Module Name')).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Loading...' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    });
  });

  describe('Modal Behavior', () => {
    it('calls onClose when Cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<ModuleModal {...defaultProps} />);

      await act(async () => {
        await user.click(screen.getByRole('button', { name: 'Cancel' }));
      });

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('disables submit button when input is empty', async () => {
      render(<ModuleModal {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'Add Module' })).toBeDisabled();
    });
  });
});
