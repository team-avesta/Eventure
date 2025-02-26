import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminListView } from '@/components/admin/AdminListView';
import { adminS3Service } from '@/services/adminS3Service';
import toast from 'react-hot-toast';

// Mock dependencies
jest.mock('@/services/adminS3Service');
jest.mock('react-hot-toast');

// Manual mock for pageLabelService
jest.mock('@/services/pageLabelService', () => ({
  pageLabelService: {
    getAllLabels: jest.fn(),
    createLabel: jest.fn(),
    updateLabel: jest.fn(),
    deleteLabel: jest.fn(),
  },
}));

// Import after mocking
import { pageLabelService } from '@/services/pageLabelService';

const mockModules = [
  { key: '1', name: 'Module 1' },
  { key: '2', name: 'Module 2' },
];

const mockPageViews = [
  { id: '1', title: 'Page 1', url: '/page1' },
  { id: '2', title: 'Page 2', url: '/page2' },
];

const mockDimensions = [
  {
    id: '1',
    name: 'Dimension 1',
    type: 'string',
    description: 'Description 1',
  },
  {
    id: '2',
    name: 'Dimension 2',
    type: 'number',
    description: 'Description 2',
  },
];

const mockPageLabels = [
  { id: '1', name: 'Label 1' },
  { id: '2', name: 'Label 2' },
];

