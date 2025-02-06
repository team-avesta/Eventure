import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ManageDimensionModal from '@/components/admin/modals/ManageDimensionModal';
import { adminS3Service } from '@/services/adminS3Service';
import toast from 'react-hot-toast';

// Mock dependencies
jest.mock('@/services/adminS3Service');
jest.mock('react-hot-toast');

describe('ManageDimensionModal', () => {
  const mockDimensions = [
    { id: '1', name: 'Dimension 1', type: 'string' },
    { id: '2', name: 'Dimension 2', type: 'number' },
  ];

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (adminS3Service.fetchDimensions as jest.Mock).mockResolvedValue(
      mockDimensions
    );
  });

  describe('Rendering', () => {
    it('renders loading state initially', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      (adminS3Service.fetchDimensions as jest.Mock).mockImplementation(
        () => promise
      );

      await act(async () => {
        render(<ManageDimensionModal {...defaultProps} />);
      });

      expect(screen.getByText('Loading dimensions...')).toBeInTheDocument();

      await act(async () => {
        resolvePromise(mockDimensions);
      });

      await waitFor(() => {
        expect(screen.getByLabelText('Select Dimension')).toBeInTheDocument();
      });
    });

    it('renders empty state when no dimensions', async () => {
      (adminS3Service.fetchDimensions as jest.Mock).mockResolvedValue([]);

      await act(async () => {
        render(<ManageDimensionModal {...defaultProps} />);
      });

      await waitFor(() => {
        expect(screen.getByText('No dimensions available')).toBeInTheDocument();
      });
    });

    it('renders dimensions in select dropdown', async () => {
      await act(async () => {
        render(<ManageDimensionModal {...defaultProps} />);
      });

      await waitFor(() => {
        expect(screen.getByLabelText('Select Dimension')).toBeInTheDocument();
        expect(screen.getByText('1. Dimension 1')).toBeInTheDocument();
        expect(screen.getByText('2. Dimension 2')).toBeInTheDocument();
      });
    });

    it('does not render when closed', async () => {
      await act(async () => {
        render(<ManageDimensionModal {...defaultProps} isOpen={false} />);
      });

      expect(screen.queryByText('Delete Dimension')).not.toBeInTheDocument();
    });
  });

  describe('Dimension Selection', () => {
    it('enables delete button when dimension is selected', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<ManageDimensionModal {...defaultProps} />);
      });

      await waitFor(() => {
        expect(screen.getByLabelText('Select Dimension')).toBeInTheDocument();
      });

      const select = screen.getByLabelText('Select Dimension');
      await act(async () => {
        await user.selectOptions(select, '1');
      });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      expect(deleteButton).not.toBeDisabled();
    });

    it('disables delete button when no dimension is selected', async () => {
      await act(async () => {
        render(<ManageDimensionModal {...defaultProps} />);
      });

      await waitFor(() => {
        const deleteButton = screen.getByRole('button', { name: /delete/i });
        expect(deleteButton).toBeDisabled();
      });
    });
  });

  describe('Dimension Deletion', () => {
    it('shows confirmation modal when delete is clicked', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<ManageDimensionModal {...defaultProps} />);
      });

      await waitFor(() => {
        expect(screen.getByLabelText('Select Dimension')).toBeInTheDocument();
      });

      const select = screen.getByLabelText('Select Dimension');
      await act(async () => {
        await user.selectOptions(select, '1');
      });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await act(async () => {
        await user.click(deleteButton);
      });

      expect(
        screen.getByText(
          /Are you sure you want to delete Dimension 1\? This action cannot be undone\./i
        )
      ).toBeInTheDocument();
    });

    it('deletes dimension when confirmed', async () => {
      const user = userEvent.setup();
      (adminS3Service.deleteDimension as jest.Mock).mockResolvedValue({});

      await act(async () => {
        render(<ManageDimensionModal {...defaultProps} />);
      });

      await waitFor(() => {
        expect(screen.getByLabelText('Select Dimension')).toBeInTheDocument();
      });

      const select = screen.getByLabelText('Select Dimension');
      await act(async () => {
        await user.selectOptions(select, '1');
      });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await act(async () => {
        await user.click(deleteButton);
      });

      const confirmButton = screen.getByRole('button', {
        name: 'Delete Dimension',
      });
      await act(async () => {
        await user.click(confirmButton);
      });

      expect(adminS3Service.deleteDimension).toHaveBeenCalledWith('1');
      expect(toast.success).toHaveBeenCalledWith(
        'Dimension deleted successfully'
      );
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('shows error toast when deletion fails', async () => {
      const user = userEvent.setup();
      (adminS3Service.deleteDimension as jest.Mock).mockRejectedValue(
        new Error('Failed')
      );

      await act(async () => {
        render(<ManageDimensionModal {...defaultProps} />);
      });

      await waitFor(() => {
        expect(screen.getByLabelText('Select Dimension')).toBeInTheDocument();
      });

      const select = screen.getByLabelText('Select Dimension');
      await act(async () => {
        await user.selectOptions(select, '1');
      });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await act(async () => {
        await user.click(deleteButton);
      });

      const confirmButton = screen.getByRole('button', {
        name: 'Delete Dimension',
      });
      await act(async () => {
        await user.click(confirmButton);
      });

      expect(toast.error).toHaveBeenCalledWith('Failed to delete dimension');
    });
  });

  describe('Error Handling', () => {
    it('shows error toast when fetching dimensions fails', async () => {
      (adminS3Service.fetchDimensions as jest.Mock).mockRejectedValue(
        new Error('Failed')
      );

      await act(async () => {
        render(<ManageDimensionModal {...defaultProps} />);
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to fetch dimensions');
      });
    });
  });

  describe('Modal State', () => {
    it('resets selected dimension when modal is closed and reopened', async () => {
      const user = userEvent.setup();
      const { unmount, rerender } = render(
        <ManageDimensionModal {...defaultProps} />
      );

      await waitFor(() => {
        expect(screen.getByLabelText('Select Dimension')).toBeInTheDocument();
      });

      const select = screen.getByLabelText('Select Dimension');
      await act(async () => {
        await user.selectOptions(select, '1');
      });

      unmount();

      // Mock dimensions fetch again for reopening
      (adminS3Service.fetchDimensions as jest.Mock).mockResolvedValue(
        mockDimensions
      );

      await act(async () => {
        render(<ManageDimensionModal {...defaultProps} isOpen={true} />);
      });

      // Wait for dimensions to be fetched and select to be reset
      await waitFor(() => {
        const newSelect = screen.getByLabelText('Select Dimension');
        expect(newSelect).toHaveDisplayValue(['Select a dimension']);
      });
    });

    it('disables delete button during deletion', async () => {
      const user = userEvent.setup();
      let resolveDelete: (value: unknown) => void;
      const deletePromise = new Promise((resolve) => {
        resolveDelete = resolve;
      });
      (adminS3Service.deleteDimension as jest.Mock).mockImplementation(
        () => deletePromise
      );

      await act(async () => {
        render(<ManageDimensionModal {...defaultProps} />);
      });

      await waitFor(() => {
        expect(screen.getByLabelText('Select Dimension')).toBeInTheDocument();
      });

      const select = screen.getByLabelText('Select Dimension');
      await act(async () => {
        await user.selectOptions(select, '1');
      });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await act(async () => {
        await user.click(deleteButton);
      });

      const confirmButton = screen.getByRole('button', {
        name: 'Delete Dimension',
      });
      await act(async () => {
        await user.click(confirmButton);
      });

      expect(deleteButton).toBeDisabled();

      await act(async () => {
        resolveDelete({});
      });
    });
  });
});
