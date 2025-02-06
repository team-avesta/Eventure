import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DimensionModal from '@/components/admin/modals/DimensionModal';
import { adminS3Service } from '@/services/adminS3Service';
import toast from 'react-hot-toast';

// Mock dependencies
jest.mock('@/services/adminS3Service');
jest.mock('react-hot-toast');

describe('DimensionModal', () => {
  const mockDimensionTypes = [
    { id: 'string', name: 'String' },
    { id: 'number', name: 'Number' },
  ];

  const mockExistingDimensions = [
    { id: '1', name: 'Dimension 1', type: 'string' },
    { id: '2', name: 'Dimension 2', type: 'number' },
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
      mockDimensionTypes
    );
    (adminS3Service.fetchDimensions as jest.Mock).mockResolvedValue(
      mockExistingDimensions
    );
  });

  describe('Rendering', () => {
    it('renders all form fields correctly', async () => {
      await act(async () => {
        render(<DimensionModal {...defaultProps} />);
      });

      expect(screen.getByLabelText('Dimension Number')).toBeInTheDocument();
      expect(screen.getByLabelText('Dimension Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Dimension Type')).toBeInTheDocument();
      expect(
        screen.getByLabelText('Description (Optional)')
      ).toBeInTheDocument();
    });

    it('renders with initial data in edit mode', async () => {
      const initialData = {
        id: '1',
        name: 'Test Dimension',
        description: 'Test Description',
        type: 'string',
      };

      await act(async () => {
        render(<DimensionModal {...defaultProps} initialData={initialData} />);
      });

      expect(screen.getByLabelText('Dimension Number')).toHaveValue(1);
      expect(screen.getByLabelText('Dimension Name')).toHaveValue(
        'Test Dimension'
      );
      expect(screen.getByLabelText('Description (Optional)')).toHaveValue(
        'Test Description'
      );
      expect(screen.getByLabelText('Dimension Type')).toHaveValue('string');
    });

    it('disables dimension number field in edit mode', async () => {
      const initialData = {
        id: '1',
        name: 'Test Dimension',
        type: 'string',
      };

      await act(async () => {
        render(<DimensionModal {...defaultProps} initialData={initialData} />);
      });

      expect(screen.getByLabelText('Dimension Number')).toBeDisabled();
    });
  });

  describe('Form Validation', () => {
    it('validates dimension number for duplicates', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<DimensionModal {...defaultProps} />);
      });

      await act(async () => {
        await user.type(screen.getByLabelText('Dimension Number'), '1');
      });

      expect(
        screen.getByText('This dimension number already exists')
      ).toBeInTheDocument();
    });

    it('validates dimension number for negative values', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<DimensionModal {...defaultProps} />);
      });

      await act(async () => {
        await user.type(screen.getByLabelText('Dimension Number'), '-1');
      });

      expect(
        screen.getByText('Dimension number cannot be negative')
      ).toBeInTheDocument();
    });

    it('validates dimension number for non-numeric values', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<DimensionModal {...defaultProps} />);
      });

      // Set an invalid value directly to bypass HTML5 validation
      const input = screen.getByLabelText('Dimension Number');
      await act(async () => {
        await user.type(input, '1');
        await user.clear(input);
      });

      await waitFor(() => {
        expect(
          screen.getByText('Please enter a valid number')
        ).toBeInTheDocument();
      });
    });

    it('disables submit button when form is invalid', async () => {
      await act(async () => {
        render(<DimensionModal {...defaultProps} />);
      });

      const submitButton = screen.getByRole('button', {
        name: /add dimension/i,
      });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Form Submission', () => {
    it('submits form with correct data in add mode', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<DimensionModal {...defaultProps} />);
      });

      // Fill out the form
      await act(async () => {
        await user.type(screen.getByLabelText('Dimension Number'), '3');
        await user.type(
          screen.getByLabelText('Dimension Name'),
          'New Dimension'
        );
        await user.selectOptions(
          screen.getByLabelText('Dimension Type'),
          'string'
        );
        await user.type(
          screen.getByLabelText('Description (Optional)'),
          'Test Description'
        );
      });

      // Submit the form
      await act(async () => {
        await user.click(screen.getByRole('button', { name: 'Add Dimension' }));
      });

      expect(defaultProps.onSubmit).toHaveBeenCalledWith({
        id: '3',
        name: 'New Dimension',
        description: 'Test Description',
        type: 'string',
      });
    });

    it('submits form with correct data in edit mode', async () => {
      const user = userEvent.setup();
      const initialData = {
        id: '1',
        name: 'Test Dimension',
        description: 'Old Description',
        type: 'string',
      };

      await act(async () => {
        render(<DimensionModal {...defaultProps} initialData={initialData} />);
      });

      // Update form fields
      await act(async () => {
        await user.clear(screen.getByLabelText('Dimension Name'));
        await user.type(
          screen.getByLabelText('Dimension Name'),
          'Updated Dimension'
        );
        await user.clear(screen.getByLabelText('Description (Optional)'));
        await user.type(
          screen.getByLabelText('Description (Optional)'),
          'New Description'
        );
        await user.selectOptions(
          screen.getByLabelText('Dimension Type'),
          'number'
        );
      });

      // Submit the form
      await act(async () => {
        await user.click(screen.getByRole('button', { name: 'Save Changes' }));
      });

      expect(defaultProps.onSubmit).toHaveBeenCalledWith({
        id: '1',
        name: 'Updated Dimension',
        description: 'New Description',
        type: 'number',
      });
    });

    it('handles empty description correctly', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<DimensionModal {...defaultProps} />);
      });

      // Fill out the form without description
      await act(async () => {
        await user.type(screen.getByLabelText('Dimension Number'), '3');
        await user.type(
          screen.getByLabelText('Dimension Name'),
          'New Dimension'
        );
        await user.selectOptions(
          screen.getByLabelText('Dimension Type'),
          'string'
        );
      });

      // Submit the form
      await act(async () => {
        await user.click(screen.getByRole('button', { name: 'Add Dimension' }));
      });

      expect(defaultProps.onSubmit).toHaveBeenCalledWith({
        id: '3',
        name: 'New Dimension',
        description: '',
        type: 'string',
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error toast when fetching dimension types fails', async () => {
      (adminS3Service.fetchDimensionTypes as jest.Mock).mockRejectedValue(
        new Error('Failed')
      );

      await act(async () => {
        render(<DimensionModal {...defaultProps} />);
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Failed to fetch dimension types'
        );
      });
    });

    it('displays error toast when fetching existing dimensions fails', async () => {
      (adminS3Service.fetchDimensions as jest.Mock).mockRejectedValue(
        new Error('Failed')
      );

      await act(async () => {
        render(<DimensionModal {...defaultProps} />);
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Failed to fetch existing dimensions'
        );
      });
    });
  });

  describe('Modal State', () => {
    it('resets form when modal is reopened', async () => {
      const { rerender } = render(
        <DimensionModal {...defaultProps} isOpen={false} />
      );

      await act(async () => {
        rerender(<DimensionModal {...defaultProps} isOpen={true} />);
      });

      expect(screen.getByLabelText('Dimension Number')).toHaveValue(null);
      expect(screen.getByLabelText('Dimension Name')).toHaveValue('');
      expect(screen.getByLabelText('Description (Optional)')).toHaveValue('');
      expect(screen.getByLabelText('Dimension Type')).toHaveValue('');
    });

    it('calls onClose when cancel button is clicked', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<DimensionModal {...defaultProps} />);
      });

      await act(async () => {
        await user.click(screen.getByRole('button', { name: 'Cancel' }));
      });

      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });
});
