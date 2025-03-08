import {
  render,
  screen,
  waitFor,
  act,
  within,
  cleanup,
} from '@testing-library/react';
import { adminS3Service } from '../../../services/adminS3Service';
import ModuleScreenshotsPage from '../../../../app/screenshots/modules/[key]/page';
import toast, { Toaster } from 'react-hot-toast';
import userEvent from '@testing-library/user-event';
import { fireEvent } from '@testing-library/react';
import { ScreenshotStatus } from '@/services/adminS3Service';
import React from 'react';
import { waitForElementToBeRemoved } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '../../../__mocks__/server';
import { pageLabelService } from '@/services/pageLabelService';

// Mock pageLabelService
jest.mock('@/services/pageLabelService', () => ({
  pageLabelService: {
    getAllLabels: jest.fn().mockResolvedValue([
      { id: 'label1', name: 'Label 1' },
      { id: 'label2', name: 'Label 2' },
    ]),
    createLabel: jest.fn(),
    updateLabel: jest.fn(),
    deleteLabel: jest.fn(),
  },
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useParams: () => ({ key: 'test-module' }),
}));

// Mock toast
jest.mock('react-hot-toast', () => {
  const actual = jest.requireActual('react-hot-toast');
  return {
    ...actual,
    error: jest.fn((message) => {
      // Create and append error toast element
      const toastContainer = document.getElementById('_rht_toaster');
      if (toastContainer) {
        const toastElement = document.createElement('div');
        toastElement.textContent = message;
        toastElement.setAttribute('role', 'alert');
        toastContainer.appendChild(toastElement);
      }
    }),
    success: jest.fn(),
  };
});

// Wrapper component with Toaster
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <>
    {children}
    <Toaster />
  </>
);

// Mock adminS3Service and ScreenshotStatus
jest.mock('@/services/adminS3Service', () => ({
  adminS3Service: {
    fetchModules: jest.fn(),
    updateScreenshotOrder: jest.fn(),
    deleteScreenshot: jest.fn(),
    updateScreenshotStatus: jest.fn(),
    updateScreenshotName: jest.fn(),
    updateScreenshotLabel: jest.fn(),
  },
  ScreenshotStatus: {
    TODO: 'TODO',
    IN_PROGRESS: 'IN_PROGRESS',
    DONE: 'DONE',
  },
}));

// Cast mock for TypeScript
const mockFetchModules = adminS3Service.fetchModules as jest.Mock;
const mockDeleteScreenshot = adminS3Service.deleteScreenshot as jest.Mock;
const mockUpdateScreenshotLabel =
  adminS3Service.updateScreenshotLabel as jest.Mock;

// Types
interface Screenshot {
  id: string;
  name: string;
  status: string;
}

// Mock Breadcrumb component
jest.mock('../../../../src/components/common/Breadcrumb', () => {
  return {
    __esModule: true,
    default: ({ items }: { items: Array<{ label: string }> }) => (
      <nav className="flex items-center space-x-3 text-sm">
        <a
          href="/screenshots"
          className="text-gray-500 hover:text-gray-700 inline-flex items-center transition-colors"
        >
          <svg
            className="h-5 w-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          Home
        </a>
        <div className="flex items-center space-x-3">
          <span className="text-gray-400">/</span>
          <span className="text-gray-700">{items[0].label}</span>
        </div>
      </nav>
    ),
  };
});

// Mock ScreenshotCard component
jest.mock('../../../../src/components/screenshots/ScreenshotCard', () => {
  const MockScreenshotCard = ({
    screenshot,
    userRole,
    onDelete,
    onStatusChange,
    onNameChange,
    onLabelChange,
    isDeleting,
    availableLabels,
    labelName,
  }: any) => {
    const [currentStatus, setCurrentStatus] = React.useState(
      screenshot.status || ScreenshotStatus.TODO
    );
    const [isEditNameModalOpen, setIsEditNameModalOpen] = React.useState(false);
    const [isEditLabelModalOpen, setIsEditLabelModalOpen] =
      React.useState(false);
    const [newName, setNewName] = React.useState(screenshot.name);
    const [selectedLabelId, setSelectedLabelId] = React.useState(
      screenshot.labelId
    );

    const statusColors: Record<string, string> = {
      TODO: 'bg-orange-500 text-white',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      DONE: 'bg-green-100 text-green-800',
    };

    return (
      <div
        data-testid={`screenshot-card-${screenshot.id}`}
        className="group relative"
      >
        {screenshot.name}
        {labelName && (
          <span
            data-testid={`label-badge-${screenshot.id}`}
            className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
          >
            {labelName}
          </span>
        )}
        {userRole === 'admin' ? (
          <>
            <button
              onClick={() => onDelete(screenshot.id)}
              aria-label={`Delete ${screenshot.name}`}
              data-testid={`delete-button-${screenshot.id}`}
              disabled={isDeleting}
            >
              {isDeleting ? 'Loading...' : 'Delete'}
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                const nextStatus =
                  currentStatus === ScreenshotStatus.TODO
                    ? ScreenshotStatus.IN_PROGRESS
                    : currentStatus === ScreenshotStatus.IN_PROGRESS
                    ? ScreenshotStatus.DONE
                    : ScreenshotStatus.TODO;
                setCurrentStatus(nextStatus);
                onStatusChange(screenshot.id, nextStatus);
              }}
              title="Click to change status"
              data-testid={`status-button-${screenshot.id}`}
              className={`${statusColors[currentStatus]} hover:opacity-80`}
            >
              {currentStatus}
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                setIsEditNameModalOpen(true);
              }}
              className="p-2 bg-blue-600 text-white rounded-full group-hover:opacity-100 transition-opacity duration-200 hover:bg-blue-700"
              title="Edit name"
              data-testid={`edit-button-${screenshot.id}`}
            >
              Edit
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                setIsEditLabelModalOpen(true);
              }}
              className="p-2 bg-purple-600 text-white rounded-full group-hover:opacity-100 transition-opacity duration-200 hover:bg-purple-700"
              title="Edit label"
              data-testid={`edit-label-button-${screenshot.id}`}
            >
              Label
            </button>
          </>
        ) : (
          <span data-testid={`status-text-${screenshot.id}`}>
            {currentStatus}
          </span>
        )}
        {isEditNameModalOpen && (
          <div role="dialog" aria-label="Edit Screenshot Name">
            <h2>Edit Screenshot Name</h2>
            <input
              type="text"
              aria-label="Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <button type="button" onClick={() => setIsEditNameModalOpen(false)}>
              Cancel
            </button>
            <button
              type="submit"
              onClick={() => {
                if (newName.trim() && newName.trim() !== screenshot.name) {
                  onNameChange(screenshot.id, newName.trim());
                  setIsEditNameModalOpen(false);
                }
              }}
              disabled={!newName.trim() || newName.trim() === screenshot.name}
            >
              Save Changes
            </button>
          </div>
        )}
        {isEditLabelModalOpen && (
          <div role="dialog" aria-label="Edit Screenshot Label">
            <h2>Edit Screenshot Label</h2>
            <select
              aria-label="Label"
              value={selectedLabelId || ''}
              onChange={(e) => setSelectedLabelId(e.target.value || null)}
              data-testid={`label-select-${screenshot.id}`}
            >
              <option value="">No Label</option>
              {availableLabels.map((label: any) => (
                <option key={label.id} value={label.id}>
                  {label.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setIsEditLabelModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={() => {
                onLabelChange(screenshot.id, selectedLabelId);
                setIsEditLabelModalOpen(false);
              }}
              data-testid={`save-label-button-${screenshot.id}`}
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    );
  };

  return {
    __esModule: true,
    default: MockScreenshotCard,
  };
});

// Mock ConfirmationModal component
jest.mock('../../../../src/components/shared/ConfirmationModal', () => {
  return {
    __esModule: true,
    default: ({ isOpen, onClose, onConfirm, title, message }: any) =>
      isOpen ? (
        <div role="dialog" aria-label={title}>
          <h2>{title}</h2>
          <p>{message}</p>
          <button onClick={onClose}>Cancel</button>
          <button onClick={onConfirm}>Confirm</button>
        </div>
      ) : null,
  };
});

// Add SearchInput mock
jest.mock('@/components/common/SearchInput', () => ({
  SearchInput: ({ onSearch, placeholder }: any) => (
    <input
      type="text"
      placeholder={placeholder}
      onChange={(e) => onSearch(e.target.value)}
      data-testid="search-input"
    />
  ),
}));

// Add Dropdown mock
jest.mock('@/components/common/Dropdown', () => ({
  Dropdown: ({
    options,
    selectedId,
    onSelect,
    allOptionLabel,
    placeholder,
  }: any) => (
    <div className="dropdown-container" data-testid="label-filter-dropdown">
      <select
        value={selectedId || ''}
        onChange={(e) => onSelect(e.target.value || null)}
        aria-label={placeholder}
        data-testid="label-filter-select"
      >
        <option value="">{allOptionLabel}</option>
        {options.map((option: any) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  ),
}));

// Mock data
const mockModule = {
  key: 'test-module',
  name: 'Test Module',
  screenshots: [
    {
      id: '1',
      name: 'Login Page Screenshot',
      status: 'TODO',
      labelId: 'label1',
    },
    {
      id: '2',
      name: 'User Dashboard View',
      status: 'IN_PROGRESS',
      labelId: 'label2',
    },
    { id: '3', name: 'Settings Panel', status: 'DONE', labelId: null },
    { id: '4', name: 'Login-Form Error', status: 'TODO', labelId: 'label1' },
    {
      id: '5',
      name: 'User Profile Page',
      status: 'IN_PROGRESS',
      labelId: null,
    },
  ],
};

// Mock DndKit
jest.mock('@dnd-kit/core', () => {
  let dragEndHandler: Function | undefined;
  return {
    DndContext: ({ children, onDragEnd }: any) => {
      // Only set dragEndHandler for admin users
      try {
        const mockAuth = JSON.parse(
          window.sessionStorage.getItem('auth') || '{}'
        );
        if (mockAuth.role === 'admin') {
          dragEndHandler = onDragEnd;
          // Expose handler to window for testing
          (window as any).__dragEndHandler = dragEndHandler;
        }
      } catch (error) {
        // If JSON parsing fails, treat as non-admin
        dragEndHandler = undefined;
      }
      return <div data-testid="dnd-context">{children}</div>;
    },
    useSensor: () => null,
    useSensors: () => [],
    PointerSensor: () => null,
    KeyboardSensor: () => null,
    closestCenter: () => null,
  };
});

jest.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: any) => <>{children}</>,
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: () => {},
    transform: null,
    transition: null,
  }),
  arrayMove: (array: any[], from: number, to: number) => {
    const result = [...array];
    const [removed] = result.splice(from, 1);
    result.splice(to, 0, removed);
    return result;
  },
}));

