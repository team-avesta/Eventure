import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ManageEventActionModal from '@/components/admin/modals/ManageEventActionModal';
import { adminS3Service } from '@/services/adminS3Service';
import toast from 'react-hot-toast';

// Mock dependencies
jest.mock('@/services/adminS3Service');
jest.mock('react-hot-toast');

describe('ManageEventActionModal', () => {
  const mockActions = ['Action 1', 'Action 2', 'Action 3'];

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (adminS3Service.fetchEventActions as jest.Mock).mockResolvedValue(
      mockActions
    );
  });

  describe('Rendering', () => {
    it('renders loading state initially', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      (adminS3Service.fetchEventActions as jest.Mock).mockImplementation(
        () => promise
      );

      await act(async () => {
        render(<ManageEventActionModal {...defaultProps} />);
      });

      expect(screen.getByText('Loading event actions...')).toBeInTheDocument();

      await act(async () => {
        resolvePromise(mockActions);
      });

      await waitFor(() => {
        expect(
          screen.getByLabelText('Select Event Action')
        ).toBeInTheDocument();
      });
    });

    it('renders empty state when no actions', async () => {
      (adminS3Service.fetchEventActions as jest.Mock).mockResolvedValue([]);

      await act(async () => {
        render(<ManageEventActionModal {...defaultProps} />);
      });

      await waitFor(() => {
        expect(
          screen.getByText('No event actions available')
        ).toBeInTheDocument();
      });
    });

    it('renders actions in select dropdown', async () => {
      await act(async () => {
        render(<ManageEventActionModal {...defaultProps} />);
      });

      await waitFor(() => {
        expect(
          screen.getByLabelText('Select Event Action')
        ).toBeInTheDocument();
        mockActions.forEach((action) => {
          expect(screen.getByText(action)).toBeInTheDocument();
        });
      });
    });

    it('does not render when closed', async () => {
      await act(async () => {
        render(<ManageEventActionModal {...defaultProps} isOpen={false} />);
      });

      expect(screen.queryByText('Delete Event Action')).not.toBeInTheDocument();
    });
  });

  describe('Action Selection', () => {
    it('enables delete button when action is selected', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<ManageEventActionModal {...defaultProps} />);
      });

      await waitFor(() => {
        expect(
          screen.getByLabelText('Select Event Action')
        ).toBeInTheDocument();
      });

      const select = screen.getByLabelText('Select Event Action');
      await act(async () => {
        await user.selectOptions(select, 'Action 1');
      });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      expect(deleteButton).not.toBeDisabled();
    });

    it('disables delete button when no action is selected', async () => {
      await act(async () => {
        render(<ManageEventActionModal {...defaultProps} />);
      });

      await waitFor(() => {
        const deleteButton = screen.getByRole('button', { name: /delete/i });
        expect(deleteButton).toBeDisabled();
      });
    });
  });

  describe('Action Deletion', () => {
    it('shows confirmation modal when delete is clicked', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<ManageEventActionModal {...defaultProps} />);
      });

      await waitFor(() => {
        expect(
          screen.getByLabelText('Select Event Action')
        ).toBeInTheDocument();
      });

      const select = screen.getByLabelText('Select Event Action');
      await act(async () => {
        await user.selectOptions(select, 'Action 1');
      });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await act(async () => {
        await user.click(deleteButton);
      });

      expect(
        screen.getByText(
          /Are you sure you want to delete the event action "Action 1"\? This action cannot be undone\./i
        )
      ).toBeInTheDocument();
    });

    it('deletes action when confirmed', async () => {
      const user = userEvent.setup();
      (adminS3Service.deleteEventAction as jest.Mock).mockResolvedValue({});

      await act(async () => {
        render(<ManageEventActionModal {...defaultProps} />);
      });

      await waitFor(() => {
        expect(
          screen.getByLabelText('Select Event Action')
        ).toBeInTheDocument();
      });

      const select = screen.getByLabelText('Select Event Action');
      await act(async () => {
        await user.selectOptions(select, 'Action 1');
      });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await act(async () => {
        await user.click(deleteButton);
      });

      const confirmButton = screen.getByRole('button', {
        name: 'Delete Event Action',
      });
      await act(async () => {
        await user.click(confirmButton);
      });

      expect(adminS3Service.deleteEventAction).toHaveBeenCalledWith('Action 1');
      expect(toast.success).toHaveBeenCalledWith(
        'Event action deleted successfully'
      );
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('shows error toast when deletion fails', async () => {
      const user = userEvent.setup();
      (adminS3Service.deleteEventAction as jest.Mock).mockRejectedValue(
        new Error('Failed')
      );

      await act(async () => {
        render(<ManageEventActionModal {...defaultProps} />);
      });

      await waitFor(() => {
        expect(
          screen.getByLabelText('Select Event Action')
        ).toBeInTheDocument();
      });

      const select = screen.getByLabelText('Select Event Action');
      await act(async () => {
        await user.selectOptions(select, 'Action 1');
      });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await act(async () => {
        await user.click(deleteButton);
      });

      const confirmButton = screen.getByRole('button', {
        name: 'Delete Event Action',
      });
      await act(async () => {
        await user.click(confirmButton);
      });

      expect(toast.error).toHaveBeenCalledWith('Failed to delete event action');
    });
  });

  describe('Error Handling', () => {
    it('shows error toast when fetching actions fails', async () => {
      (adminS3Service.fetchEventActions as jest.Mock).mockRejectedValue(
        new Error('Failed')
      );

      await act(async () => {
        render(<ManageEventActionModal {...defaultProps} />);
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Failed to fetch event actions'
        );
      });
    });
  });

  describe('Modal State', () => {
    it('resets selected action when modal is closed and reopened', async () => {
      const user = userEvent.setup();
      const { unmount, rerender } = render(
        <ManageEventActionModal {...defaultProps} />
      );

      await waitFor(() => {
        expect(
          screen.getByLabelText('Select Event Action')
        ).toBeInTheDocument();
      });

      const select = screen.getByLabelText('Select Event Action');
      await act(async () => {
        await user.selectOptions(select, 'Action 1');
      });

      unmount();

      // Mock actions fetch again for reopening
      (adminS3Service.fetchEventActions as jest.Mock).mockResolvedValue(
        mockActions
      );

      await act(async () => {
        render(<ManageEventActionModal {...defaultProps} isOpen={true} />);
      });

      await waitFor(() => {
        const newSelect = screen.getByLabelText('Select Event Action');
        expect(newSelect).toHaveValue('');
      });
    });

    it('disables delete button during deletion', async () => {
      const user = userEvent.setup();
      let resolveDelete: (value: unknown) => void;
      const deletePromise = new Promise((resolve) => {
        resolveDelete = resolve;
      });
      (adminS3Service.deleteEventAction as jest.Mock).mockImplementation(
        () => deletePromise
      );

      await act(async () => {
        render(<ManageEventActionModal {...defaultProps} />);
      });

      await waitFor(() => {
        expect(
          screen.getByLabelText('Select Event Action')
        ).toBeInTheDocument();
      });

      const select = screen.getByLabelText('Select Event Action');
      await act(async () => {
        await user.selectOptions(select, 'Action 1');
      });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await act(async () => {
        await user.click(deleteButton);
      });

      const confirmButton = screen.getByRole('button', {
        name: 'Delete Event Action',
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
