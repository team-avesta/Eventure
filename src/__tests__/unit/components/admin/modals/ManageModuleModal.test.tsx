import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ManageModuleModal from '@/components/admin/modals/ManageModuleModal';
import { adminS3Service } from '@/services/adminS3Service';
import toast from 'react-hot-toast';

// Mock dependencies
jest.mock('@/services/adminS3Service');
jest.mock('react-hot-toast');

describe('ManageModuleModal', () => {
  const mockModules = [
    { key: 'module1', name: 'Module 1' },
    { key: 'module2', name: 'Module 2' },
    { key: 'module3', name: 'Module 3' },
  ];

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (adminS3Service.fetchModules as jest.Mock).mockResolvedValue(mockModules);
  });

  describe('Rendering', () => {
    it('renders loading state initially', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      (adminS3Service.fetchModules as jest.Mock).mockImplementation(
        () => promise
      );

      await act(async () => {
        render(<ManageModuleModal {...defaultProps} />);
      });

      expect(screen.getByText('Loading modules...')).toBeInTheDocument();

      await act(async () => {
        resolvePromise(mockModules);
      });

      await waitFor(() => {
        expect(screen.getByLabelText('Select Module')).toBeInTheDocument();
      });
    });

    it('renders empty state when no modules', async () => {
      (adminS3Service.fetchModules as jest.Mock).mockResolvedValue([]);

      await act(async () => {
        render(<ManageModuleModal {...defaultProps} />);
      });

      await waitFor(() => {
        expect(screen.getByText('No modules available')).toBeInTheDocument();
      });
    });

    it('renders modules in select dropdown', async () => {
      await act(async () => {
        render(<ManageModuleModal {...defaultProps} />);
      });

      await waitFor(() => {
        expect(screen.getByLabelText('Select Module')).toBeInTheDocument();
        mockModules.forEach((module) => {
          expect(screen.getByText(module.name)).toBeInTheDocument();
        });
      });
    });

    it('does not render when closed', async () => {
      await act(async () => {
        render(<ManageModuleModal {...defaultProps} isOpen={false} />);
      });

      expect(screen.queryByText('Delete Module')).not.toBeInTheDocument();
    });
  });

  describe('Module Selection', () => {
    it('enables delete button when module is selected', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<ManageModuleModal {...defaultProps} />);
      });

      await waitFor(() => {
        expect(screen.getByLabelText('Select Module')).toBeInTheDocument();
      });

      const select = screen.getByLabelText('Select Module');
      await act(async () => {
        await user.selectOptions(select, 'module1');
      });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      expect(deleteButton).not.toBeDisabled();
    });

    it('disables delete button when no module is selected', async () => {
      await act(async () => {
        render(<ManageModuleModal {...defaultProps} />);
      });

      await waitFor(() => {
        const deleteButton = screen.getByRole('button', { name: /delete/i });
        expect(deleteButton).toBeDisabled();
      });
    });
  });

  describe('Module Deletion', () => {
    it('shows confirmation modal when delete is clicked', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<ManageModuleModal {...defaultProps} />);
      });

      await waitFor(() => {
        expect(screen.getByLabelText('Select Module')).toBeInTheDocument();
      });

      const select = screen.getByLabelText('Select Module');
      await act(async () => {
        await user.selectOptions(select, 'module1');
      });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await act(async () => {
        await user.click(deleteButton);
      });

      expect(
        screen.getByText(
          /Are you sure you want to delete Module 1\? This action cannot be undone\./i
        )
      ).toBeInTheDocument();
    });

    it('deletes module when confirmed', async () => {
      const user = userEvent.setup();
      (adminS3Service.deleteModule as jest.Mock).mockResolvedValue({});

      await act(async () => {
        render(<ManageModuleModal {...defaultProps} />);
      });

      await waitFor(() => {
        expect(screen.getByLabelText('Select Module')).toBeInTheDocument();
      });

      const select = screen.getByLabelText('Select Module');
      await act(async () => {
        await user.selectOptions(select, 'module1');
      });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await act(async () => {
        await user.click(deleteButton);
      });

      const confirmButton = screen.getByRole('button', {
        name: 'Delete Module',
      });
      await act(async () => {
        await user.click(confirmButton);
      });

      expect(adminS3Service.deleteModule).toHaveBeenCalledWith('module1');
      expect(toast.success).toHaveBeenCalledWith('Module deleted successfully');
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('shows error toast when deletion fails', async () => {
      const user = userEvent.setup();
      (adminS3Service.deleteModule as jest.Mock).mockRejectedValue(
        new Error('Failed')
      );

      await act(async () => {
        render(<ManageModuleModal {...defaultProps} />);
      });

      await waitFor(() => {
        expect(screen.getByLabelText('Select Module')).toBeInTheDocument();
      });

      const select = screen.getByLabelText('Select Module');
      await act(async () => {
        await user.selectOptions(select, 'module1');
      });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await act(async () => {
        await user.click(deleteButton);
      });

      const confirmButton = screen.getByRole('button', {
        name: 'Delete Module',
      });
      await act(async () => {
        await user.click(confirmButton);
      });

      expect(toast.error).toHaveBeenCalledWith('Failed to delete module');
    });
  });

  describe('Error Handling', () => {
    it('shows error toast when fetching modules fails', async () => {
      (adminS3Service.fetchModules as jest.Mock).mockRejectedValue(
        new Error('Failed')
      );

      await act(async () => {
        render(<ManageModuleModal {...defaultProps} />);
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to fetch modules');
      });
    });
  });

  describe('Modal State', () => {
    it('resets selected module when modal is closed and reopened', async () => {
      const user = userEvent.setup();
      const { unmount, rerender } = render(
        <ManageModuleModal {...defaultProps} />
      );

      await waitFor(() => {
        expect(screen.getByLabelText('Select Module')).toBeInTheDocument();
      });

      const select = screen.getByLabelText('Select Module');
      await act(async () => {
        await user.selectOptions(select, 'module1');
      });

      unmount();

      // Mock modules fetch again for reopening
      (adminS3Service.fetchModules as jest.Mock).mockResolvedValue(mockModules);

      await act(async () => {
        render(<ManageModuleModal {...defaultProps} isOpen={true} />);
      });

      await waitFor(() => {
        const newSelect = screen.getByLabelText('Select Module');
        expect(newSelect).toHaveValue('');
      });
    });

    it('disables delete button during deletion', async () => {
      const user = userEvent.setup();
      let resolveDelete: (value: unknown) => void;
      const deletePromise = new Promise((resolve) => {
        resolveDelete = resolve;
      });
      (adminS3Service.deleteModule as jest.Mock).mockImplementation(
        () => deletePromise
      );

      await act(async () => {
        render(<ManageModuleModal {...defaultProps} />);
      });

      await waitFor(() => {
        expect(screen.getByLabelText('Select Module')).toBeInTheDocument();
      });

      const select = screen.getByLabelText('Select Module');
      await act(async () => {
        await user.selectOptions(select, 'module1');
      });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await act(async () => {
        await user.click(deleteButton);
      });

      const confirmButton = screen.getByRole('button', {
        name: 'Delete Module',
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