// Add to the mock declarations at the top of the file
const mockUpdateScreenshotStatus = jest.fn();
adminS3Service.updateScreenshotStatus = mockUpdateScreenshotStatus;

// Update render calls to use wrapper
const customRender = (ui: React.ReactElement) => {
  return render(ui, { wrapper: Wrapper });
};

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Clean up after each test
afterEach(() => {
  cleanup();
});

describe('ModuleScreenshotsPage - Initial Loading States', () => {
  beforeEach(() => {
    // Set up mocks for this test suite
    const mockAuth = { role: 'user' };
    window.sessionStorage.getItem = jest
      .fn()
      .mockReturnValue(JSON.stringify(mockAuth));
  });

  it('should display loading indicator while fetching module data', async () => {
    const fetchPromise = new Promise((resolve) => setTimeout(resolve, 100));
    mockFetchModules.mockReturnValue(fetchPromise);

    await act(async () => {
      customRender(<ModuleScreenshotsPage />);
    });

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    await act(async () => {
      await fetchPromise;
    });
  });

  it('should display "Module not found" when module does not exist', async () => {
    mockFetchModules.mockResolvedValue([]);

    await act(async () => {
      customRender(<ModuleScreenshotsPage />);
    });

    await waitFor(() => {
      expect(screen.getByText('Module not found')).toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    // Create a promise that rejects after a delay
    const errorPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Failed to fetch')), 100)
    );
    mockFetchModules.mockReturnValue(errorPromise);

    await act(async () => {
      customRender(<ModuleScreenshotsPage />);
    });

    // First, we should see loading
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Then, after the error occurs, we should see the error state
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to fetch');
    });
  });

  it('should show loading state during initial fetch', async () => {
    // Mock a slow API response
    mockFetchModules.mockImplementation(
      () =>
        new Promise((resolve) => setTimeout(() => resolve([mockModule]), 100))
    );

    await act(async () => {
      customRender(<ModuleScreenshotsPage />);
    });

    // Check initial loading state
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Wait for content to load
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: mockModule.name })
      ).toBeInTheDocument();
    });
  });

  it('should show loading state during screenshot deletion', async () => {
    // Set admin role
    const mockAuth = { role: 'admin' };
    window.sessionStorage.getItem = jest
      .fn()
      .mockReturnValue(JSON.stringify(mockAuth));

    // Mock screenshot deletion with loading state
    mockDeleteScreenshot.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    // Initial render with mock data
    const updatedModule = {
      ...mockModule,
      screenshots: mockModule.screenshots.slice(1),
    };
    mockFetchModules
      .mockResolvedValueOnce([mockModule])
      .mockResolvedValueOnce([updatedModule]);

    await act(async () => {
      customRender(<ModuleScreenshotsPage />);
    });

    // Wait for initial render and find delete button
    const deleteButton = await screen.findByTestId('delete-button-1');
    expect(deleteButton).toBeInTheDocument();

    // Click delete button
    await act(async () => {
      await userEvent.click(deleteButton);
    });

    // Click confirm button
    const confirmButton = screen.getByRole('button', { name: 'Confirm' });
    await act(async () => {
      await userEvent.click(confirmButton);
    });

    // Check for loading state
    expect(screen.getByTestId('delete-button-1')).toHaveTextContent(
      'Loading...'
    );

    // Wait for deletion to complete
    await waitFor(() => {
      expect(screen.queryByTestId('delete-button-1')).not.toBeInTheDocument();
    });
  });
});

describe('ModuleScreenshotsPage - Module Display', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const mockAuth = { role: 'user' };
    window.sessionStorage.getItem = jest
      .fn()
      .mockReturnValue(JSON.stringify(mockAuth));
  });

  it('should display module name correctly in header', async () => {
    mockFetchModules.mockResolvedValue([mockModule]);

    await act(async () => {
      customRender(<ModuleScreenshotsPage />);
    });

    await waitFor(() => {
      const headings = screen.getAllByRole('heading', { level: 1 });
      expect(headings[0]).toHaveTextContent(mockModule.name);
    });
  });

  it('should display module name in breadcrumb navigation', async () => {
    mockFetchModules.mockResolvedValue([mockModule]);

    await act(async () => {
      customRender(<ModuleScreenshotsPage />);
    });

    await waitFor(() => {
      // Look specifically in the nav element
      const nav = screen.getByRole('navigation');
      const breadcrumbText = within(nav).getByText('Test Module');
      expect(breadcrumbText).toBeInTheDocument();
    });
  });

  it('should show "No screenshots" message for empty modules', async () => {
    const emptyModule = { ...mockModule, screenshots: [] };
    mockFetchModules.mockResolvedValue([emptyModule]);

    await act(async () => {
      customRender(<ModuleScreenshotsPage />);
    });

    await waitFor(() => {
      expect(
        screen.getByText('No screenshots uploaded yet for this module.')
      ).toBeInTheDocument();
    });
  });

  it('should render screenshots in grid layout', async () => {
    mockFetchModules.mockResolvedValue([mockModule]);

    await act(async () => {
      customRender(<ModuleScreenshotsPage />);
    });

    await waitFor(() => {
      // Check if all screenshots are rendered
      mockModule.screenshots.forEach((screenshot) => {
        expect(
          screen.getByTestId(`screenshot-card-${screenshot.id}`)
        ).toBeInTheDocument();
      });

      // Find grid container by class combination
      const gridElements = document.getElementsByClassName(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
      );
      expect(gridElements.length).toBeGreaterThan(0);
    });
  });
});

