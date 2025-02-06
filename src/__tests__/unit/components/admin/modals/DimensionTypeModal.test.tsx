import {
  render,
  screen,
  waitFor,
  act,
  fireEvent,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DimensionTypeModal from '@/components/admin/modals/DimensionTypeModal';
import { adminS3Service } from '@/services/adminS3Service';
import toast from 'react-hot-toast';

// Mock dependencies
jest.mock('@/services/adminS3Service');
jest.mock('react-hot-toast', () => ({
  error: jest.fn(),
}));

describe('DimensionTypeModal', () => {
  const mockExistingTypes = [
    { id: 'string', name: 'String' },
    { id: 'string_multiple', name: 'String (Multiple)' },
    { id: 'number', name: 'Number' },
  ];

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSubmit: jest.fn(),
    isSubmitting: false,
    initialData: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (adminS3Service.fetchDimensionTypes as jest.Mock).mockResolvedValue(
      mockExistingTypes
    );
  });

  describe('Rendering', () => {
    it('renders form fields correctly', async () => {
      await act(async () => {
        render(<DimensionTypeModal {...defaultProps} />);
      });

      expect(screen.getByLabelText('Display Name')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(
          'Enter display name (e.g., String, String (Multiple), Long)'
        )
      ).toBeInTheDocument();
    });

    it('renders with initial data in edit mode', async () => {
      const initialData = { id: 'string', name: 'String' };

      await act(async () => {
        render(
          <DimensionTypeModal {...defaultProps} initialData={initialData} />
        );
      });

      expect(screen.getByLabelText('Display Name')).toHaveValue('String');
      expect(
        screen.getByRole('button', { name: 'Save Changes' })
      ).toBeInTheDocument();
    });

    it('shows type ID preview when name is entered', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<DimensionTypeModal {...defaultProps} />);
      });

      await act(async () => {
        await user.type(
          screen.getByLabelText('Display Name'),
          'String (Multiple)'
        );
      });

      expect(screen.getByText('Type ID:')).toBeInTheDocument();
      expect(screen.getByText('string_multiple')).toBeInTheDocument();
    });
  });

  describe('Type ID Generation', () => {
    it('generates correct type ID for simple name', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<DimensionTypeModal {...defaultProps} />);
      });

      await act(async () => {
        await user.type(screen.getByLabelText('Display Name'), 'Simple Name');
      });

      expect(screen.getByText('simple_name')).toBeInTheDocument();
    });

    it('generates correct type ID for name with parentheses', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<DimensionTypeModal {...defaultProps} />);
      });

      await act(async () => {
        await user.type(
          screen.getByLabelText('Display Name'),
          'String (Multiple)'
        );
      });

      expect(screen.getByText('string_multiple')).toBeInTheDocument();
    });

    it('handles special characters correctly', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<DimensionTypeModal {...defaultProps} />);
      });

      await act(async () => {
        await user.type(
          screen.getByLabelText('Display Name'),
          'Test@#$%^&* Type'
        );
      });

      expect(screen.getByText('test_type')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('validates duplicate type ID', async () => {
      const mockTypes = [{ id: 'string', name: 'Different Name' }];
      (adminS3Service.fetchDimensionTypes as jest.Mock).mockResolvedValue(
        mockTypes
      );

      render(<DimensionTypeModal {...defaultProps} />);
      await waitFor(() => {
        expect(adminS3Service.fetchDimensionTypes).toHaveBeenCalled();
      });

      const nameInput = screen.getByLabelText('Display Name');
      fireEvent.change(nameInput, { target: { value: 'String' } });

      // Submit to trigger validation
      const submitButton = screen.getByRole('button', {
        name: 'Add Dimension Type',
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Type ID "string" already exists')
        ).toBeInTheDocument();
      });
    });

    it('validates duplicate name', async () => {
      const mockTypes = [{ id: 'different_id', name: 'STRING' }];
      (adminS3Service.fetchDimensionTypes as jest.Mock).mockResolvedValue(
        mockTypes
      );

      render(<DimensionTypeModal {...defaultProps} />);
      await waitFor(() => {
        expect(adminS3Service.fetchDimensionTypes).toHaveBeenCalled();
      });

      const nameInput = screen.getByLabelText('Display Name');
      fireEvent.change(nameInput, { target: { value: 'STRING' } });

      // Submit to trigger validation
      const submitButton = screen.getByRole('button', {
        name: 'Add Dimension Type',
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Type name "STRING" already exists')
        ).toBeInTheDocument();
      });
    });

    it('allows editing existing type without duplicate error', async () => {
      const user = userEvent.setup();
      const initialData = { id: 'string', name: 'String' };

      await act(async () => {
        render(
          <DimensionTypeModal {...defaultProps} initialData={initialData} />
        );
      });

      await act(async () => {
        await user.clear(screen.getByLabelText('Display Name'));
        await user.type(screen.getByLabelText('Display Name'), 'String');
      });

      expect(
        screen.queryByText('Type ID "string" already exists')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText('Type name "String" already exists')
      ).not.toBeInTheDocument();
    });

    it('disables submit button when form is invalid', async () => {
      const mockTypes = [{ id: 'string', name: 'String' }];
      (adminS3Service.fetchDimensionTypes as jest.Mock).mockResolvedValue(
        mockTypes
      );

      render(<DimensionTypeModal {...defaultProps} />);
      await waitFor(() => {
        expect(adminS3Service.fetchDimensionTypes).toHaveBeenCalled();
      });

      const submitButton = screen.getByRole('button', {
        name: 'Add Dimension Type',
      });

      // Empty input
      expect(submitButton).toHaveAttribute('disabled');

      // Add invalid input
      const nameInput = screen.getByLabelText('Display Name');
      fireEvent.change(nameInput, { target: { value: 'String' } });

      // Submit to trigger validation
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toHaveAttribute('disabled');
      });
    });

    it('clears error when input changes', async () => {
      const mockTypes = [{ id: 'different_id', name: 'String' }];
      (adminS3Service.fetchDimensionTypes as jest.Mock).mockResolvedValue(
        mockTypes
      );

      render(<DimensionTypeModal {...defaultProps} />);
      await waitFor(() => {
        expect(adminS3Service.fetchDimensionTypes).toHaveBeenCalled();
      });

      const nameInput = screen.getByLabelText('Display Name');

      // First trigger the error
      fireEvent.change(nameInput, { target: { value: 'String' } });
      const submitButton = screen.getByRole('button', {
        name: 'Add Dimension Type',
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Type name "String" already exists')
        ).toBeInTheDocument();
      });

      // Then clear it by changing input
      fireEvent.change(nameInput, { target: { value: 'New String' } });

      await waitFor(() => {
        expect(
          screen.queryByText('Type name "String" already exists')
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('submits form with correct data in add mode', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<DimensionTypeModal {...defaultProps} />);
      });

      await act(async () => {
        await user.type(screen.getByLabelText('Display Name'), 'New Type');
      });

      await act(async () => {
        await user.click(
          screen.getByRole('button', { name: 'Add Dimension Type' })
        );
      });

      expect(defaultProps.onSubmit).toHaveBeenCalledWith({
        id: 'new_type',
        name: 'New Type',
      });
    });

    it('submits form with correct data in edit mode', async () => {
      const user = userEvent.setup();
      const initialData = { id: 'old_type', name: 'Old Type' };

      await act(async () => {
        render(
          <DimensionTypeModal {...defaultProps} initialData={initialData} />
        );
      });

      await act(async () => {
        await user.clear(screen.getByLabelText('Display Name'));
        await user.type(screen.getByLabelText('Display Name'), 'Updated Type');
      });

      await act(async () => {
        await user.click(screen.getByRole('button', { name: 'Save Changes' }));
      });

      expect(defaultProps.onSubmit).toHaveBeenCalledWith({
        id: 'updated_type',
        name: 'Updated Type',
      });
    });

    it('trims whitespace from input values', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<DimensionTypeModal {...defaultProps} />);
      });

      await act(async () => {
        await user.type(screen.getByLabelText('Display Name'), '  New Type  ');
      });

      await act(async () => {
        await user.click(
          screen.getByRole('button', { name: 'Add Dimension Type' })
        );
      });

      expect(defaultProps.onSubmit).toHaveBeenCalledWith({
        id: 'new_type',
        name: 'New Type',
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error toast when fetching dimension types fails', async () => {
      const error = new Error('Failed to fetch dimension types');
      (adminS3Service.fetchDimensionTypes as jest.Mock).mockRejectedValue(
        error
      );

      render(<DimensionTypeModal {...defaultProps} />);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Failed to fetch dimension types'
        );
      });
    });
  });

  describe('Modal State', () => {
    it('resets form when modal is reopened', async () => {
      const { rerender } = render(
        <DimensionTypeModal {...defaultProps} isOpen={false} />
      );

      await act(async () => {
        rerender(<DimensionTypeModal {...defaultProps} isOpen={true} />);
      });

      expect(screen.getByLabelText('Display Name')).toHaveValue('');
    });

    it('calls onClose when cancel button is clicked', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<DimensionTypeModal {...defaultProps} />);
      });

      await act(async () => {
        await user.click(screen.getByRole('button', { name: 'Cancel' }));
      });

      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });
});
