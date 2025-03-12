import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/shared/Button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  describe('variants', () => {
    it('renders primary variant by default', () => {
      render(<Button>Primary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'bg-primary',
        'text-white',
        'hover:bg-primary-hover',
        'focus:ring-primary',
        'border-transparent'
      );
    });

    it('renders secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'bg-gray-100',
        'text-gray-700',
        'hover:bg-gray-200',
        'focus:ring-gray-500',
        'border-transparent'
      );
    });

    it('renders outline variant', () => {
      render(<Button variant="outline">Outline</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'bg-white',
        'text-gray-700',
        'hover:bg-gray-50',
        'focus:ring-primary',
        'border-gray-300'
      );
    });
  });

  describe('width behavior', () => {
    it('renders with default width', () => {
      render(<Button>Normal Width</Button>);
      const button = screen.getByRole('button');
      expect(button).not.toHaveClass('w-full');
    });

    it('renders full width when fullWidth is true', () => {
      render(<Button fullWidth>Full Width</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-full');
    });
  });

  describe('loading state', () => {
    it('shows loading spinner and text when isLoading is true', () => {
      render(<Button isLoading>Submit</Button>);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByText('Submit')).not.toBeInTheDocument();
    });

    it('disables button when loading', () => {
      render(<Button isLoading>Submit</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
    });
  });

  describe('disabled state', () => {
    it('applies disabled styles when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
    });
  });

  describe('click handling', () => {
    it('calls onClick handler when clicked', async () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      const button = screen.getByRole('button');
      await userEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
      const handleClick = jest.fn();
      render(
        <Button disabled onClick={handleClick}>
          Click me
        </Button>
      );

      const button = screen.getByRole('button');
      await userEvent.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('does not call onClick when loading', async () => {
      const handleClick = jest.fn();
      render(
        <Button isLoading onClick={handleClick}>
          Click me
        </Button>
      );

      const button = screen.getByRole('button');
      await userEvent.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('custom className', () => {
    it('applies custom className along with default classes', () => {
      render(<Button className="custom-class">Custom</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
      expect(button).toHaveClass('rounded-md', 'px-4', 'py-2'); // Base styles
    });
  });
});
