import { render, screen, fireEvent, act } from '@testing-library/react';
import { Autocomplete } from '@/components/shared/Autocomplete';
import userEvent from '@testing-library/user-event';

describe('Autocomplete', () => {
  const mockOptions = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'];
  const defaultProps = {
    options: mockOptions,
    value: '',
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<Autocomplete {...defaultProps} />);
    const input = screen.getByPlaceholderText('Search...');
    expect(input).toBeInTheDocument();
  });

  it('renders with custom placeholder and label', () => {
    render(
      <Autocomplete
        {...defaultProps}
        placeholder="Select fruit"
        label="Fruit Selection"
      />
    );
    expect(screen.getByPlaceholderText('Select fruit')).toBeInTheDocument();
    expect(screen.getByText('Fruit Selection')).toBeInTheDocument();
  });

  it('shows required indicator when required prop is true', () => {
    render(
      <Autocomplete {...defaultProps} label="Fruit Selection" required={true} />
    );
    expect(screen.getByText('*')).toHaveClass('text-red-500');
  });

  it('filters options based on input', async () => {
    render(<Autocomplete {...defaultProps} />);
    const input = screen.getByPlaceholderText('Search...');

    await act(async () => {
      await userEvent.click(input);
      await userEvent.type(input, 'ber');
    });

    // Should only show options containing "ber"
    const options = screen.getAllByRole('listitem');
    expect(options).toHaveLength(1); // Only Elderberry contains "ber"
    expect(options[0]).toHaveTextContent('Elderberry');
  });

  it('highlights matching text in options', async () => {
    render(<Autocomplete {...defaultProps} />);
    const input = screen.getByPlaceholderText('Search...');

    await act(async () => {
      await userEvent.click(input);
      await userEvent.type(input, 'ber');
    });

    // Check if the matching text is highlighted
    const highlightedText = screen.getByText('ber');
    expect(highlightedText).toHaveClass('text-blue-600', 'font-medium');
  });

  it('handles keyboard navigation', async () => {
    render(<Autocomplete {...defaultProps} />);
    const input = screen.getByPlaceholderText('Search...');

    await act(async () => {
      await userEvent.click(input);
      await userEvent.keyboard('{ArrowDown}');
    });

    const options = screen.getAllByRole('listitem');
    expect(options[0]).toHaveClass('bg-blue-600', 'text-white');

    await act(async () => {
      await userEvent.keyboard('{ArrowDown}');
    });
    expect(options[1]).toHaveClass('bg-blue-600', 'text-white');

    await act(async () => {
      await userEvent.keyboard('{ArrowUp}');
    });
    expect(options[0]).toHaveClass('bg-blue-600', 'text-white');
  });

  it('selects option on enter key', async () => {
    render(<Autocomplete {...defaultProps} />);
    const input = screen.getByPlaceholderText('Search...');

    // Open dropdown
    await act(async () => {
      await userEvent.click(input);
    });

    // Wait for dropdown to be visible
    expect(screen.getByRole('list')).toBeInTheDocument();

    // Navigate to first option
    await act(async () => {
      await userEvent.keyboard('{ArrowDown}');
    });

    // Wait for state update
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Navigate to second option
    await act(async () => {
      await userEvent.keyboard('{ArrowDown}');
    });

    // Wait for state update
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Select option
    await act(async () => {
      await userEvent.keyboard('{Enter}');
    });

    expect(defaultProps.onChange).toHaveBeenCalledWith('Banana');
  });

  it('closes dropdown when clicking outside', async () => {
    render(<Autocomplete {...defaultProps} />);
    const input = screen.getByPlaceholderText('Search...');

    await act(async () => {
      await userEvent.click(input);
    });
    expect(screen.getByRole('list')).toBeInTheDocument();

    await act(async () => {
      fireEvent.mouseDown(document.body);
    });
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('closes dropdown on escape key', async () => {
    render(<Autocomplete {...defaultProps} />);
    const input = screen.getByPlaceholderText('Search...');

    await act(async () => {
      await userEvent.click(input);
    });
    expect(screen.getByRole('list')).toBeInTheDocument();

    await act(async () => {
      await userEvent.keyboard('{Escape}');
    });
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('selects option on click', async () => {
    render(<Autocomplete {...defaultProps} />);
    const input = screen.getByPlaceholderText('Search...');

    await act(async () => {
      await userEvent.click(input);
    });

    // Wait for dropdown to be visible
    expect(screen.getByRole('list')).toBeInTheDocument();

    await act(async () => {
      const option = screen.getByText('Banana');
      await userEvent.click(option);
    });

    expect(defaultProps.onChange).toHaveBeenCalledWith('Banana');
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('handles empty options array', () => {
    render(<Autocomplete {...defaultProps} options={[]} />);
    const input = screen.getByPlaceholderText('Search...');

    fireEvent.focus(input);
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('applies custom className to input', () => {
    const customClass = 'custom-input';
    render(<Autocomplete {...defaultProps} className={customClass} />);
    const input = screen.getByPlaceholderText('Search...');
    expect(input).toHaveClass(customClass);
  });

  it('handles id and name props', () => {
    render(
      <Autocomplete
        {...defaultProps}
        id="fruit-select"
        name="fruit"
        label="Select Fruit"
      />
    );
    const input = screen.getByLabelText('Select Fruit');
    expect(input).toHaveAttribute('id', 'fruit-select');
    expect(input).toHaveAttribute('name', 'fruit');
  });
});