describe('ModuleScreenshotsPage - Admin Features', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set admin role
    const mockAuth = { role: 'admin' };
    window.sessionStorage.getItem = jest
      .fn()
      .mockReturnValue(JSON.stringify(mockAuth));
  });

  it('should show reorder button when module has more than 1 screenshot', async () => {
    mockFetchModules.mockResolvedValue([mockModule]); // mockModule has 3 screenshots

    await act(async () => {
      customRender(<ModuleScreenshotsPage />);
    });

    await waitFor(() => {
      const reorderButton = screen.getByRole('button', {
        name: /reorder screenshots/i,
      });
      expect(reorderButton).toBeInTheDocument();
      expect(reorderButton).toHaveClass('bg-blue-600', 'text-white');
    });
  });

  it('should not show reorder button when module has 1 or fewer screenshots', async () => {
    const singleScreenshotModule = {
      ...mockModule,
      screenshots: [{ id: '1', name: 'Screenshot 1', status: 'TODO' }],
    };
    mockFetchModules.mockResolvedValue([singleScreenshotModule]);

    await act(async () => {
      customRender(<ModuleScreenshotsPage />);
    });

    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: /reorder screenshots/i })
      ).not.toBeInTheDocument();
    });
  });

  it('should toggle drag mode when clicking reorder button', async () => {
    mockFetchModules.mockResolvedValue([mockModule]);
    const user = userEvent.setup();

    await act(async () => {
      customRender(<ModuleScreenshotsPage />);
    });

    // Wait for the button to appear
    const reorderButton = await screen.findByRole('button', {
      name: /reorder screenshots/i,
    });

    // Click the button wrapped in act
    await act(async () => {
      await user.click(reorderButton);
    });

    // Button should change appearance
    expect(reorderButton).toHaveClass('bg-blue-100', 'text-blue-700');
    expect(screen.getByText(/exit reorder mode/i)).toBeInTheDocument();
  });

  it('should update screenshot order after successful drag-and-drop', async () => {
    const mockUpdateOrder = jest.fn().mockResolvedValue(undefined);
    adminS3Service.updateScreenshotOrder = mockUpdateOrder;
    mockFetchModules.mockResolvedValue([mockModule]);

    await act(async () => {
      customRender(<ModuleScreenshotsPage />);
    });

    // Wait for content to be rendered
    await screen.findByRole('heading', { name: mockModule.name });

    // Enter reorder mode
    const reorderButton = screen.getByRole('button', { name: /reorder/i });
    await act(async () => {
      await userEvent.click(reorderButton);
    });

    // Simulate drag and drop
    await act(async () => {
      (window as any).__dragEndHandler({
        active: { id: '1' },
        over: { id: '2' },
      });
      // Wait for state updates to complete
      await Promise.resolve();
    });

    expect(mockUpdateOrder).toHaveBeenCalledWith('test-module', [
      '2',
      '1',
      '3',
      '4',
      '5',
    ]);
    expect(toast.success).toHaveBeenCalledWith(
      'Screenshot order updated successfully'
    );
  });

  it('should revert optimistic updates on failure', async () => {
    // Mock failed update
    const mockUpdateOrder = jest
      .fn()
      .mockRejectedValue(new Error('Failed to update order'));
    adminS3Service.updateScreenshotOrder = mockUpdateOrder;
    mockFetchModules.mockResolvedValue([mockModule]);

    await act(async () => {
      customRender(<ModuleScreenshotsPage />);
    });

    // Wait for content to be rendered
    await screen.findByRole('heading', { name: mockModule.name });

    // Enter reorder mode
    const reorderButton = screen.getByRole('button', { name: /reorder/i });
    await act(async () => {
      await userEvent.click(reorderButton);
    });

    // Simulate drag and drop
    await act(async () => {
      (window as any).__dragEndHandler({
        active: { id: '1' },
        over: { id: '2' },
      });
      // Wait for state updates and error to be thrown
      await Promise.resolve();
    });

    // Wait for error toast
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to update order');
    });

    // Verify screenshots are in original order
    const screenshots = screen.getAllByTestId(/^screenshot-card/);
    const currentOrder = screenshots.map((el) => {
      const id = el.getAttribute('data-testid')?.split('-')[2];
      return mockModule.screenshots.find((s) => s.id === id)?.name;
    });
    expect(currentOrder).toEqual([
      'Login Page Screenshot',
      'User Dashboard View',
      'Settings Panel',
      'Login-Form Error',
      'User Profile Page',
    ]);

    // Should have called fetchModules again to revert
    expect(mockFetchModules).toHaveBeenCalledTimes(2);
  });
});

describe('ModuleScreenshotsPage - Non-Admin Restrictions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set regular user role
    const mockAuth = { role: 'user' };
    window.sessionStorage.getItem = jest
      .fn()
      .mockReturnValue(JSON.stringify(mockAuth));
    mockFetchModules.mockResolvedValue([mockModule]);
  });

  it('should not display reorder button for non-admin users', async () => {
    await act(async () => {
      customRender(<ModuleScreenshotsPage />);
    });

    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: /reorder screenshots/i })
      ).not.toBeInTheDocument();
    });
  });

  it('should not allow drag-and-drop operations for non-admin users', async () => {
    await act(async () => {
      customRender(<ModuleScreenshotsPage />);
    });

    // Wait for initial render
    await waitFor(() => {
      mockModule.screenshots.forEach((screenshot) => {
        expect(
          screen.getByTestId(`screenshot-card-${screenshot.id}`)
        ).toBeInTheDocument();
      });
    });

    // Verify drag mode is not enabled
    expect(screen.queryByText(/exit reorder mode/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/reorder mode enabled/i)).not.toBeInTheDocument();

    // Verify screenshots are not draggable
    const screenshots = screen.getAllByTestId(/^screenshot-card-/);
    screenshots.forEach((screenshot) => {
      expect(screenshot).not.toHaveAttribute('draggable');
      expect(screenshot).not.toHaveAttribute('data-handler-id');
    });
  });

  it('should display screenshots in read-only mode for non-admin users', async () => {
    await act(async () => {
      customRender(<ModuleScreenshotsPage />);
    });

    await waitFor(() => {
      // Verify screenshots are displayed
      mockModule.screenshots.forEach((screenshot) => {
        expect(
          screen.getByTestId(`screenshot-card-${screenshot.id}`)
        ).toBeInTheDocument();
      });

      // Verify no admin controls are present
      expect(
        screen.queryByRole('button', { name: /reorder/i })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /delete/i })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /edit/i })
      ).not.toBeInTheDocument();
    });
  });

  it('should not make any API calls for admin operations when user is non-admin', async () => {
    await act(async () => {
      customRender(<ModuleScreenshotsPage />);
    });

    // Wait for initial load using heading
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: mockModule.name })
      ).toBeInTheDocument();
    });

    // Verify only the initial fetch was called, no admin operations
    expect(mockFetchModules).toHaveBeenCalledTimes(1);
    expect(adminS3Service.updateScreenshotOrder).not.toHaveBeenCalled();
  });

  it('should gracefully handle attempts to access admin features through URL manipulation', async () => {
    // Mock window.location
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      value: new URL(
        'http://localhost:3000/screenshots/modules/test-module?mode=reorder'
      ),
      configurable: true,
    });

    await act(async () => {
      customRender(<ModuleScreenshotsPage />);
    });

    await waitFor(() => {
      // Verify admin features are still not accessible
      expect(
        screen.queryByRole('button', { name: /reorder/i })
      ).not.toBeInTheDocument();
      expect(adminS3Service.updateScreenshotOrder).not.toHaveBeenCalled();
    });

    // Restore window.location
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      configurable: true,
    });
  });
});

