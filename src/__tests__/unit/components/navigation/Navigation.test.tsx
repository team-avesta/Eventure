import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import Navigation from '@/components/navigation/Navigation';
import { usePathname } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

describe('Navigation', () => {
  const mockShowAnalytics = jest.fn();
  const mockSessionStorage = window.sessionStorage;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Default pathname
    (usePathname as jest.Mock).mockReturnValue('/screenshots');
  });

  afterEach(() => {
    cleanup();
  });

  it('renders basic navigation items', () => {
    render(<Navigation />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Docs')).toBeInTheDocument();
    expect(screen.getByText('Sign out')).toBeInTheDocument();
  });

  it('shows admin link only for admin users', () => {
    // Without admin role
    (mockSessionStorage.getItem as jest.Mock).mockReturnValue(null);
    render(<Navigation />);
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();

    cleanup();

    // With admin role
    (mockSessionStorage.getItem as jest.Mock).mockReturnValue(
      JSON.stringify({ role: 'admin' })
    );
    render(<Navigation />);
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('shows analytics button only on screenshots page', () => {
    // On screenshots page
    (usePathname as jest.Mock).mockReturnValue('/screenshots');
    render(<Navigation onShowAnalytics={mockShowAnalytics} />);
    expect(screen.getByText('View Analytics')).toBeInTheDocument();

    cleanup();

    // On different page
    (usePathname as jest.Mock).mockReturnValue('/docs');
    render(<Navigation onShowAnalytics={mockShowAnalytics} />);
    expect(screen.queryByText('View Analytics')).not.toBeInTheDocument();
  });

  it('handles analytics button click', () => {
    render(<Navigation onShowAnalytics={mockShowAnalytics} />);

    fireEvent.click(screen.getByText('View Analytics'));
    expect(mockShowAnalytics).toHaveBeenCalledTimes(1);
  });

  it('handles sign out', () => {
    // Mock window.location
    const mockLocation = {
      href: window.location.href,
    };

    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true,
      configurable: true,
    });

    render(<Navigation />);
    fireEvent.click(screen.getByText('Sign out'));

    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('auth');
    expect(mockLocation.href).toBe('/');
  });

  it('applies active styles to current route', () => {
    (usePathname as jest.Mock).mockReturnValue('/docs');
    render(<Navigation />);

    const docsLink = screen.getByText('Docs').closest('a');
    const homeLink = screen.getByText('Home').closest('a');

    expect(docsLink?.className).toContain('border-blue-500');
    expect(homeLink?.className).toContain('border-transparent');
  });

  it('applies active styles to admin route when in admin pages', () => {
    (usePathname as jest.Mock).mockReturnValue('/admin/settings');
    (mockSessionStorage.getItem as jest.Mock).mockReturnValue(
      JSON.stringify({ role: 'admin' })
    );
    render(<Navigation />);

    const adminLink = screen.getByText('Admin').closest('a');
    expect(adminLink?.className).toContain('border-blue-500');
  });

  it('renders footer with correct link', () => {
    render(<Navigation />);

    const link = screen.getByText('Avesta Technologies');
    expect(link).toHaveAttribute('href', 'https://avestatechnologies.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
