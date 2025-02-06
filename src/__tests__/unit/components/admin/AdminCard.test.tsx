import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminCard } from '@/components/admin/AdminCard';
import { AdminSection } from '@/data/adminSections';

describe('AdminCard', () => {
  const mockIcon = <svg data-testid="mock-icon" />;
  const defaultProps: AdminSection & { onClick: () => void } = {
    title: 'Test Card',
    description: 'Test Description',
    icon: mockIcon,
    onClick: jest.fn(),
    type: 'module',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders card content correctly', () => {
    render(<AdminCard {...defaultProps} />);

    expect(screen.getByText('Test Card')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    render(<AdminCard {...defaultProps} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
  });

  describe('Styling', () => {
    it('applies correct button styles', () => {
      render(<AdminCard {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'w-full',
        'relative',
        'bg-white',
        'rounded-2xl',
        'shadow-sm',
        'hover:shadow-md',
        'transition-all',
        'duration-300',
        'overflow-hidden',
        'group',
        'text-left'
      );
    });

    it('applies correct icon container styles', () => {
      render(<AdminCard {...defaultProps} />);

      const iconContainer = screen.getByTestId('mock-icon').closest('div');
      expect(iconContainer).toHaveClass(
        'w-10',
        'h-10',
        'rounded-xl',
        'bg-blue-500',
        'text-white',
        'flex',
        'items-center',
        'justify-center',
        'transition-colors',
        'duration-200',
        'group-hover:bg-blue-600'
      );
    });

    it('applies correct title styles', () => {
      render(<AdminCard {...defaultProps} />);

      const title = screen.getByText('Test Card');
      expect(title).toHaveClass(
        'text-base',
        'font-semibold',
        'text-gray-900',
        'group-hover:text-gray-700'
      );
    });

    it('applies correct description styles', () => {
      render(<AdminCard {...defaultProps} />);

      const description = screen.getByText('Test Description');
      expect(description).toHaveClass('mt-1', 'text-sm', 'text-gray-500');
    });
  });

  describe('Layout', () => {
    it('maintains correct flex layout', () => {
      render(<AdminCard {...defaultProps} />);

      const contentContainer = screen.getByText('Test Card').closest('div');
      expect(contentContainer?.parentElement).toHaveClass(
        'flex',
        'items-start'
      );
    });

    it('applies correct padding', () => {
      render(<AdminCard {...defaultProps} />);

      const paddingContainer = screen.getByText('Test Card').closest('div')
        ?.parentElement?.parentElement;
      expect(paddingContainer).toHaveClass('p-6');
    });
  });

  describe('Accessibility', () => {
    it('renders as a button element', () => {
      render(<AdminCard {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button.tagName.toLowerCase()).toBe('button');
    });

    it('maintains text alignment for better readability', () => {
      render(<AdminCard {...defaultProps} />);

      const contentContainer = screen.getByText('Test Card').closest('div');
      expect(contentContainer).toHaveClass('text-left');
    });
  });
});
