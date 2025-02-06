import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminPage from '../../../../app/admin/page';
import { useRouter } from 'next/navigation';
import { useAdminState } from '@/hooks/useAdminState';
import { adminSections } from '@/data/adminSections';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock useAdminState hook
jest.mock('@/hooks/useAdminState', () => ({
  useAdminState: jest.fn(),
}));

describe('Admin Page Integration', () => {
  const user = userEvent.setup();
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAdminState as jest.Mock).mockReturnValue({ isLoading: false });
  });

  it('renders loading state', () => {
    // Mock loading state
    (useAdminState as jest.Mock).mockReturnValue({ isLoading: true });

    render(<AdminPage />);

    // Should show spinner
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // Should not show content
    expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
  });

  it('renders admin dashboard with title and description', () => {
    render(<AdminPage />);

    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    expect(
      screen.getByText('Manage event types, categories, dimensions, and more')
    ).toBeInTheDocument();
  });

  it('displays all admin section cards', () => {
    render(<AdminPage />);

    // Verify each admin section is rendered
    adminSections.forEach((section) => {
      expect(screen.getByText(section.title)).toBeInTheDocument();
      expect(screen.getByText(section.description)).toBeInTheDocument();
    });
  });

  it('navigates to correct section when card is clicked', async () => {
    render(<AdminPage />);

    // Click each admin section card and verify navigation
    for (const section of adminSections) {
      await user.click(screen.getByText(section.title));
      expect(mockRouter.push).toHaveBeenCalledWith(`/admin/${section.type}`);
    }

    // Verify total number of navigation calls
    expect(mockRouter.push).toHaveBeenCalledTimes(adminSections.length);
  });
});
