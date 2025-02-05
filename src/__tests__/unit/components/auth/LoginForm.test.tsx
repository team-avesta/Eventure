import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '@/components/auth/LoginForm';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth';

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

describe('LoginForm', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('renders login form with all fields', () => {
    render(<LoginForm />);

    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('handles successful login', async () => {
    // Mock successful login
    (authService.login as jest.Mock).mockResolvedValue({
      username: 'testuser',
      role: 'user',
    });

    render(<LoginForm />);

    // Fill in the form
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    // Check if auth service was called with correct credentials
    expect(authService.login).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'password123',
    });

    // Wait for navigation
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/screenshots');
    });

    // Verify no error message is shown
    expect(
      screen.queryByText('Invalid username or password')
    ).not.toBeInTheDocument();
  });

  it('handles failed login', async () => {
    // Mock failed login
    (authService.login as jest.Mock).mockResolvedValue(null);

    render(<LoginForm />);

    // Fill in the form
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'wronguser' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'wrongpass' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    // Check if auth service was called
    expect(authService.login).toHaveBeenCalledWith({
      username: 'wronguser',
      password: 'wrongpass',
    });

    // Wait for error message
    await waitFor(() => {
      expect(
        screen.getByText('Invalid username or password')
      ).toBeInTheDocument();
    });

    // Verify no navigation occurred
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('shows loading state during login', async () => {
    // Mock a delayed login
    (authService.login as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ username: 'testuser', role: 'user' }), 100)
        )
    );

    render(<LoginForm />);

    // Fill in the form
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });

    // Get button before submit
    const submitButton = screen.getByRole('button', { name: 'Sign in' });

    // Submit the form
    fireEvent.click(submitButton);

    // Check loading state
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Loading...' })
      ).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });

    // Wait for loading to finish
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Sign in' })
      ).toBeInTheDocument();
      expect(screen.getByRole('button')).not.toBeDisabled();
    });
  });

  it('validates required fields', async () => {
    render(<LoginForm />);

    // Try to submit without filling fields
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    // Check for HTML5 validation messages
    expect(screen.getByLabelText('Username')).toBeInvalid();
    expect(screen.getByLabelText('Password')).toBeInvalid();

    // Auth service should not be called
    expect(authService.login).not.toHaveBeenCalled();
  });
});
