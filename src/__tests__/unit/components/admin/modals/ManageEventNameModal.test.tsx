import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ManageEventNameModal from '@/components/admin/modals/ManageEventNameModal';
import { adminS3Service } from '@/services/adminS3Service';
import toast from 'react-hot-toast';

// Mock dependencies
jest.mock('@/services/adminS3Service');
jest.mock('react-hot-toast');

describe('ManageEventNameModal', () => {
  const mockEvents = ['Event 1', 'Event 2', 'Event 3'];

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (adminS3Service.fetchEventNames as jest.Mock).mockResolvedValue(mockEvents);
  });

  describe('Rendering', () => {
    it('renders loading state initially', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      (adminS3Service.fetchEventNames as jest.Mock).mockImplementation(
        () => promise
      );

      await act(async () => {
        render(<ManageEventNameModal {...defaultProps} />);
      });

      expect(screen.getByText('Loading event names...')).toBeInTheDocument();

      await act(async () => {
        resolvePromise(mockEvents);
      });

      await waitFor(() => {
        expect(screen.getByLabelText('Select Event Name')).toBeInTheDocument();
      });
    });

    it('renders empty state when no events', async () => {
      (adminS3Service.fetchEventNames as jest.Mock).mockResolvedValue([]);

      await act(async () => {
        render(<ManageEventNameModal {...defaultProps} />);
      });

      await waitFor(() => {
        expect(
          screen.getByText('No event names available')
        ).toBeInTheDocument();
      });
    });

    it('renders events in select dropdown', async () => {
      await act(async () => {
        render(<ManageEventNameModal {...defaultProps} />);
      });

      await waitFor(() => {
        expect(screen.getByLabelText('Select Event Name')).toBeInTheDocument();
        mockEvents.forEach((event) => {
          expect(screen.getByText(event)).toBeInTheDocument();
        });
      });
    });

    it('does not render when closed', async () => {
      await act(async () => {
        render(<ManageEventNameModal {...defaultProps} isOpen={false} />);
      });

      expect(screen.queryByText('Delete Event Name')).not.toBeInTheDocument();
    });
  });

  describe('Event Selection', () => {
    it('enables delete button when event is selected', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<ManageEventNameModal {...defaultProps} />);
      });

      await waitFor(() => {
        expect(screen.getByLabelText('Select Event Name')).toBeInTheDocument();
      });

      const select = screen.getByLabelText('Select Event Name');
      await act(async () => {
        await user.selectOptions(select, 'Event 1');
      });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      expect(deleteButton).not.toBeDisabled();
    });

    it('disables delete button when no event is selected', async () => {
      await act(async () => {
        render(<ManageEventNameModal {...defaultProps} />);
      });

      await waitFor(() => {
        const deleteButton = screen.getByRole('button', { name: /delete/i });
        expect(deleteButton).toBeDisabled();
      });
    });
  });

  describe('Event Deletion', () => {
    it('shows confirmation modal when delete is clicked', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<ManageEventNameModal {...defaultProps} />);
      });

      await waitFor(() => {
        expect(screen.getByLabelText('Select Event Name')).toBeInTheDocument();
      });

      const select = screen.getByLabelText('Select Event Name');
      await act(async () => {
        await user.selectOptions(select, 'Event 1');
      });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await act(async () => {
        await user.click(deleteButton);
      });

      expect(
        screen.getByText(
          /Are you sure you want to delete the event name "Event 1"\? This action cannot be undone\./i
        )
      ).toBeInTheDocument();
    });

    it('deletes event when confirmed', async () => {
      const user = userEvent.setup();
      (adminS3Service.deleteEventName as jest.Mock).mockResolvedValue({});

      await act(async () => {
        render(<ManageEventNameModal {...defaultProps} />);
      });

      await waitFor(() => {
        expect(screen.getByLabelText('Select Event Name')).toBeInTheDocument();
      });

      const select = screen.getByLabelText('Select Event Name');
      await act(async () => {
        await user.selectOptions(select, 'Event 1');
      });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await act(async () => {
        await user.click(deleteButton);
      });

      const confirmButton = screen.getByRole('button', {
        name: 'Delete Event Name',
      });
      await act(async () => {
        await user.click(confirmButton);
      });

      expect(adminS3Service.deleteEventName).toHaveBeenCalledWith('Event 1');
      expect(toast.success).toHaveBeenCalledWith(
        'Event name deleted successfully'
      );
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('shows error toast when deletion fails', async () => {
      const user = userEvent.setup();
      (adminS3Service.deleteEventName as jest.Mock).mockRejectedValue(
        new Error('Failed')
      );

      await act(async () => {
        render(<ManageEventNameModal {...defaultProps} />);
      });

      await waitFor(() => {
        expect(screen.getByLabelText('Select Event Name')).toBeInTheDocument();
      });

      const select = screen.getByLabelText('Select Event Name');
      await act(async () => {
        await user.selectOptions(select, 'Event 1');
      });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await act(async () => {
        await user.click(deleteButton);
      });

      const confirmButton = screen.getByRole('button', {
        name: 'Delete Event Name',
      });
      await act(async () => {
        await user.click(confirmButton);
      });

      expect(toast.error).toHaveBeenCalledWith('Failed to delete event name');
    });
  });

  describe('Error Handling', () => {
    it('shows error toast when fetching events fails', async () => {
      (adminS3Service.fetchEventNames as jest.Mock).mockRejectedValue(
        new Error('Failed')
      );

      await act(async () => {
        render(<ManageEventNameModal {...defaultProps} />);
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to fetch event names');
      });
    });
  });

  describe('Modal State', () => {
    it('resets selected event when modal is closed and reopened', async () => {
      const user = userEvent.setup();
      const { unmount, rerender } = render(
        <ManageEventNameModal {...defaultProps} />
      );

      await waitFor(() => {
        expect(screen.getByLabelText('Select Event Name')).toBeInTheDocument();
      });

      const select = screen.getByLabelText('Select Event Name');
      await act(async () => {
        await user.selectOptions(select, 'Event 1');
      });

      unmount();

      // Mock events fetch again for reopening
      (adminS3Service.fetchEventNames as jest.Mock).mockResolvedValue(
        mockEvents
      );

      await act(async () => {
        render(<ManageEventNameModal {...defaultProps} isOpen={true} />);
      });

      await waitFor(() => {
        const newSelect = screen.getByLabelText('Select Event Name');
        expect(newSelect).toHaveValue('');
      });
    });

    it('disables delete button during deletion', async () => {
      const user = userEvent.setup();
      let resolveDelete: (value: unknown) => void;
      const deletePromise = new Promise((resolve) => {
        resolveDelete = resolve;
      });
      (adminS3Service.deleteEventName as jest.Mock).mockImplementation(
        () => deletePromise
      );

      await act(async () => {
        render(<ManageEventNameModal {...defaultProps} />);
      });

      await waitFor(() => {
        expect(screen.getByLabelText('Select Event Name')).toBeInTheDocument();
      });

      const select = screen.getByLabelText('Select Event Name');
      await act(async () => {
        await user.selectOptions(select, 'Event 1');
      });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await act(async () => {
        await user.click(deleteButton);
      });

      const confirmButton = screen.getByRole('button', {
        name: 'Delete Event Name',
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