describe('ModuleScreenshotsPage - Screenshot Management', () => {
  describe('Deletion', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      // Set admin role
      const mockAuth = { role: 'admin' };
      window.sessionStorage.getItem = jest
        .fn()
        .mockReturnValue(JSON.stringify(mockAuth));
      mockFetchModules.mockResolvedValue([mockModule]);
    });

    it('should show delete button for admin users', async () => {
      await act(async () => {
        customRender(<ModuleScreenshotsPage />);
      });

      await waitFor(() => {
        mockModule.screenshots.forEach((screenshot) => {
          const deleteButton = screen.getByRole('button', {
            name: `Delete ${screenshot.name}`,
          });
          expect(deleteButton).toBeInTheDocument();
        });
      });
    });

    it('should not show delete button for non-admin users', async () => {
      // Set user role to non-admin
      window.sessionStorage.getItem = jest
        .fn()
        .mockReturnValue(JSON.stringify({ role: 'user' }));

      await act(async () => {
        customRender(<ModuleScreenshotsPage />);
      });

      await waitFor(() => {
        mockModule.screenshots.forEach((screenshot) => {
          const deleteButton = screen.queryByRole('button', {
            name: `Delete ${screenshot.name}`,
          });
          expect(deleteButton).not.toBeInTheDocument();
        });
      });
    });

    it('should show confirmation modal with correct screenshot name when delete is clicked', async () => {
      const user = userEvent.setup();
      await act(async () => {
        customRender(<ModuleScreenshotsPage />);
      });

      // Click delete button for first screenshot
      const deleteButton = await screen.findByRole('button', {
        name: `Delete ${mockModule.screenshots[0].name}`,
      });

      await act(async () => {
        await user.click(deleteButton);
      });

      // Verify modal is shown with correct content
      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();
      expect(modal).toHaveTextContent('Delete Screenshot');
      expect(modal).toHaveTextContent(
        'Are you sure you want to delete this screenshot?'
      );
    });

    it('should close modal when canceling deletion', async () => {
      const user = userEvent.setup();
      await act(async () => {
        customRender(<ModuleScreenshotsPage />);
      });

      // Open modal
      const deleteButton = await screen.findByRole('button', {
        name: `Delete ${mockModule.screenshots[0].name}`,
      });

      await act(async () => {
        await user.click(deleteButton);
      });

      // Click cancel
      await act(async () => {
        await user.click(screen.getByRole('button', { name: 'Cancel' }));
      });

      // Verify modal is closed
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should remove screenshot when confirming deletion', async () => {
      mockDeleteScreenshot.mockResolvedValue(undefined);
      const updatedModule = {
        ...mockModule,
        screenshots: mockModule.screenshots.slice(1),
      };
      mockFetchModules
        .mockResolvedValueOnce([mockModule])
        .mockResolvedValueOnce([updatedModule]);

      const user = userEvent.setup();
      await act(async () => {
        customRender(<ModuleScreenshotsPage />);
      });

      // Open modal and confirm deletion
      const deleteButton = await screen.findByRole('button', {
        name: `Delete ${mockModule.screenshots[0].name}`,
      });

      await act(async () => {
        await user.click(deleteButton);
      });

      await act(async () => {
        await user.click(screen.getByRole('button', { name: 'Confirm' }));
      });

      // Verify API call
      expect(mockDeleteScreenshot).toHaveBeenCalledWith(
        mockModule.screenshots[0].id
      );

      // Verify success message
      expect(toast.success).toHaveBeenCalledWith(
        'Screenshot deleted successfully'
      );

      // Verify UI update
      await waitFor(() => {
        expect(
          screen.queryByTestId(
            `screenshot-card-${mockModule.screenshots[0].id}`
          )
        ).not.toBeInTheDocument();
      });
    });

    it('should handle delete API errors gracefully', async () => {
      mockDeleteScreenshot.mockRejectedValue(new Error('Failed to delete'));
      const user = userEvent.setup();

      await act(async () => {
        customRender(<ModuleScreenshotsPage />);
      });

      // Open modal and confirm deletion
      const deleteButton = await screen.findByRole('button', {
        name: `Delete ${mockModule.screenshots[0].name}`,
      });

      await act(async () => {
        await user.click(deleteButton);
      });

      await act(async () => {
        await user.click(screen.getByRole('button', { name: 'Confirm' }));
      });

      // Verify error message
      expect(toast.error).toHaveBeenCalledWith('Failed to delete');

      // Verify screenshot still exists
      expect(
        screen.getByTestId(`screenshot-card-${mockModule.screenshots[0].id}`)
      ).toBeInTheDocument();
    });

    it('should show loading state during deletion', async () => {
      // Mock deleteScreenshot to be slow
      mockDeleteScreenshot.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );
      mockFetchModules.mockResolvedValue([mockModule]);

      await act(async () => {
        customRender(<ModuleScreenshotsPage />);
      });

      // Wait for initial render
      const deleteButton = await screen.findByTestId('delete-button-1');

      // Click delete button
      await act(async () => {
        await userEvent.click(deleteButton);
      });

      // Click confirm button
      const confirmButton = screen.getByRole('button', { name: 'Confirm' });
      await act(async () => {
        await userEvent.click(confirmButton);
      });

      // Check for loading state
      const loadingButton = await screen.findByTestId('delete-button-1');
      expect(loadingButton).toHaveTextContent('Loading...');
    });
  });

  describe('Status Updates', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      // Set admin role
      const mockAuth = { role: 'admin' };
      window.sessionStorage.getItem = jest
        .fn()
        .mockReturnValue(JSON.stringify(mockAuth));
      mockFetchModules.mockResolvedValue([mockModule]);
    });

    it('should update screenshot status', async () => {
      const mockUpdateStatus = jest.fn().mockResolvedValue(undefined);
      adminS3Service.updateScreenshotStatus = mockUpdateStatus;
      const updatedModule = {
        ...mockModule,
        screenshots: mockModule.screenshots.map((s) =>
          s.id === '1' ? { ...s, status: 'IN_PROGRESS' } : s
        ),
      };
      mockFetchModules
        .mockResolvedValueOnce([mockModule])
        .mockResolvedValueOnce([updatedModule]);

      await act(async () => {
        customRender(<ModuleScreenshotsPage />);
      });

      // Find and click status button
      const statusButton = await screen.findByTestId('status-button-1');
      await act(async () => {
        await userEvent.click(statusButton);
      });

      expect(mockUpdateStatus).toHaveBeenCalledWith('1', 'IN_PROGRESS');
      expect(toast.success).toHaveBeenCalledWith('Status updated successfully');
    });

    it('should reflect status changes immediately in UI', async () => {
      const mockUpdateStatus = jest.fn().mockResolvedValue(undefined);
      adminS3Service.updateScreenshotStatus = mockUpdateStatus;
      const updatedModule = {
        ...mockModule,
        screenshots: mockModule.screenshots.map((s) =>
          s.id === '1' ? { ...s, status: 'IN_PROGRESS' } : s
        ),
      };
      mockFetchModules
        .mockResolvedValueOnce([mockModule])
        .mockResolvedValueOnce([updatedModule]);

      await act(async () => {
        customRender(<ModuleScreenshotsPage />);
      });

      // Initial status should be TODO
      const statusButton = await screen.findByTestId('status-button-1');
      expect(statusButton).toHaveTextContent('TODO');

      // Click to change status
      await act(async () => {
        await userEvent.click(statusButton);
      });

      // Wait for status to update
      await waitFor(() => {
        expect(screen.getByTestId('status-button-1')).toHaveTextContent(
          'IN_PROGRESS'
        );
      });
    });

    it('should show success/error toasts for status updates', async () => {
      // Test success case
      const mockUpdateStatus = jest.fn().mockResolvedValue(undefined);
      adminS3Service.updateScreenshotStatus = mockUpdateStatus;

      await act(async () => {
        customRender(<ModuleScreenshotsPage />);
      });

      const statusButton = await screen.findByTestId('status-button-1');
      await act(async () => {
        await userEvent.click(statusButton);
      });

      expect(toast.success).toHaveBeenCalledWith('Status updated successfully');

      // Test error case
      mockUpdateStatus.mockRejectedValueOnce(new Error('Failed to update'));

      await act(async () => {
        await userEvent.click(statusButton);
      });

      expect(toast.error).toHaveBeenCalledWith('Failed to update');
    });

    it('should show status controls for admin users', async () => {
      await act(async () => {
        customRender(<ModuleScreenshotsPage />);
      });

      await waitFor(() => {
        mockModule.screenshots.forEach((screenshot) => {
          const statusButton = screen.getByTestId(
            `status-button-${screenshot.id}`
          );
          expect(statusButton).toBeInTheDocument();
          expect(statusButton).toHaveAttribute(
            'title',
            'Click to change status'
          );
        });
      });
    });

    it('should not show status controls for non-admin users', async () => {
      // Set user role to non-admin
      window.sessionStorage.getItem = jest
        .fn()
        .mockReturnValue(JSON.stringify({ role: 'user' }));

      await act(async () => {
        customRender(<ModuleScreenshotsPage />);
      });

      await waitFor(() => {
        mockModule.screenshots.forEach((screenshot) => {
          // Status should be shown as text, not as a button
          const statusElement = screen.getByTestId(
            `status-text-${screenshot.id}`
          );
          expect(statusElement).toBeInTheDocument();
          expect(statusElement.tagName.toLowerCase()).toBe('span');
        });
      });
    });

    it('should validate status transitions', async () => {
      // Mock the module with initial TODO status
      mockFetchModules.mockResolvedValue([
        {
          ...mockModule,
          screenshots: [
            {
              ...mockModule.screenshots[0],
              status: ScreenshotStatus.TODO,
            },
            ...mockModule.screenshots.slice(1),
          ],
        },
      ]);

      customRender(<ModuleScreenshotsPage />);

      // Get the status button
      const statusButton = await screen.findByTestId('status-button-1');
      expect(statusButton.className).toContain('bg-orange-500');
      expect(statusButton.className).toContain('text-white');

      // Click to update status to IN_PROGRESS
      await act(async () => {
        fireEvent.click(statusButton);
      });

      // Mock the module with IN_PROGRESS status
      mockFetchModules.mockResolvedValue([
        {
          ...mockModule,
          screenshots: [
            {
              ...mockModule.screenshots[0],
              status: ScreenshotStatus.IN_PROGRESS,
            },
            ...mockModule.screenshots.slice(1),
          ],
        },
      ]);

      // Wait for UI to update
      await waitFor(() => {
        const updatedButton = screen.getByTestId('status-button-1');
        expect(updatedButton.className).toContain('bg-blue-100');
        expect(updatedButton.className).toContain('text-blue-800');
      });

      // Click to update status to DONE
      await act(async () => {
        fireEvent.click(statusButton);
      });

      // Mock the module with DONE status
      mockFetchModules.mockResolvedValue([
        {
          ...mockModule,
          screenshots: [
            {
              ...mockModule.screenshots[0],
              status: ScreenshotStatus.DONE,
            },
            ...mockModule.screenshots.slice(1),
          ],
        },
      ]);

      // Wait for UI to update
      await waitFor(() => {
        const updatedButton = screen.getByTestId('status-button-1');
        expect(updatedButton.className).toContain('bg-green-100');
        expect(updatedButton.className).toContain('text-green-800');
      });
    });

    it('should update status immediately in UI', async () => {
      // Mock the module with initial TODO status
      mockFetchModules.mockResolvedValue([
        {
          ...mockModule,
          screenshots: [
            {
              ...mockModule.screenshots[0],
              status: ScreenshotStatus.TODO,
            },
            ...mockModule.screenshots.slice(1),
          ],
        },
      ]);

      // Set up the mock function
      const mockUpdateStatus = jest.fn().mockResolvedValue(undefined);
      adminS3Service.updateScreenshotStatus = mockUpdateStatus;

      customRender(<ModuleScreenshotsPage />);

      // Get the status button
      const statusButton = await screen.findByTestId('status-button-1');
      expect(statusButton.className).toContain('bg-orange-500');
      expect(statusButton.className).toContain('text-white');

      // Mock a slow API response
      mockUpdateStatus.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 500))
      );

      // Click to update status
      await act(async () => {
        fireEvent.click(statusButton);
      });

      // Mock the module with IN_PROGRESS status
      mockFetchModules.mockResolvedValue([
        {
          ...mockModule,
          screenshots: [
            {
              ...mockModule.screenshots[0],
              status: ScreenshotStatus.IN_PROGRESS,
            },
            ...mockModule.screenshots.slice(1),
          ],
        },
      ]);

      // Verify that the UI updates immediately
      await waitFor(() => {
        const updatedButton = screen.getByTestId('status-button-1');
        expect(updatedButton.className).toContain('bg-blue-100');
        expect(updatedButton.className).toContain('text-blue-800');
      });

      // Verify that the API was called with the correct status
      expect(mockUpdateStatus).toHaveBeenCalledWith(
        mockModule.screenshots[0].id,
        ScreenshotStatus.IN_PROGRESS
      );
    });
  });

  describe('Name Updates', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      // Set admin role
      const mockAuth = { role: 'admin' };
      window.sessionStorage.getItem = jest
        .fn()
        .mockReturnValue(JSON.stringify(mockAuth));
      mockFetchModules.mockResolvedValue([mockModule]);
    });

    it('should show edit name button for admin users', async () => {
      await act(async () => {
        customRender(<ModuleScreenshotsPage />);
      });

      await waitFor(() => {
        const editButton = screen.getByTestId('edit-button-1');
        expect(editButton).toBeInTheDocument();
      });
    });

    it('should not show edit name button for non-admin users', async () => {
      window.sessionStorage.getItem = jest
        .fn()
        .mockReturnValue(JSON.stringify({ role: 'user' }));

      await act(async () => {
        customRender(<ModuleScreenshotsPage />);
      });

      await waitFor(() => {
        expect(screen.queryByTestId('edit-button-1')).not.toBeInTheDocument();
      });
    });

    it('should open edit name modal when clicking edit button', async () => {
      await act(async () => {
        customRender(<ModuleScreenshotsPage />);
      });

      const editButton = await screen.findByTestId('edit-button-1');
      await act(async () => {
        await userEvent.click(editButton);
      });

      expect(screen.getByText('Edit Screenshot Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Name')).toHaveValue(
        mockModule.screenshots[0].name
      );
    });

    it('should update screenshot name successfully', async () => {
      const mockUpdateName = jest.fn().mockResolvedValue(undefined);
      adminS3Service.updateScreenshotName = mockUpdateName;
      const updatedModule = {
        ...mockModule,
        screenshots: mockModule.screenshots.map((s) =>
          s.id === '1' ? { ...s, name: 'Updated Name' } : s
        ),
      };
      mockFetchModules
        .mockResolvedValueOnce([mockModule])
        .mockResolvedValueOnce([updatedModule]);

      await act(async () => {
        customRender(<ModuleScreenshotsPage />);
      });

      // Open modal
      const editButton = await screen.findByTestId('edit-button-1');
      await act(async () => {
        await userEvent.click(editButton);
      });

      // Change name
      const input = screen.getByLabelText('Name');
      await act(async () => {
        await userEvent.clear(input);
        await userEvent.type(input, 'Updated Name');
      });

      // Save changes
      const saveButton = screen.getByText('Save Changes');
      await act(async () => {
        await userEvent.click(saveButton);
      });

      expect(mockUpdateName).toHaveBeenCalledWith('1', 'Updated Name');
      expect(toast.success).toHaveBeenCalledWith(
        'Screenshot name updated successfully'
      );

      // Verify UI update
      await waitFor(() => {
        expect(screen.getByText('Updated Name')).toBeInTheDocument();
      });
    });

    it('should handle name update errors gracefully', async () => {
      const mockUpdateName = jest
        .fn()
        .mockRejectedValue(new Error('Failed to update'));
      adminS3Service.updateScreenshotName = mockUpdateName;

      await act(async () => {
        customRender(<ModuleScreenshotsPage />);
      });

      // Open modal
      const editButton = await screen.findByTestId('edit-button-1');
      await act(async () => {
        await userEvent.click(editButton);
      });

      // Change name
      const input = screen.getByLabelText('Name');
      await act(async () => {
        await userEvent.clear(input);
        await userEvent.type(input, 'New Name');
      });

      // Save changes
      const saveButton = screen.getByText('Save Changes');
      await act(async () => {
        await userEvent.click(saveButton);
      });

      expect(toast.error).toHaveBeenCalledWith('Failed to update');
      expect(
        screen.getByText(mockModule.screenshots[0].name)
      ).toBeInTheDocument();
    });

    it('should disable save button when name is unchanged', async () => {
      await act(async () => {
        customRender(<ModuleScreenshotsPage />);
      });

      // Open modal
      const editButton = await screen.findByTestId('edit-button-1');
      await act(async () => {
        await userEvent.click(editButton);
      });

      const saveButton = screen.getByText('Save Changes');
      expect(saveButton).toBeDisabled();

      // Type the same name
      const input = screen.getByLabelText('Name');
      await act(async () => {
        await userEvent.clear(input);
        await userEvent.type(input, mockModule.screenshots[0].name);
      });

      expect(saveButton).toBeDisabled();
    });

    it('should disable save button when name is empty', async () => {
      await act(async () => {
        customRender(<ModuleScreenshotsPage />);
      });

      // Open modal
      const editButton = await screen.findByTestId('edit-button-1');
      await act(async () => {
        await userEvent.click(editButton);
      });

      // Clear input
      const input = screen.getByLabelText('Name');
      await act(async () => {
        await userEvent.clear(input);
      });

      const saveButton = screen.getByText('Save Changes');
      expect(saveButton).toBeDisabled();
    });

    it('should close modal when clicking cancel', async () => {
      await act(async () => {
        customRender(<ModuleScreenshotsPage />);
      });

      // Open modal
      const editButton = await screen.findByTestId('edit-button-1');
      await act(async () => {
        await userEvent.click(editButton);
      });

      // Click cancel
      const cancelButton = screen.getByText('Cancel');
      await act(async () => {
        await userEvent.click(cancelButton);
      });

      expect(
        screen.queryByText('Edit Screenshot Name')
      ).not.toBeInTheDocument();
    });
  });
});

