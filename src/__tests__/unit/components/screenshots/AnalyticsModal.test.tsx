import { render, screen, fireEvent, act } from '@testing-library/react';
import { AnalyticsModal } from '@/components/screenshots/AnalyticsModal';

// Mock AnalyticsOverview component
jest.mock('@/components/screenshots/AnalyticsOverview', () => ({
  AnalyticsOverview: ({ modules }: { modules: any[] }) => (
    <div data-testid="analytics-overview">Modules count: {modules.length}</div>
  ),
}));

describe('AnalyticsModal', () => {
  const mockProps = {
    isOpen: true,
    onClose: jest.fn(),
    modules: [
      {
        id: '1',
        key: 'module-1',
        name: 'Module 1',
        events: 5,
        screenshots: [],
      },
      {
        id: '2',
        key: 'module-2',
        name: 'Module 2',
        events: 3,
        screenshots: [],
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders modal when open', async () => {
    await act(async () => {
      render(<AnalyticsModal {...mockProps} />);
    });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Analytics Overview')).toBeInTheDocument();
    expect(screen.getByTestId('analytics-overview')).toBeInTheDocument();
    expect(screen.getByText('Modules count: 2')).toBeInTheDocument();
  });

  it('does not render when closed', async () => {
    await act(async () => {
      render(<AnalyticsModal {...mockProps} isOpen={false} />);
    });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText('Analytics Overview')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    await act(async () => {
      render(<AnalyticsModal {...mockProps} />);
    });

    const closeButton = screen.getByRole('button', { name: /close/i });
    await act(async () => {
      fireEvent.click(closeButton);
    });

    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when clicking outside the modal', async () => {
    await act(async () => {
      render(<AnalyticsModal {...mockProps} />);
    });

    const dialog = screen.getByRole('dialog');
    await act(async () => {
      fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' });
    });

    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('passes modules data to AnalyticsOverview', async () => {
    await act(async () => {
      render(<AnalyticsModal {...mockProps} />);
    });

    expect(screen.getByText('Modules count: 2')).toBeInTheDocument();
  });
});
