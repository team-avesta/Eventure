import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ScreenshotsPage from '../../../../app/screenshots/page';
import { adminS3Service } from '@/services/adminS3Service';
import { useAuth } from '@/hooks/useAuth';
import { EventType } from '@/services/adminS3Service';
import toast from 'react-hot-toast';

// Mock dependencies
jest.mock('@/services/adminS3Service', () => ({
  adminS3Service: {
    fetchModules: jest.fn(),
    fetchModuleEventCounts: jest.fn(),
  },
  EventType: {
    PageView: 'PageView',
    TrackEventWithPageView: 'TrackEventWithPageView',
    TrackEvent: 'TrackEvent',
    Outlink: 'Outlink',
    BackendEvent: 'BackendEvent',
  },
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('react-hot-toast', () => ({
  error: jest.fn(),
}));

// Mock ScreenshotUpload component
jest.mock('@/components/screenshots/ScreenshotUpload', () => ({
  __esModule: true,
  default: ({ onSuccess }: { onSuccess: () => void }) => (
    <div data-testid="screenshot-upload">
      <button onClick={onSuccess}>Upload Screenshot</button>
    </div>
  ),
}));

describe('Screenshots Page Integration', () => {
  const user = userEvent.setup();

  const mockModules = [
    {
      id: '1',
      name: 'Test Module 1',
      key: 'test-1',
      screenshots: [
        {
          id: 's1',
          events: [
            { eventType: EventType.PageView },
            { eventType: EventType.TrackEvent },
            { eventType: EventType.BackendEvent },
          ],
        },
      ],
    },
    {
      id: '2',
      name: 'Test Module 2',
      key: 'test-2',
      screenshots: [
        {
          id: 's2',
          events: [
            { eventType: EventType.TrackEventWithPageView },
            { eventType: EventType.Outlink },
          ],
        },
      ],
    },
  ];

  beforeEach(async () => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      isAdmin: false,
      isLoading: false,
    });
    (adminS3Service.fetchModules as jest.Mock).mockResolvedValue(mockModules);
    (adminS3Service.fetchModuleEventCounts as jest.Mock).mockResolvedValue(
      mockModules
    );
  });

  it('renders loading state initially', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAdmin: false,
      isLoading: true,
    });

    await act(async () => {
      render(<ScreenshotsPage />);
      // Wait for any state updates
      await Promise.resolve();
    });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('fetches and displays modules for regular users', async () => {
    let renderResult: any;
    await act(async () => {
      renderResult = render(<ScreenshotsPage />);
      // Wait for the fetch promises to resolve
      await Promise.resolve();
    });

    // Wait for modules to be displayed
    await waitFor(() => {
      expect(screen.getByTitle('Test Module 1')).toBeInTheDocument();
      expect(screen.getByTitle('Test Module 2')).toBeInTheDocument();
    });

    // Screenshot upload should not be visible for regular users
    expect(screen.queryByTestId('screenshot-upload')).not.toBeInTheDocument();

    // Verify API calls
    expect(adminS3Service.fetchModules).toHaveBeenCalled();
    expect(adminS3Service.fetchModuleEventCounts).toHaveBeenCalled();

    // Cleanup
    renderResult.unmount();
  });

  it('shows screenshot upload for admin users', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAdmin: true,
      isLoading: false,
    });

    await act(async () => {
      render(<ScreenshotsPage />);
      // Wait for any state updates
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screen.getByTestId('screenshot-upload')).toBeInTheDocument();
    });
  });

  it('displays correct event counts for each module', async () => {
    await act(async () => {
      render(<ScreenshotsPage />);
      // Wait for the fetch promises to resolve
      await Promise.resolve();
    });

    await waitFor(() => {
      // Module 1 counts
      expect(screen.getByText('1 pageviews')).toBeInTheDocument();
      expect(screen.getByText('2 trackevent')).toBeInTheDocument();
      expect(screen.getByText('0 outlink')).toBeInTheDocument();

      // Module 2 counts
      expect(
        screen.getByText('1 trackevent with pageview')
      ).toBeInTheDocument();
      expect(screen.getByText('1 outlink')).toBeInTheDocument();
    });
  });

  it('handles API error gracefully', async () => {
    const error = new Error('API Error');
    (adminS3Service.fetchModules as jest.Mock).mockRejectedValue(error);

    await act(async () => {
      render(<ScreenshotsPage />);
      // Wait for the error to be caught
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to fetch modules');
    });
  });

  it('updates modules after successful upload', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAdmin: true,
      isLoading: false,
    });

    await act(async () => {
      render(<ScreenshotsPage />);
      // Wait for initial load
      await Promise.resolve();
    });

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTitle('Test Module 1')).toBeInTheDocument();
    });

    // Clear mock calls from initial load
    jest.clearAllMocks();

    // Simulate successful upload by triggering onSuccess callback
    await act(async () => {
      const button = screen.getByRole('button', { name: 'Upload Screenshot' });
      await user.click(button);
      // Wait for the fetch promises to resolve
      await Promise.resolve();
    });

    // Verify refetch was triggered
    expect(adminS3Service.fetchModules).toHaveBeenCalled();
    expect(adminS3Service.fetchModuleEventCounts).toHaveBeenCalled();
  });
});
