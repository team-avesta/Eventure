import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ClientLayout from '@/components/layouts/ClientLayout';
import { usePathname } from 'next/navigation';
import { adminS3Service } from '@/services/adminS3Service';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

// Mock adminS3Service
jest.mock('@/services/adminS3Service', () => ({
  adminS3Service: {
    fetchModules: jest.fn(),
    fetchModuleEventCounts: jest.fn(),
  },
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  Toaster: () => <div data-testid="toast-container" role="status" />,
}));

// Mock Navigation component
jest.mock('@/components/navigation/Navigation', () => ({
  __esModule: true,
  default: ({ onShowAnalytics }: { onShowAnalytics: () => void }) => (
    <nav data-testid="navigation">
      <button onClick={onShowAnalytics}>View Analytics</button>
    </nav>
  ),
}));

// Mock AnalyticsModal component
jest.mock('@/components/screenshots/AnalyticsModal', () => ({
  AnalyticsModal: ({
    isOpen,
    onClose,
    modules,
  }: {
    isOpen: boolean;
    onClose: () => void;
    modules: any[];
  }) =>
    isOpen ? (
      <div data-testid="analytics-modal">
        <button onClick={onClose}>Close</button>
        <div>Modules: {modules.length}</div>
      </div>
    ) : null,
}));

describe('ClientLayout', () => {
  const mockModules = [
    { id: 1, name: 'Module 1' },
    { id: 2, name: 'Module 2' },
  ];

  const mockModulesWithEvents = [
    { id: 1, name: 'Module 1', events: 5 },
    { id: 2, name: 'Module 2', events: 3 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children without navigation on non-matching paths', () => {
    (usePathname as jest.Mock).mockReturnValue('/some-other-path');

    render(
      <ClientLayout>
        <div>Test Content</div>
      </ClientLayout>
    );

    expect(screen.queryByTestId('navigation')).not.toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders navigation on /screenshots path', () => {
    (usePathname as jest.Mock).mockReturnValue('/screenshots');

    render(
      <ClientLayout>
        <div>Test Content</div>
      </ClientLayout>
    );

    expect(screen.getByTestId('navigation')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders navigation on /admin path', () => {
    (usePathname as jest.Mock).mockReturnValue('/admin');

    render(
      <ClientLayout>
        <div>Test Content</div>
      </ClientLayout>
    );

    expect(screen.getByTestId('navigation')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('handles analytics modal flow', async () => {
    (usePathname as jest.Mock).mockReturnValue('/screenshots');
    (adminS3Service.fetchModules as jest.Mock).mockResolvedValue(mockModules);
    (adminS3Service.fetchModuleEventCounts as jest.Mock).mockResolvedValue(
      mockModulesWithEvents
    );

    render(
      <ClientLayout>
        <div>Test Content</div>
      </ClientLayout>
    );

    // Initially, analytics modal should be closed
    expect(screen.queryByTestId('analytics-modal')).not.toBeInTheDocument();

    // Click the analytics button
    fireEvent.click(screen.getByText('View Analytics'));

    // Wait for data fetching and modal to open
    await waitFor(() => {
      expect(screen.getByTestId('analytics-modal')).toBeInTheDocument();
    });

    // Verify service calls
    expect(adminS3Service.fetchModules).toHaveBeenCalledTimes(1);
    expect(adminS3Service.fetchModuleEventCounts).toHaveBeenCalledWith(
      mockModules
    );

    // Close the modal
    fireEvent.click(screen.getByText('Close'));
    expect(screen.queryByTestId('analytics-modal')).not.toBeInTheDocument();
  });

  it('handles analytics data fetch error', async () => {
    (usePathname as jest.Mock).mockReturnValue('/screenshots');
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    (adminS3Service.fetchModules as jest.Mock).mockRejectedValue(
      new Error('Failed to fetch')
    );

    render(
      <ClientLayout>
        <div>Test Content</div>
      </ClientLayout>
    );

    // Click the analytics button
    fireEvent.click(screen.getByText('View Analytics'));

    // Wait for error to be logged
    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith(
        'Failed to fetch modules for analytics'
      );
    });

    // Modal should not be shown
    expect(screen.queryByTestId('analytics-modal')).not.toBeInTheDocument();

    // Cleanup
    consoleError.mockRestore();
  });

  it('renders toast container', () => {
    render(
      <ClientLayout>
        <div>Test Content</div>
      </ClientLayout>
    );

    expect(screen.getByTestId('toast-container')).toBeInTheDocument();
  });
});