describe('ModuleScreenshotsPage - Authorization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchModules.mockResolvedValue([mockModule]);
  });

  it('should fetch user role from sessionStorage on mount', async () => {
    const mockAuth = { role: 'admin' };
    window.sessionStorage.getItem = jest
      .fn()
      .mockReturnValue(JSON.stringify(mockAuth));

    await act(async () => {
      customRender(<ModuleScreenshotsPage />);
    });

    expect(window.sessionStorage.getItem).toHaveBeenCalledWith('auth');
  });

  it('should hide admin features for non-admin users', async () => {
    const mockAuth = { role: 'user' };
    window.sessionStorage.getItem = jest
      .fn()
      .mockReturnValue(JSON.stringify(mockAuth));

    await act(async () => {
      customRender(<ModuleScreenshotsPage />);
    });

    await waitFor(() => {
      // Check reorder button is hidden
      expect(
        screen.queryByRole('button', { name: /reorder screenshots/i })
      ).not.toBeInTheDocument();

      // Check edit buttons are hidden
      mockModule.screenshots.forEach((screenshot) => {
        expect(
          screen.queryByTestId(`edit-button-${screenshot.id}`)
        ).not.toBeInTheDocument();
        expect(
          screen.queryByTestId(`delete-button-${screenshot.id}`)
        ).not.toBeInTheDocument();
        // Status should be text, not button
        expect(
          screen.getByTestId(`status-text-${screenshot.id}`)
        ).toBeInTheDocument();
        expect(
          screen.queryByTestId(`status-button-${screenshot.id}`)
        ).not.toBeInTheDocument();
      });
    });
  });

  it('should show admin features for admin users', async () => {
    const mockAuth = { role: 'admin' };
    window.sessionStorage.getItem = jest
      .fn()
      .mockReturnValue(JSON.stringify(mockAuth));

    await act(async () => {
      customRender(<ModuleScreenshotsPage />);
    });

    await waitFor(() => {
      // Check reorder button is visible (when more than 1 screenshot)
      expect(
        screen.getByRole('button', { name: /reorder screenshots/i })
      ).toBeInTheDocument();

      // Check admin controls are visible for each screenshot
      mockModule.screenshots.forEach((screenshot) => {
        expect(
          screen.getByTestId(`edit-button-${screenshot.id}`)
        ).toBeInTheDocument();
        expect(
          screen.getByTestId(`delete-button-${screenshot.id}`)
        ).toBeInTheDocument();
        expect(
          screen.getByTestId(`status-button-${screenshot.id}`)
        ).toBeInTheDocument();
      });
    });
  });

  it('should handle missing or invalid auth data gracefully', async () => {
    // Test with null auth data
    window.sessionStorage.getItem = jest.fn().mockReturnValue(null);

    await act(async () => {
      customRender(<ModuleScreenshotsPage />);
    });

    await waitFor(() => {
      // Should default to non-admin view
      expect(
        screen.queryByRole('button', { name: /reorder screenshots/i })
      ).not.toBeInTheDocument();
    });

    // Test with invalid JSON
    window.sessionStorage.getItem = jest.fn().mockReturnValue('invalid-json');

    // Mock console.error to prevent error output in tests
    const originalError = console.error;
    console.error = jest.fn();

    await act(async () => {
      customRender(<ModuleScreenshotsPage />);
    });

    await waitFor(() => {
      // Should default to non-admin view
      expect(
        screen.queryByRole('button', { name: /reorder screenshots/i })
      ).not.toBeInTheDocument();
    });

    // Restore console.error
    console.error = originalError;
  });
});

