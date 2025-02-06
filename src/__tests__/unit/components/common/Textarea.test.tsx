import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from '@/components/common/Textarea';

describe('Textarea', () => {
  const defaultProps = {
    id: 'test-textarea',
    label: 'Test Textarea',
    value: '',
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with label and textarea', () => {
    render(<Textarea {...defaultProps} />);

    const label = screen.getByText('Test Textarea');
    const textarea = screen.getByRole('textbox');

    expect(label).toBeInTheDocument();
    expect(textarea).toBeInTheDocument();
  });

  it('associates label with textarea using htmlFor', () => {
    render(<Textarea {...defaultProps} />);

    const label = screen.getByText('Test Textarea');
    const textarea = screen.getByRole('textbox');

    expect(label).toHaveAttribute('for', 'test-textarea');
    expect(textarea).toHaveAttribute('id', 'test-textarea');
  });

  it('renders with default number of rows', () => {
    render(<Textarea {...defaultProps} />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('rows', '3');
  });

  it('renders with custom number of rows', () => {
    render(<Textarea {...defaultProps} rows={5} />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('rows', '5');
  });

  it('renders with placeholder when provided', () => {
    const placeholder = 'Enter your text here';
    render(<Textarea {...defaultProps} placeholder={placeholder} />);

    const textarea = screen.getByPlaceholderText(placeholder);
    expect(textarea).toBeInTheDocument();
  });

  describe('User Interaction', () => {
    it('calls onChange when text is entered', async () => {
      const handleChange = jest.fn();
      render(<Textarea {...defaultProps} onChange={handleChange} />);

      const textarea = screen.getByRole('textbox');
      await userEvent.type(textarea, 't');

      expect(handleChange).toHaveBeenCalled();
      expect(handleChange.mock.calls[0][0].target.tagName).toBe('TEXTAREA');
    });

    it('displays the provided value', () => {
      render(<Textarea {...defaultProps} value="Initial value" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue('Initial value');
    });
  });

  describe('Disabled State', () => {
    it('applies disabled styles when disabled', () => {
      render(<Textarea {...defaultProps} disabled />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeDisabled();
      expect(textarea).toHaveClass(
        'disabled:bg-gray-50',
        'disabled:text-gray-500'
      );
    });

    it('prevents user input when disabled', async () => {
      const handleChange = jest.fn();
      render(<Textarea {...defaultProps} onChange={handleChange} disabled />);

      const textarea = screen.getByRole('textbox');
      await userEvent.type(textarea, 'test');

      expect(handleChange).not.toHaveBeenCalled();
      expect(textarea).toHaveValue('');
    });
  });

  describe('Styling', () => {
    it('applies correct label styles', () => {
      render(<Textarea {...defaultProps} />);

      const label = screen.getByText('Test Textarea');
      expect(label).toHaveClass(
        'block',
        'text-sm',
        'font-medium',
        'text-gray-700'
      );
    });

    it('applies correct textarea styles', () => {
      render(<Textarea {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass(
        'mt-4',
        'block',
        'w-full',
        'rounded-md',
        'border',
        'border-gray-300',
        'px-3',
        'py-2',
        'shadow-sm',
        'focus:border-blue-500',
        'focus:outline-none',
        'focus:ring-blue-500',
        'sm:text-sm'
      );
    });
  });

  describe('Accessibility', () => {
    it('maintains accessible label-textarea relationship', () => {
      render(<Textarea {...defaultProps} />);

      const textarea = screen.getByLabelText('Test Textarea');
      expect(textarea).toBeInTheDocument();
      expect(textarea.tagName.toLowerCase()).toBe('textarea');
    });

    it('uses name attribute matching the id', () => {
      render(<Textarea {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('name', 'test-textarea');
    });
  });
});
