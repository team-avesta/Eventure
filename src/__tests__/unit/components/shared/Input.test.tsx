import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '@/components/shared/Input';

describe('Input', () => {
  const defaultProps = {
    label: 'Test Label',
    id: 'test-input',
  };

  it('renders with label and input', () => {
    render(<Input {...defaultProps} />);

    const label = screen.getByText('Test Label');
    const input = screen.getByLabelText('Test Label');

    expect(label).toBeInTheDocument();
    expect(input).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<Input {...defaultProps} ref={ref as any} />);

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('passes through HTML input attributes', () => {
    render(
      <Input
        {...defaultProps}
        type="email"
        placeholder="Enter email"
        required
      />
    );

    const input = screen.getByLabelText('Test Label');
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('placeholder', 'Enter email');
    expect(input).toHaveAttribute('required');
  });

  it('shows error message when provided', () => {
    const errorMessage = 'This field is required';
    render(<Input {...defaultProps} error={errorMessage} />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toHaveClass('text-red-600');
  });

  it('applies error styles to input when error is provided', () => {
    render(<Input {...defaultProps} error="Error message" />);

    const input = screen.getByLabelText('Test Label');
    expect(input).toHaveClass('border-red-500');
  });

  it('merges custom className with default classes', () => {
    render(<Input {...defaultProps} className="custom-class" />);

    const input = screen.getByLabelText('Test Label');
    expect(input).toHaveClass('custom-class');
    expect(input).toHaveClass(
      'block',
      'w-full',
      'appearance-none',
      'rounded-md',
      'border',
      'border-gray-300',
      'px-3',
      'py-2',
      'shadow-sm'
    );
  });

  describe('Label', () => {
    it('associates label with input using htmlFor', () => {
      render(<Input {...defaultProps} />);

      const label = screen.getByText('Test Label');
      expect(label).toHaveAttribute('for', 'test-input');
    });

    it('applies correct label styles', () => {
      render(<Input {...defaultProps} />);

      const label = screen.getByText('Test Label');
      expect(label).toHaveClass(
        'block',
        'text-sm',
        'font-medium',
        'text-gray-700'
      );
    });
  });

  describe('User Interaction', () => {
    it('handles text input correctly', async () => {
      const handleChange = jest.fn();
      render(<Input {...defaultProps} onChange={handleChange} />);

      const input = screen.getByLabelText('Test Label');
      await userEvent.type(input, 'test value');

      expect(handleChange).toHaveBeenCalled();
      expect(input).toHaveValue('test value');
    });

    it('handles focus and blur events', async () => {
      const handleFocus = jest.fn();
      const handleBlur = jest.fn();

      render(
        <Input {...defaultProps} onFocus={handleFocus} onBlur={handleBlur} />
      );

      const input = screen.getByLabelText('Test Label');

      await userEvent.click(input); // Focus
      expect(handleFocus).toHaveBeenCalled();

      await userEvent.tab(); // Blur by tabbing away
      expect(handleBlur).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('maintains accessible label-input relationship', () => {
      render(<Input {...defaultProps} />);

      const label = screen.getByText('Test Label');
      const input = screen.getByLabelText('Test Label');

      expect(label).toHaveAttribute('for', 'test-input');
      expect(input).toHaveAttribute('id', 'test-input');
    });

    it('preserves required attribute for form validation', () => {
      render(<Input {...defaultProps} required aria-required="true" />);

      const input = screen.getByLabelText('Test Label');
      expect(input).toHaveAttribute('required');
      expect(input).toHaveAttribute('aria-required', 'true');
    });
  });
});