describe('ModuleScreenshotsPage - Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const mockAuth = { role: 'admin' };
    window.sessionStorage.getItem = jest
      .fn()
      .mockReturnValue(JSON.stringify(mockAuth));
  });

  it('should show error toast when module fetch fails', async () => {
    mockFetchModules.mockRejectedValue(new Error('Failed to fetch module'));

    await act(async () => {
      customRender(<ModuleScreenshotsPage />);
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to fetch module');
    });
  });

  it('should show error toast when screenshot operations fail', async () => {
    // Initial successful module fetch
    mockFetchModules.mockResolvedValueOnce([mockModule]);

    // Mock failed operations
    const mockUpdateStatus = jest
      .fn()
      .mockRejectedValue(new Error('Failed to update status'));
    const mockUpdateName = jest
      .fn()
      .mockRejectedValue(new Error('Failed to update name'));
    adminS3Service.updateScreenshotStatus = mockUpdateStatus;
    adminS3Service.updateScreenshotName = mockUpdateName;

    await act(async () => {
      customRender(<ModuleScreenshotsPage />);
    });

    // Test status update failure
    const statusButton = await screen.findByTestId('status-button-1');
    await act(async () => {
      await userEvent.click(statusButton);
    });
    expect(toast.error).toHaveBeenCalledWith('Failed to update status');

    // Test name update failure
    const editButton = await screen.findByTestId('edit-button-1');
    await act(async () => {
      await userEvent.click(editButton);
    });
    const input = screen.getByLabelText('Name');
    await act(async () => {
      await userEvent.clear(input);
      await userEvent.type(input, 'New Name');
    });
    const saveButton = screen.getByText('Save Changes');
    await act(async () => {
      await userEvent.click(saveButton);
    });
    expect(toast.error).toHaveBeenCalledWith('Failed to update name');
  });

  it('should handle network errors gracefully', async () => {
    // Mock network error
    mockFetchModules.mockRejectedValueOnce(new Error('Network error'));

    await act(async () => {
      customRender(<ModuleScreenshotsPage />);
    });

    // Should show error toast
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Network error');
    });

    // Should not show loading state anymore
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();

    // Mock successful retry
    mockFetchModules.mockResolvedValueOnce([mockModule]);

    // Component should recover and show content after successful fetch
    await act(async () => {
      customRender(<ModuleScreenshotsPage />);
    });

    await waitFor(() => {
      const headings = screen.getAllByRole('heading', { level: 1 });
      expect(headings[0]).toHaveTextContent(mockModule.name);
    });
  });

  it('should revert optimistic updates on failure', async () => {
    // Mock failed update
    const mockUpdateOrder = jest
      .fn()
      .mockRejectedValue(new Error('Failed to update order'));
    adminS3Service.updateScreenshotOrder = mockUpdateOrder;
    mockFetchModules.mockResolvedValue([mockModule]);

    await act(async () => {
      customRender(<ModuleScreenshotsPage />);
    });

    // Wait for content to be rendered
    await screen.findByRole('heading', { name: mockModule.name });

    // Enter reorder mode
    const reorderButton = screen.getByRole('button', { name: /reorder/i });
    await act(async () => {
      await userEvent.click(reorderButton);
    });

    // Simulate drag and drop
    await act(async () => {
      (window as any).__dragEndHandler({
        active: { id: '1' },
        over: { id: '2' },
      });
      // Wait for state updates and error to be thrown
      await Promise.resolve();
    });

    // Wait for error toast
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to update order');
    });

    // Verify screenshots are in original order
    const screenshots = screen.getAllByTestId(/^screenshot-card/);
    const currentOrder = screenshots.map((el) => {
      const id = el.getAttribute('data-testid')?.split('-')[2];
      return mockModule.screenshots.find((s) => s.id === id)?.name;
    });
    expect(currentOrder).toEqual([
      'Login Page Screenshot',
      'User Dashboard View',
      'Settings Panel',
      'Login-Form Error',
      'User Profile Page',
    ]);

    // Should have called fetchModules again to revert
    expect(mockFetchModules).toHaveBeenCalledTimes(2);
  });
});

