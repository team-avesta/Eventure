import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ManageEventCategoryModal from '@/components/admin/modals/ManageEventCategoryModal';
import { adminS3Service } from '@/services/adminS3Service';
import toast from 'react-hot-toast';

// Mock dependencies
jest.mock('@/services/adminS3Service');
jest.mock('react-hot-toast');

describe('ManageEventCategoryModal', () => {
  const mockCategories = ['Category 1', 'Category 2', 'Category 3'];

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (adminS3Service.fetchEventCategories as jest.Mock).mockResolvedValue(
      mockCategories
    );
  });

  describe('Rendering', () => {
    it('renders loading state initially', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      (adminS3Service.fetchEventCategories as jest.Mock).mockImplementation(
        () => promise
      );

      await act(async () => {
        render(<ManageEventCategoryModal {...defaultProps} />);
      });

      expect(
        screen.getByText('Loading event categories...')
      ).toBeInTheDocument();

      await act(async () => {
        resolvePromise(mockCategories);
      });

      await waitFor(() => {
        expect(
          screen.getByLabelText('Select Event Category')
        ).toBeInTheDocument();
      });
    });

    it('renders empty state when no categories', async () => {
      (adminS3Service.fetchEventCategories as jest.Mock).mockResolvedValue([]);

      await act(async () => {
        render(<ManageEventCategoryModal {...defaultProps} />);
      });

      await waitFor(() => {
        expect(
          screen.getByText('No event categories available')
        ).toBeInTheDocument();
      });
    });

    it('renders categories in select dropdown', async () => {
      await act(async () => {
        render(<ManageEventCategoryModal {...defaultProps} />);
      });

      await waitFor(() => {
        expect(
          screen.getByLabelText('Select Event Category')
        ).toBeInTheDocument();
        mockCategories.forEach((category) => {
          expect(screen.getByText(category)).toBeInTheDocument();
        });
      });
    });

    it('does not render when closed', async () => {
      await act(async () => {
        render(<ManageEventCategoryModal {...defaultProps} isOpen={false} />);
      });

      expect(
        screen.queryByText('Delete Event Category')
      ).not.toBeInTheDocument();
    });
  });

  describe('Category Selection', () => {
    it('enables delete button when category is selected', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<ManageEventCategoryModal {...defaultProps} />);
      });

      await waitFor(() => {
        expect(
          screen.getByLabelText('Select Event Category')
        ).toBeInTheDocument();
      });

      const select = screen.getByLabelText('Select Event Category');
      await act(async () => {
        await user.selectOptions(select, 'Category 1');
      });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      expect(deleteButton).not.toBeDisabled();
    });

    it('disables delete button when no category is selected', async () => {
      await act(async () => {
        render(<ManageEventCategoryModal {...defaultProps} />);
      });

      await waitFor(() => {
        const deleteButton = screen.getByRole('button', { name: /delete/i });
        expect(deleteButton).toBeDisabled();
      });
    });
  });

  describe('Category Deletion', () => {
    it('shows confirmation modal when delete is clicked', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<ManageEventCategoryModal {...defaultProps} />);
      });

      await waitFor(() => {
        expect(
          screen.getByLabelText('Select Event Category')
        ).toBeInTheDocument();
      });

      const select = screen.getByLabelText('Select Event Category');
      await act(async () => {
        await user.selectOptions(select, 'Category 1');
      });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await act(async () => {
        await user.click(deleteButton);
      });

      expect(
        screen.getByText(
          /Are you sure you want to delete the event category "Category 1"\? This action cannot be undone\./i
        )
      ).toBeInTheDocument();
    });

    it('deletes category when confirmed', async () => {
      const user = userEvent.setup();
      (adminS3Service.deleteEventCategory as jest.Mock).mockResolvedValue({});

      await act(async () => {
        render(<ManageEventCategoryModal {...defaultProps} />);
      });

      await waitFor(() => {
        expect(
          screen.getByLabelText('Select Event Category')
        ).toBeInTheDocument();
      });

      const select = screen.getByLabelText('Select Event Category');
      await act(async () => {
        await user.selectOptions(select, 'Category 1');
      });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await act(async () => {
        await user.click(deleteButton);
      });

      const confirmButton = screen.getByRole('button', {
        name: 'Delete Event Category',
      });
      await act(async () => {
        await user.click(confirmButton);
      });

      expect(adminS3Service.deleteEventCategory).toHaveBeenCalledWith(
        'Category 1'
      );
      expect(toast.success).toHaveBeenCalledWith(
        'Event category deleted successfully'
      );
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('shows error toast when deletion fails', async () => {
      const user = userEvent.setup();
      (adminS3Service.deleteEventCategory as jest.Mock).mockRejectedValue(
        new Error('Failed')
      );

      await act(async () => {
        render(<ManageEventCategoryModal {...defaultProps} />);
      });

      await waitFor(() => {
        expect(
          screen.getByLabelText('Select Event Category')
        ).toBeInTheDocument();
      });

      const select = screen.getByLabelText('Select Event Category');
      await act(async () => {
        await user.selectOptions(select, 'Category 1');
      });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await act(async () => {
        await user.click(deleteButton);
      });

      const confirmButton = screen.getByRole('button', {
        name: 'Delete Event Category',
      });
      await act(async () => {
        await user.click(confirmButton);
      });

      expect(toast.error).toHaveBeenCalledWith(
        'Failed to delete event category'
      );
    });
  });

  describe('Error Handling', () => {
    it('shows error toast when fetching categories fails', async () => {
      (adminS3Service.fetchEventCategories as jest.Mock).mockRejectedValue(
        new Error('Failed')
      );

      await act(async () => {
        render(<ManageEventCategoryModal {...defaultProps} />);
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Failed to fetch event categories'
        );
      });
    });
  });

  describe('Modal State', () => {
    it('resets selected category when modal is closed and reopened', async () => {
      const user = userEvent.setup();
      const { unmount, rerender } = render(
        <ManageEventCategoryModal {...defaultProps} />
      );

      await waitFor(() => {
        expect(
          screen.getByLabelText('Select Event Category')
        ).toBeInTheDocument();
      });

      const select = screen.getByLabelText('Select Event Category');
      await act(async () => {
        await user.selectOptions(select, 'Category 1');
      });

      unmount();

      // Mock categories fetch again for reopening
      (adminS3Service.fetchEventCategories as jest.Mock).mockResolvedValue(
        mockCategories
      );

      await act(async () => {
        render(<ManageEventCategoryModal {...defaultProps} isOpen={true} />);
      });

      await waitFor(() => {
        const newSelect = screen.getByLabelText('Select Event Category');
        expect(newSelect).toHaveValue('');
      });
    });

    it('disables delete button during deletion', async () => {
      const user = userEvent.setup();
      let resolveDelete: (value: unknown) => void;
      const deletePromise = new Promise((resolve) => {
        resolveDelete = resolve;
      });
      (adminS3Service.deleteEventCategory as jest.Mock).mockImplementation(
        () => deletePromise
      );

      await act(async () => {
        render(<ManageEventCategoryModal {...defaultProps} />);
      });

      await waitFor(() => {
        expect(
          screen.getByLabelText('Select Event Category')
        ).toBeInTheDocument();
      });

      const select = screen.getByLabelText('Select Event Category');
      await act(async () => {
        await user.selectOptions(select, 'Category 1');
      });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await act(async () => {
        await user.click(deleteButton);
      });

      const confirmButton = screen.getByRole('button', {
        name: 'Delete Event Category',
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
