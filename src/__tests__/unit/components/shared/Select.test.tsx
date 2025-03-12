import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from '@/components/shared/Select';

describe('Select', () => {
  const defaultProps = {
    label: 'Test Select',
    id: 'test-select',
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' },
    ],
  };

  it('renders with label and options', () => {
    render(<Select {...defaultProps} />);

    const label = screen.getByText('Test Select');
    const select = screen.getByRole('combobox');
    const options = screen.getAllByRole('option');

    expect(label).toBeInTheDocument();
    expect(select).toBeInTheDocument();
    expect(options).toHaveLength(3);
    expect(options[0]).toHaveTextContent('Option 1');
    expect(options[1]).toHaveTextContent('Option 2');
    expect(options[2]).toHaveTextContent('Option 3');
  });

  it('associates label with select using htmlFor', () => {
    render(<Select {...defaultProps} />);

    const label = screen.getByText('Test Select');
    const select = screen.getByRole('combobox');

    expect(label).toHaveAttribute('for', 'test-select');
    expect(select).toHaveAttribute('id', 'test-select');
  });

  it('renders options with correct values', () => {
    render(<Select {...defaultProps} />);

    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveValue('option1');
    expect(options[1]).toHaveValue('option2');
    expect(options[2]).toHaveValue('option3');
  });

  it('shows error message when provided', () => {
    const errorMessage = 'This field is required';
    render(<Select {...defaultProps} error={errorMessage} />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toHaveClass('text-red-600');
  });

  it('applies error styles to select when error is provided', () => {
    render(<Select {...defaultProps} error="Error message" />);

    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('border-red-500');
  });

  it('merges custom className with default classes', () => {
    render(<Select {...defaultProps} className="custom-class" />);

    const select = screen.getByRole('combobox');
    expect(select).toHaveClass('custom-class');
    expect(select).toHaveClass(
      'appearance-none',
      'bg-white',
      'relative',
      'w-full',
      'pl-3',
      'pr-10',
      'py-2',
      'text-sm',
      'border',
      'border-gray-300',
      'rounded-md',
      'shadow-sm',
      'cursor-pointer'
    );
  });

  describe('User Interaction', () => {
    it('handles value change correctly', async () => {
      const handleChange = jest.fn();
      render(<Select {...defaultProps} onChange={handleChange} />);

      const select = screen.getByRole('combobox');
      await userEvent.selectOptions(select, 'option2');

      expect(handleChange).toHaveBeenCalled();
      expect(select).toHaveValue('option2');
    });

    it('handles focus and blur events', async () => {
      const handleFocus = jest.fn();
      const handleBlur = jest.fn();

      render(
        <Select {...defaultProps} onFocus={handleFocus} onBlur={handleBlur} />
      );

      const select = screen.getByRole('combobox');

      await userEvent.click(select); // Focus
      expect(handleFocus).toHaveBeenCalled();

      await userEvent.tab(); // Blur by tabbing away
      expect(handleBlur).toHaveBeenCalled();
    });
  });

  describe('Styling', () => {
    it('applies correct label styles', () => {
      render(<Select {...defaultProps} />);

      const label = screen.getByText('Test Select');
      expect(label).toHaveClass(
        'block',
        'text-sm',
        'font-medium',
        'text-gray-700',
        'mb-1'
      );
    });

    it('renders dropdown icon', () => {
      render(<Select {...defaultProps} />);

      const icon = screen.getByTestId('select-dropdown-icon');
      expect(icon).toBeInTheDocument();
      expect(icon.tagName.toLowerCase()).toBe('svg');
      expect(icon).toHaveClass('h-4', 'w-4');
    });

    it('applies hover and focus styles', async () => {
      render(<Select {...defaultProps} />);

      const select = screen.getByRole('combobox');
      expect(select).toHaveClass('hover:border-primary');
      expect(select).toHaveClass(
        'focus:outline-none',
        'focus:ring-1',
        'focus:ring-primary',
        'focus:border-primary'
      );
    });
  });

  describe('Accessibility', () => {
    it('preserves required attribute for form validation', () => {
      render(<Select {...defaultProps} required aria-required="true" />);

      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('required');
      expect(select).toHaveAttribute('aria-required', 'true');
    });

    it('supports disabled state', () => {
      render(<Select {...defaultProps} disabled />);

      const select = screen.getByRole('combobox');
      expect(select).toBeDisabled();
    });

    it('maintains accessible label-select relationship', () => {
      render(<Select {...defaultProps} />);

      const select = screen.getByLabelText('Test Select');
      expect(select).toBeInTheDocument();
      expect(select.tagName.toLowerCase()).toBe('select');
    });
  });
});