describe('ModuleScreenshotsPage - UI Elements', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const mockAuth = { role: 'admin' };
    window.sessionStorage.getItem = jest
      .fn()
      .mockReturnValue(JSON.stringify(mockAuth));
    mockFetchModules.mockResolvedValue([mockModule]);
  });

  it('should render breadcrumb with correct module name', async () => {
    await act(async () => {
      customRender(<ModuleScreenshotsPage />);
    });

    await waitFor(() => {
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
      expect(nav).toHaveTextContent('Home');
      expect(nav).toHaveTextContent(mockModule.name);
    });
  });

  it('should render screenshots in responsive grid layout', async () => {
    await act(async () => {
      customRender(<ModuleScreenshotsPage />);
    });

    await waitFor(() => {
      const grid = document.querySelector('.grid');
      expect(grid).toHaveClass(
        'grid',
        'grid-cols-1',
        'sm:grid-cols-2',
        'lg:grid-cols-3',
        'gap-6'
      );

      // Check if all screenshots are rendered in grid
      mockModule.screenshots.forEach((screenshot) => {
        const card = screen.getByTestId(`screenshot-card-${screenshot.id}`);
        expect(card).toBeInTheDocument();
        expect(card.parentElement).toBe(grid);
      });
    });
  });

  it('should show/hide reorder button based on screenshot count', async () => {
    // Test with multiple screenshots
    mockFetchModules.mockResolvedValueOnce([mockModule]);
    await act(async () => {
      customRender(<ModuleScreenshotsPage />);
    });

    // Wait for initial render with multiple screenshots
    await waitFor(() => {
      const reorderButton = screen.getByRole('button', { name: /reorder/i });
      expect(reorderButton).toBeInTheDocument();
    });

    // Clean up and remount
    cleanup();

    // Test with single screenshot
    const singleScreenshotModule = {
      ...mockModule,
      screenshots: [mockModule.screenshots[0]],
    };
    mockFetchModules.mockResolvedValueOnce([singleScreenshotModule]);

    // Re-render with single screenshot
    await act(async () => {
      customRender(<ModuleScreenshotsPage />);
    });

    // Wait for content to load and verify no reorder button
    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: /reorder/i })
      ).not.toBeInTheDocument();
    });

    // Clean up and remount
    cleanup();

    // Test with no screenshots
    const emptyModule = {
      ...mockModule,
      screenshots: [],
    };
    mockFetchModules.mockResolvedValueOnce([emptyModule]);

    // Re-render with no screenshots
    await act(async () => {
      customRender(<ModuleScreenshotsPage />);
    });

    // Wait for content to load and verify no reorder button
    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: /reorder/i })
      ).not.toBeInTheDocument();
    });
  });

  it('should apply correct styles to status indicators', async () => {
    await act(async () => {
      customRender(<ModuleScreenshotsPage />);
    });

    await waitFor(() => {
      // Check TODO status
      const todoStatuses = screen.getAllByText('TODO');
      todoStatuses.forEach((status) => {
        expect(status).toHaveClass('bg-orange-500', 'text-white');
      });

      // Check IN_PROGRESS status
      const inProgressStatuses = screen.getAllByText('IN_PROGRESS');
      inProgressStatuses.forEach((status) => {
        expect(status).toHaveClass('bg-blue-100', 'text-blue-800');
      });

      // Check DONE status
      const doneStatus = screen.getByText('DONE');
      expect(doneStatus).toHaveClass('bg-green-100', 'text-green-800');
    });
  });
});

