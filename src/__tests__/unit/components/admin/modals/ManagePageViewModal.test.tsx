import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ManagePageViewModal from '@/components/admin/modals/ManagePageViewModal';
import { adminS3Service } from '@/services/adminS3Service';
import toast from 'react-hot-toast';

// Mock dependencies
jest.mock('@/services/adminS3Service');
jest.mock('react-hot-toast');

describe('ManagePageViewModal', () => {
  const mockPageViews = [
    { id: 'page1', title: 'Page 1', url: '/page1' },
    { id: 'page2', title: 'Page 2', url: '/page2' },
    { id: 'page3', title: 'Page 3', url: '/page3' },
  ];

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (adminS3Service.fetchPageViews as jest.Mock).mockResolvedValue(
      mockPageViews
    );
  });

  describe('Rendering', () => {
    it('renders loading state initially', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      (adminS3Service.fetchPageViews as jest.Mock).mockImplementation(
        () => promise
      );

      await act(async () => {
        render(<ManagePageViewModal {...defaultProps} />);
      });

      expect(screen.getByText('Loading page views...')).toBeInTheDocument();

      await act(async () => {
        resolvePromise(mockPageViews);
      });

      await waitFor(() => {
        expect(screen.getByLabelText('Select Page View')).toBeInTheDocument();
      });
    });

    it('renders empty state when no page views', async () => {
      (adminS3Service.fetchPageViews as jest.Mock).mockResolvedValue([]);

      await act(async () => {
        render(<ManagePageViewModal {...defaultProps} />);
      });

      await waitFor(() => {
        expect(screen.getByText('No page views available')).toBeInTheDocument();
      });
    });

    it('renders page views in select dropdown', async () => {
      await act(async () => {
        render(<ManagePageViewModal {...defaultProps} />);
      });

      await waitFor(() => {
        expect(screen.getByLabelText('Select Page View')).toBeInTheDocument();
        mockPageViews.forEach((pageView) => {
          expect(screen.getByText(pageView.title)).toBeInTheDocument();
        });
      });
    });

    it('does not render when closed', async () => {
      await act(async () => {
        render(<ManagePageViewModal {...defaultProps} isOpen={false} />);
      });

      expect(screen.queryByText('Delete Page View')).not.toBeInTheDocument();
    });
  });

  describe('Page View Selection', () => {
    it('enables delete button when page view is selected', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<ManagePageViewModal {...defaultProps} />);
      });

      await waitFor(() => {
        expect(screen.getByLabelText('Select Page View')).toBeInTheDocument();
      });

      const select = screen.getByLabelText('Select Page View');
      await act(async () => {
        await user.selectOptions(select, 'page1');
      });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      expect(deleteButton).not.toBeDisabled();
    });

    it('disables delete button when no page view is selected', async () => {
      await act(async () => {
        render(<ManagePageViewModal {...defaultProps} />);
      });

      await waitFor(() => {
        const deleteButton = screen.getByRole('button', { name: /delete/i });
        expect(deleteButton).toBeDisabled();
      });
    });
  });

  describe('Page View Deletion', () => {
    it('shows confirmation modal when delete is clicked', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<ManagePageViewModal {...defaultProps} />);
      });

      await waitFor(() => {
        expect(screen.getByLabelText('Select Page View')).toBeInTheDocument();
      });

      const select = screen.getByLabelText('Select Page View');
      await act(async () => {
        await user.selectOptions(select, 'page1');
      });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await act(async () => {
        await user.click(deleteButton);
      });

      expect(
        screen.getByText(
          /Are you sure you want to delete \/page1\? This action cannot be undone\./i
        )
      ).toBeInTheDocument();
    });

    it('deletes page view when confirmed', async () => {
      const user = userEvent.setup();
      (adminS3Service.deletePageView as jest.Mock).mockResolvedValue({});

      await act(async () => {
        render(<ManagePageViewModal {...defaultProps} />);
      });

      await waitFor(() => {
        expect(screen.getByLabelText('Select Page View')).toBeInTheDocument();
      });

      const select = screen.getByLabelText('Select Page View');
      await act(async () => {
        await user.selectOptions(select, 'page1');
      });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await act(async () => {
        await user.click(deleteButton);
      });

      const confirmButton = screen.getByRole('button', {
        name: 'Delete Page View',
      });
      await act(async () => {
        await user.click(confirmButton);
      });

      expect(adminS3Service.deletePageView).toHaveBeenCalledWith('page1');
      expect(toast.success).toHaveBeenCalledWith(
        'Page view deleted successfully'
      );
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('shows error toast when deletion fails', async () => {
      const user = userEvent.setup();
      (adminS3Service.deletePageView as jest.Mock).mockRejectedValue(
        new Error('Failed')
      );

      await act(async () => {
        render(<ManagePageViewModal {...defaultProps} />);
      });

      await waitFor(() => {
        expect(screen.getByLabelText('Select Page View')).toBeInTheDocument();
      });

      const select = screen.getByLabelText('Select Page View');
      await act(async () => {
        await user.selectOptions(select, 'page1');
      });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await act(async () => {
        await user.click(deleteButton);
      });

      const confirmButton = screen.getByRole('button', {
        name: 'Delete Page View',
      });
      await act(async () => {
        await user.click(confirmButton);
      });

      expect(toast.error).toHaveBeenCalledWith('Failed to delete page view');
    });
  });

  describe('Error Handling', () => {
    it('shows error toast when fetching page views fails', async () => {
      (adminS3Service.fetchPageViews as jest.Mock).mockRejectedValue(
        new Error('Failed')
      );

      await act(async () => {
        render(<ManagePageViewModal {...defaultProps} />);
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to fetch page views');
      });
    });
  });

  describe('Modal State', () => {
    it('resets selected page view when modal is closed and reopened', async () => {
      const user = userEvent.setup();
      const { unmount, rerender } = render(
        <ManagePageViewModal {...defaultProps} />
      );

      await waitFor(() => {
        expect(screen.getByLabelText('Select Page View')).toBeInTheDocument();
      });

      const select = screen.getByLabelText('Select Page View');
      await act(async () => {
        await user.selectOptions(select, 'page1');
      });

      unmount();

      // Mock page views fetch again for reopening
      (adminS3Service.fetchPageViews as jest.Mock).mockResolvedValue(
        mockPageViews
      );

      await act(async () => {
        render(<ManagePageViewModal {...defaultProps} isOpen={true} />);
      });

      await waitFor(() => {
        const newSelect = screen.getByLabelText('Select Page View');
        expect(newSelect).toHaveValue('');
      });
    });

    it('disables delete button during deletion', async () => {
      const user = userEvent.setup();
      let resolveDelete: (value: unknown) => void;
      const deletePromise = new Promise((resolve) => {
        resolveDelete = resolve;
      });
      (adminS3Service.deletePageView as jest.Mock).mockImplementation(
        () => deletePromise
      );

      await act(async () => {
        render(<ManagePageViewModal {...defaultProps} />);
      });

      await waitFor(() => {
        expect(screen.getByLabelText('Select Page View')).toBeInTheDocument();
      });

      const select = screen.getByLabelText('Select Page View');
      await act(async () => {
        await user.selectOptions(select, 'page1');
      });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await act(async () => {
        await user.click(deleteButton);
      });

      const confirmButton = screen.getByRole('button', {
        name: 'Delete Page View',
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
