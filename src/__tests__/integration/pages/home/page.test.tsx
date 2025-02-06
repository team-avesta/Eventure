import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '../../../../../app/page';
import { authService } from '@/services/auth';
import { useRouter } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock auth service
jest.mock('@/services/auth', () => ({
  authService: {
    login: jest.fn(),
  },
}));

describe('Home Page Integration', () => {
  const user = userEvent.setup();
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('renders home page with branding and login form', () => {
    render(<Home />);

    // Check branding
    expect(screen.getByText('Eventure')).toBeInTheDocument();
    expect(screen.getByText('Event Mapping Made Simple')).toBeInTheDocument();

    // Check login form
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('completes successful login workflow', async () => {
    // Mock successful auth
    (authService.login as jest.Mock).mockResolvedValue({
      username: 'testuser',
      role: 'user',
    });

    render(<Home />);

    // Fill login form
    await act(async () => {
      await user.type(screen.getByLabelText('Username'), 'testuser');
      await user.type(screen.getByLabelText('Password'), 'password123');
    });

    // Submit form
    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Sign in' }));
    });

    // Verify auth call
    expect(authService.login).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'password123',
    });

    // Verify redirect
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/screenshots');
    });
  });

  it('handles failed login workflow', async () => {
    // Mock failed auth
    (authService.login as jest.Mock).mockResolvedValue(null);

    render(<Home />);

    // Fill form with invalid creds
    await act(async () => {
      await user.type(screen.getByLabelText('Username'), 'wronguser');
      await user.type(screen.getByLabelText('Password'), 'wrongpass');
    });

    // Submit form
    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Sign in' }));
    });

    // Verify error state
    await waitFor(() => {
      expect(
        screen.getByText('Invalid username or password')
      ).toBeInTheDocument();
    });

    // Verify no redirect
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('shows loading state during login attempt', async () => {
    // Mock delayed auth
    (authService.login as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ username: 'testuser', role: 'user' }), 100)
        )
    );

    render(<Home />);

    // Fill form
    await act(async () => {
      await user.type(screen.getByLabelText('Username'), 'testuser');
      await user.type(screen.getByLabelText('Password'), 'password123');
    });

    // Submit and check loading state
    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Sign in' }));
    });

    // Verify loading state
    expect(
      await screen.findByRole('button', { name: 'Loading...' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();

    // Wait for completion
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/screenshots');
    });
  });

  it('validates required fields in login form', async () => {
    render(<Home />);

    // Try submit empty form
    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Sign in' }));
    });

    // Check validation
    expect(screen.getByLabelText('Username')).toBeInvalid();
    expect(screen.getByLabelText('Password')).toBeInvalid();

    // Verify no auth attempt
    expect(authService.login).not.toHaveBeenCalled();
  });
});