describe('ModuleScreenshotsPage', () => {
  describe('Search Functionality', () => {
    beforeEach(async () => {
      jest.useFakeTimers();
      mockFetchModules.mockResolvedValue([mockModule]);
      render(<ModuleScreenshotsPage />, { wrapper: Wrapper });
      await waitForElementToBeRemoved(() => screen.queryByTestId('loading'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('renders search input with correct placeholder', () => {
      const searchInput = screen.getByTestId('search-input');
      expect(searchInput).toHaveAttribute(
        'placeholder',
        'Search screenshots...'
      );
    });

    it('filters screenshots based on search term', async () => {
      const searchInput = screen.getByTestId('search-input');

      await act(async () => {
        fireEvent.change(searchInput, { target: { value: 'login' } });
        jest.advanceTimersByTime(200);
      });

      // Should show only login-related screenshots
      expect(screen.getByTestId('screenshot-card-1')).toBeInTheDocument(); // Login Page Screenshot
      expect(screen.getByTestId('screenshot-card-4')).toBeInTheDocument(); // Login-Form Error
      expect(screen.queryByTestId('screenshot-card-2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('screenshot-card-3')).not.toBeInTheDocument();
      expect(screen.queryByTestId('screenshot-card-5')).not.toBeInTheDocument();
    });

    it('handles case-insensitive search', async () => {
      const searchInput = screen.getByTestId('search-input');

      await act(async () => {
        fireEvent.change(searchInput, { target: { value: 'USER' } });
        jest.advanceTimersByTime(200);
      });

      // Should show user-related screenshots regardless of case
      expect(screen.getByTestId('screenshot-card-2')).toBeInTheDocument(); // User Dashboard View
      expect(screen.getByTestId('screenshot-card-5')).toBeInTheDocument(); // User Profile Page
      expect(screen.queryByTestId('screenshot-card-1')).not.toBeInTheDocument();
    });

    it('handles multi-word search terms', async () => {
      const searchInput = screen.getByTestId('search-input');

      await act(async () => {
        fireEvent.change(searchInput, { target: { value: 'login form' } });
        jest.advanceTimersByTime(200);
      });

      // Should only show screenshots containing both words
      expect(screen.getByTestId('screenshot-card-4')).toBeInTheDocument(); // Login-Form Error
      expect(screen.queryByTestId('screenshot-card-1')).not.toBeInTheDocument();
    });

    it('handles hyphenated search terms', async () => {
      const searchInput = screen.getByTestId('search-input');

      await act(async () => {
        fireEvent.change(searchInput, { target: { value: 'login-form' } });
        jest.advanceTimersByTime(200);
      });

      // Should match hyphenated terms
      expect(screen.getByTestId('screenshot-card-4')).toBeInTheDocument(); // Login-Form Error
    });

    it('shows all screenshots when search is cleared', async () => {
      const searchInput = screen.getByTestId('search-input');

      // First filter
      await act(async () => {
        fireEvent.change(searchInput, { target: { value: 'login' } });
        jest.advanceTimersByTime(200);
      });

      // Then clear
      await act(async () => {
        fireEvent.change(searchInput, { target: { value: '' } });
        jest.advanceTimersByTime(200);
      });

      // Should show all screenshots again
      mockModule.screenshots.forEach((screenshot) => {
        expect(
          screen.getByTestId(`screenshot-card-${screenshot.id}`)
        ).toBeInTheDocument();
      });
    });

    it('shows no results when no matches found', async () => {
      const searchInput = screen.getByTestId('search-input');

      await act(async () => {
        fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
        jest.advanceTimersByTime(200);
      });

      mockModule.screenshots.forEach((screenshot) => {
        expect(
          screen.queryByTestId(`screenshot-card-${screenshot.id}`)
        ).not.toBeInTheDocument();
      });
    });

    it('passes search term to ScreenshotCard for highlighting', async () => {
      const searchInput = screen.getByTestId('search-input');

      await act(async () => {
        fireEvent.change(searchInput, { target: { value: 'login' } });
        jest.advanceTimersByTime(200);
      });

      const card = screen.getByTestId('screenshot-card-1');
      expect(card).toHaveTextContent('Login Page Screenshot');
      // The actual highlighting is tested in ScreenshotCard.test.tsx
    });
  });
});

describe('ModuleScreenshotsPage - Label Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set admin role
    const mockAuth = { role: 'admin' };
    window.sessionStorage.getItem = jest
      .fn()
      .mockReturnValue(JSON.stringify(mockAuth));
    mockFetchModules.mockResolvedValue([mockModule]);

    // Reset label service mock for each test
    (pageLabelService.getAllLabels as jest.Mock).mockResolvedValue([
      { id: 'label1', name: 'Label 1' },
      { id: 'label2', name: 'Label 2' },
    ]);
  });

  it('should fetch labels on mount', async () => {
    const mockGetAllLabels = jest.fn().mockResolvedValue([
      { id: 'label1', name: 'Label 1' },
      { id: 'label2', name: 'Label 2' },
    ]);

    // Override the mock implementation for this test
    (pageLabelService.getAllLabels as jest.Mock) = mockGetAllLabels;

    await act(async () => {
      customRender(<ModuleScreenshotsPage />);
    });

    // Use a more robust waitFor with timeout
    await waitFor(
      () => {
        expect(mockGetAllLabels).toHaveBeenCalled();
      },
      { timeout: 3000 }
    );

    // Check if label filter dropdown is rendered
    await waitFor(
      () => {
        const labelDropdown = screen.getByTestId('label-filter-dropdown');
        expect(labelDropdown).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('should display label badges on screenshots', async () => {
    await act(async () => {
      customRender(<ModuleScreenshotsPage />);
    });

    // Use more robust waitFor with timeout
    await waitFor(
      () => {
        // Check if label badges are displayed for screenshots with labels
        const labelBadge1 = screen.getByTestId('label-badge-1');
        expect(labelBadge1).toBeInTheDocument();
        expect(labelBadge1).toHaveTextContent('Label 1');

        const labelBadge2 = screen.getByTestId('label-badge-2');
        expect(labelBadge2).toBeInTheDocument();
        expect(labelBadge2).toHaveTextContent('Label 2');

        // Screenshots without labels should not have badges
        expect(screen.queryByTestId('label-badge-3')).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('should filter screenshots by label', async () => {
    await act(async () => {
      customRender(<ModuleScreenshotsPage />);
    });

    // Wait for initial render with timeout
    await waitFor(
      () => {
        mockModule.screenshots.forEach((screenshot) => {
          expect(
            screen.getByTestId(`screenshot-card-${screenshot.id}`)
          ).toBeInTheDocument();
        });
      },
      { timeout: 3000 }
    );

    // Select a label filter
    const labelFilterSelect = await screen.findByTestId('label-filter-select');

    await act(async () => {
      await userEvent.selectOptions(labelFilterSelect, 'label1');
    });

    // Only screenshots with label1 should be visible - use more robust waitFor
    await waitFor(
      () => {
        // These should be visible (have label1)
        expect(screen.getByTestId('screenshot-card-1')).toBeInTheDocument();
        expect(screen.getByTestId('screenshot-card-4')).toBeInTheDocument();

        // These should be hidden (don't have label1)
        expect(
          screen.queryByTestId('screenshot-card-2')
        ).not.toBeInTheDocument();
        expect(
          screen.queryByTestId('screenshot-card-3')
        ).not.toBeInTheDocument();
        expect(
          screen.queryByTestId('screenshot-card-5')
        ).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Clear the filter
    await act(async () => {
      await userEvent.selectOptions(labelFilterSelect, '');
    });

    // All screenshots should be visible again - use more robust waitFor
    await waitFor(
      () => {
        mockModule.screenshots.forEach((screenshot) => {
          expect(
            screen.getByTestId(`screenshot-card-${screenshot.id}`)
          ).toBeInTheDocument();
        });
      },
      { timeout: 3000 }
    );
  });

  it('should update screenshot label', async () => {
    mockUpdateScreenshotLabel.mockResolvedValue(undefined);
    const updatedModule = {
      ...mockModule,
      screenshots: mockModule.screenshots.map((s) =>
        s.id === '3' ? { ...s, labelId: 'label1' } : s
      ),
    };
    mockFetchModules
      .mockResolvedValueOnce([mockModule])
      .mockResolvedValueOnce([updatedModule]);

    await act(async () => {
      customRender(<ModuleScreenshotsPage />);
    });

    // Open label edit modal - use findByTestId with timeout
    const editLabelButton = await screen.findByTestId(
      'edit-label-button-3',
      {},
      { timeout: 3000 }
    );
    await act(async () => {
      await userEvent.click(editLabelButton);
    });

    // Select a label - use findByTestId with timeout
    const labelSelect = await screen.findByTestId(
      'label-select-3',
      {},
      { timeout: 3000 }
    );
    await act(async () => {
      await userEvent.selectOptions(labelSelect, 'label1');
    });

    // Save changes - use findByTestId with timeout
    const saveButton = await screen.findByTestId(
      'save-label-button-3',
      {},
      { timeout: 3000 }
    );
    await act(async () => {
      await userEvent.click(saveButton);
    });

    // Verify API call
    await waitFor(
      () => {
        expect(mockUpdateScreenshotLabel).toHaveBeenCalledWith('3', 'label1');
        expect(toast.success).toHaveBeenCalledWith(
          'Screenshot label updated successfully'
        );
      },
      { timeout: 3000 }
    );

    // Verify UI update
    await waitFor(
      () => {
        const labelBadge = screen.getByTestId('label-badge-3');
        expect(labelBadge).toBeInTheDocument();
        expect(labelBadge).toHaveTextContent('Label 1');
      },
      { timeout: 3000 }
    );
  });

  it('should handle label update errors gracefully', async () => {
    mockUpdateScreenshotLabel.mockRejectedValue(
      new Error('Failed to update label')
    );

    await act(async () => {
      customRender(<ModuleScreenshotsPage />);
    });

    // Open label edit modal - use findByTestId with timeout
    const editLabelButton = await screen.findByTestId(
      'edit-label-button-3',
      {},
      { timeout: 3000 }
    );
    await act(async () => {
      await userEvent.click(editLabelButton);
    });

    // Select a label - use findByTestId with timeout
    const labelSelect = await screen.findByTestId(
      'label-select-3',
      {},
      { timeout: 3000 }
    );
    await act(async () => {
      await userEvent.selectOptions(labelSelect, 'label1');
    });

    // Save changes - use findByTestId with timeout
    const saveButton = await screen.findByTestId(
      'save-label-button-3',
      {},
      { timeout: 3000 }
    );
    await act(async () => {
      await userEvent.click(saveButton);
    });

    // Verify error message
    await waitFor(
      () => {
        expect(toast.error).toHaveBeenCalledWith('Failed to update label');
      },
      { timeout: 3000 }
    );
  });

  it('should handle error when fetching labels', async () => {
    // Mock the getAllLabels function to reject
    const mockGetAllLabels = jest
      .fn()
      .mockRejectedValue(new Error('Failed to fetch labels'));
    (pageLabelService.getAllLabels as jest.Mock) = mockGetAllLabels;

    await act(async () => {
      customRender(<ModuleScreenshotsPage />);
    });

    await waitFor(
      () => {
        expect(toast.error).toHaveBeenCalledWith('Failed to fetch labels');
      },
      { timeout: 3000 }
    );

    // The page should still render without labels
    await waitFor(
      () => {
        expect(
          screen.getByRole('heading', { name: mockModule.name })
        ).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('should not show label filter when no labels are available', async () => {
    // Mock empty labels array
    const mockGetAllLabels = jest.fn().mockResolvedValue([]);
    (pageLabelService.getAllLabels as jest.Mock) = mockGetAllLabels;

    await act(async () => {
      customRender(<ModuleScreenshotsPage />);
    });

    await waitFor(
      () => {
        expect(mockGetAllLabels).toHaveBeenCalled();
      },
      { timeout: 3000 }
    );

    // Label filter should not be rendered
    await waitFor(
      () => {
        expect(
          screen.queryByTestId('label-filter-dropdown')
        ).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });
});