describe('AdminListView', () => {
  const defaultProps = {
    type: 'module' as const,
    title: 'Modules',
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default mock implementations
    (adminS3Service.fetchModules as jest.Mock).mockResolvedValue(mockModules);
    (adminS3Service.fetchPageViews as jest.Mock).mockResolvedValue(
      mockPageViews
    );
    (adminS3Service.fetchDimensions as jest.Mock).mockResolvedValue(
      mockDimensions
    );
    (pageLabelService.getAllLabels as jest.Mock).mockResolvedValue(
      mockPageLabels
    );
  });

  describe('Rendering', () => {
    it('renders header with title and add button', async () => {
      await act(async () => {
        render(<AdminListView {...defaultProps} />);
      });

      expect(screen.getByText('Modules')).toBeInTheDocument();
      expect(screen.getByText('Manage your modules')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Add Modules' })
      ).toBeInTheDocument();
    });

    it('shows loading state initially', async () => {
      // Create a promise that we can control
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      // Make the mock wait for our promise
      (adminS3Service.fetchModules as jest.Mock).mockImplementation(
        () => promise
      );

      await act(async () => {
        render(<AdminListView {...defaultProps} />);
      });

      // Check loading state before resolving
      expect(screen.getByText('Loading items...')).toBeInTheDocument();

      // Resolve the promise
      await act(async () => {
        resolvePromise(mockModules);
      });
    });

    it('shows empty state when no items', async () => {
      (adminS3Service.fetchModules as jest.Mock).mockResolvedValue([]);

      await act(async () => {
        render(<AdminListView {...defaultProps} />);
      });

      await waitFor(() => {
        expect(screen.getByText('No items available')).toBeInTheDocument();
      });
    });
  });

  describe('Data Fetching', () => {
    it('fetches modules on mount', async () => {
      await act(async () => {
        render(<AdminListView {...defaultProps} />);
      });

      await waitFor(() => {
        expect(adminS3Service.fetchModules).toHaveBeenCalled();
      });

      expect(screen.getByText('Module 1')).toBeInTheDocument();
      expect(screen.getByText('Module 2')).toBeInTheDocument();
    });

    it('fetches page views when type is pageview', async () => {
      await act(async () => {
        render(
          <AdminListView {...defaultProps} type="pageview" title="Page Views" />
        );
      });

      await waitFor(() => {
        expect(adminS3Service.fetchPageViews).toHaveBeenCalled();
      });

      expect(screen.getByText('Page 1')).toBeInTheDocument();
      expect(screen.getByText('/page1')).toBeInTheDocument();
    });

    it('fetches page labels when type is pageLabel', async () => {
      await act(async () => {
        render(
          <AdminListView
            {...defaultProps}
            type="pageLabel"
            title="Page Labels"
          />
        );
      });

      await waitFor(() => {
        expect(pageLabelService.getAllLabels).toHaveBeenCalled();
      });

      expect(screen.getByText('Label 1')).toBeInTheDocument();
      expect(screen.getByText('Label 2')).toBeInTheDocument();
    });

    it('handles fetch error', async () => {
      (adminS3Service.fetchModules as jest.Mock).mockRejectedValue(
        new Error('Failed')
      );

      await act(async () => {
        render(<AdminListView {...defaultProps} />);
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to fetch modules');
      });
    });
  });

  describe('CRUD Operations', () => {
    it('opens add modal when clicking add button', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<AdminListView {...defaultProps} />);
      });

      await act(async () => {
        await user.click(screen.getByRole('button', { name: 'Add Modules' }));
      });

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('opens edit modal with item data', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<AdminListView {...defaultProps} />);
      });

      await waitFor(() => {
        expect(screen.getByText('Module 1')).toBeInTheDocument();
      });

      await act(async () => {
        const editButtons = screen.getAllByRole('button', { name: 'Edit' });
        await user.click(editButtons[0]);
      });

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('opens delete confirmation modal', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<AdminListView {...defaultProps} />);
      });

      await waitFor(() => {
        expect(screen.getByText('Module 1')).toBeInTheDocument();
      });

      await act(async () => {
        const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
        await user.click(deleteButtons[0]);
      });

      expect(
        screen.getByText(/Are you sure you want to delete this/)
      ).toBeInTheDocument();
    });

    it('handles item creation successfully', async () => {
      const user = userEvent.setup();
      (adminS3Service.createModule as jest.Mock).mockResolvedValue({});

      await act(async () => {
        render(<AdminListView {...defaultProps} />);
      });

      await act(async () => {
        await user.click(screen.getByRole('button', { name: 'Add Modules' }));
      });

      // Submit the form
      await act(async () => {
        await user.type(screen.getByLabelText(/name/i), 'New Module');
        await user.click(screen.getByRole('button', { name: 'Add Module' }));
      });

      await waitFor(() => {
        expect(adminS3Service.createModule).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith(
          'Modules added successfully'
        );
      });
    });

    it('handles item update successfully', async () => {
      const user = userEvent.setup();
      (adminS3Service.updateModule as jest.Mock).mockResolvedValue({});

      await act(async () => {
        render(<AdminListView {...defaultProps} />);
      });

      await waitFor(() => {
        expect(screen.getByText('Module 1')).toBeInTheDocument();
      });

      await act(async () => {
        const editButtons = screen.getAllByRole('button', { name: 'Edit' });
        await user.click(editButtons[0]);
      });

      // Update the form
      await act(async () => {
        await user.type(screen.getByLabelText(/name/i), ' Updated');
        await user.click(screen.getByRole('button', { name: 'Save Changes' }));
      });

      await waitFor(() => {
        expect(adminS3Service.updateModule).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith(
          'Modules updated successfully'
        );
      });
    });

    it('handles item deletion successfully', async () => {
      const user = userEvent.setup();
      (adminS3Service.deleteModule as jest.Mock).mockResolvedValue({});

      await act(async () => {
        render(<AdminListView {...defaultProps} />);
      });

      await waitFor(() => {
        expect(screen.getByText('Module 1')).toBeInTheDocument();
      });

      await act(async () => {
        const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
        await user.click(deleteButtons[0]);
      });

      await act(async () => {
        await user.click(
          screen.getByRole('button', { name: 'Delete Modules' })
        );
      });

      await waitFor(() => {
        expect(adminS3Service.deleteModule).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith(
          'Modules deleted successfully'
        );
      });
    });

    it('handles operation errors', async () => {
      const user = userEvent.setup();
      (adminS3Service.createModule as jest.Mock).mockRejectedValue(
        new Error('Failed')
      );

      await act(async () => {
        render(<AdminListView {...defaultProps} />);
      });

      await act(async () => {
        await user.click(screen.getByRole('button', { name: 'Add Modules' }));
      });

      // Submit the form
      await act(async () => {
        await user.type(screen.getByLabelText(/name/i), 'New Module');
        await user.click(screen.getByRole('button', { name: 'Add Module' }));
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to add modules');
      });
    });
  });

  describe('CRUD Operations for Page Labels', () => {
    it('creates a new page label', async () => {
      const user = userEvent.setup();
      (pageLabelService.createLabel as jest.Mock).mockResolvedValue({
        id: '3',
        name: 'New Label',
      });

      await act(async () => {
        render(
          <AdminListView
            {...defaultProps}
            type="pageLabel"
            title="Page Labels"
          />
        );
      });

      await act(async () => {
        await user.click(
          screen.getByRole('button', { name: 'Add Page Labels' })
        );
      });

      // Submit the form
      await act(async () => {
        await user.type(screen.getByLabelText(/name/i), 'New Label');
        await user.click(screen.getByRole('button', { name: 'Create' }));
      });

      await waitFor(() => {
        expect(pageLabelService.createLabel).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith(
          'Page Labels added successfully'
        );
      });
    });

    it('updates an existing page label', async () => {
      const user = userEvent.setup();
      (pageLabelService.updateLabel as jest.Mock).mockResolvedValue({
        id: '1',
        name: 'Label 1 Updated',
      });

      await act(async () => {
        render(
          <AdminListView
            {...defaultProps}
            type="pageLabel"
            title="Page Labels"
          />
        );
      });

      await waitFor(() => {
        expect(screen.getByText('Label 1')).toBeInTheDocument();
      });

      await act(async () => {
        const editButtons = screen.getAllByRole('button', { name: 'Edit' });
        await user.click(editButtons[0]);
      });

      // Update the form
      await act(async () => {
        await user.type(screen.getByLabelText(/name/i), ' Updated');
        await user.click(screen.getByRole('button', { name: 'Update' }));
      });

      await waitFor(() => {
        expect(pageLabelService.updateLabel).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith(
          'Page Labels updated successfully'
        );
      });
    });

    it('deletes a page label', async () => {
      const user = userEvent.setup();
      (pageLabelService.deleteLabel as jest.Mock).mockResolvedValue({});

      await act(async () => {
        render(
          <AdminListView
            {...defaultProps}
            type="pageLabel"
            title="Page Labels"
          />
        );
      });

      await waitFor(() => {
        expect(screen.getByText('Label 1')).toBeInTheDocument();
      });

      await act(async () => {
        const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
        await user.click(deleteButtons[0]);
      });

      await act(async () => {
        await user.click(
          screen.getByRole('button', { name: 'Delete Page Labels' })
        );
      });

      await waitFor(() => {
        expect(pageLabelService.deleteLabel).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith(
          'Page Labels deleted successfully'
        );
      });
    });

    it('handles page label operation errors', async () => {
      const user = userEvent.setup();
      (pageLabelService.createLabel as jest.Mock).mockRejectedValue(
        new Error('Failed')
      );

      await act(async () => {
        render(
          <AdminListView
            {...defaultProps}
            type="pageLabel"
            title="Page Labels"
          />
        );
      });

      await act(async () => {
        await user.click(
          screen.getByRole('button', { name: 'Add Page Labels' })
        );
      });

      // Submit the form
      await act(async () => {
        await user.type(screen.getByLabelText(/name/i), 'New Label');
        await user.click(screen.getByRole('button', { name: 'Create' }));
      });

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to add page labels');
      });
    });
  });

  describe('Navigation', () => {
    it('calls onClose when back button is clicked', async () => {
      const user = userEvent.setup();

      await act(async () => {
        render(<AdminListView {...defaultProps} />);
      });

      await act(async () => {
        const backButton = screen.getByRole('button', { name: 'Back' });
        await user.click(backButton);
      });

      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  describe('Different Types Display', () => {
    it('displays dimension type specific fields', async () => {
      await act(async () => {
        render(
          <AdminListView
            {...defaultProps}
            type="dimension"
            title="Dimensions"
          />
        );
      });

      await waitFor(() => {
        const dimensionCell = screen.getByRole('cell', {
          name: /1\. Dimension 1 \(string\)/i,
        });
        expect(dimensionCell).toBeInTheDocument();
        expect(
          screen.getByRole('cell', { name: 'Description 1' })
        ).toBeInTheDocument();
      });
    });

    it('displays pageview specific fields', async () => {
      await act(async () => {
        render(
          <AdminListView {...defaultProps} type="pageview" title="Page Views" />
        );
      });

      await waitFor(() => {
        expect(screen.getByText('Page 1')).toBeInTheDocument();
        expect(screen.getByText('/page1')).toBeInTheDocument();
      });
    });
  });
});
