import { render, screen, act, fireEvent } from '@testing-library/react';
import { SearchInput } from '@/components/common/SearchInput';

describe('SearchInput', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders with default props', () => {
    render(<SearchInput onSearch={() => {}} />);
    const input = screen.getByPlaceholderText('Search...');
    expect(input).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    render(
      <SearchInput onSearch={() => {}} placeholder="Custom placeholder" />
    );
    const input = screen.getByPlaceholderText('Custom placeholder');
    expect(input).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<SearchInput onSearch={() => {}} className="custom-class" />);
    const input = screen.getByPlaceholderText('Search...');
    expect(input).toHaveClass('custom-class');
  });

  it('shows clear button when text is entered', () => {
    render(<SearchInput onSearch={() => {}} />);
    const input = screen.getByPlaceholderText('Search...');

    // Clear button should not be visible initially
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    // Enter text
    act(() => {
      input.focus();
      fireEvent.change(input, { target: { value: 'test' } });
      jest.runAllTimers();
    });

    // Clear button should be visible
    const clearButton = screen.getByRole('button');
    expect(clearButton).toBeInTheDocument();
  });

  it('clears text when clear button is clicked', () => {
    const handleSearch = jest.fn();
    render(<SearchInput onSearch={handleSearch} />);
    const input = screen.getByPlaceholderText('Search...');

    // Enter text
    act(() => {
      input.focus();
      fireEvent.change(input, { target: { value: 'test' } });
      jest.runAllTimers();
    });

    expect(input).toHaveValue('test');

    // Click clear button
    const clearButton = screen.getByRole('button');
    act(() => {
      fireEvent.click(clearButton);
      jest.runAllTimers();
    });

    // Input should be empty
    expect(input).toHaveValue('');
    expect(handleSearch).toHaveBeenCalledWith('');
  });

  it('debounces search callback', () => {
    const handleSearch = jest.fn();
    render(<SearchInput onSearch={handleSearch} delay={500} />);
    const input = screen.getByPlaceholderText('Search...');

    // Initial change
    act(() => {
      input.focus();
      fireEvent.change(input, { target: { value: 'test' } });
    });

    // Should be called immediately with empty string
    expect(handleSearch).toHaveBeenCalledTimes(1);
    expect(handleSearch).toHaveBeenLastCalledWith('');

    // Fast-forward halfway
    act(() => {
      jest.advanceTimersByTime(250);
    });

    // Should not have been called again yet
    expect(handleSearch).toHaveBeenCalledTimes(1);

    // Complete the delay
    act(() => {
      jest.advanceTimersByTime(250);
    });

    // Now it should be called with the new value
    expect(handleSearch).toHaveBeenCalledTimes(2);
    expect(handleSearch).toHaveBeenLastCalledWith('test');
  });

  it('uses custom delay time', () => {
    const handleSearch = jest.fn();
    render(<SearchInput onSearch={handleSearch} delay={1000} />);
    const input = screen.getByPlaceholderText('Search...');

    // Initial change
    act(() => {
      input.focus();
      fireEvent.change(input, { target: { value: 'test' } });
    });

    // Should be called immediately with empty string
    expect(handleSearch).toHaveBeenCalledTimes(1);
    expect(handleSearch).toHaveBeenLastCalledWith('');

    // Fast-forward halfway
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Should not have been called again yet
    expect(handleSearch).toHaveBeenCalledTimes(1);

    // Complete the delay
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Now it should be called with the new value
    expect(handleSearch).toHaveBeenCalledTimes(2);
    expect(handleSearch).toHaveBeenLastCalledWith('test');
  });

  it('initializes with initial value', () => {
    render(<SearchInput onSearch={() => {}} initialValue="initial" />);
    const input = screen.getByPlaceholderText('Search...');
    expect(input).toHaveValue('initial');
  });

  it('handles rapid text changes', () => {
    const handleSearch = jest.fn();
    render(<SearchInput onSearch={handleSearch} delay={300} />);
    const input = screen.getByPlaceholderText('Search...');

    // Initial focus
    act(() => {
      input.focus();
    });

    // Should be called with empty string
    expect(handleSearch).toHaveBeenCalledTimes(1);
    expect(handleSearch).toHaveBeenLastCalledWith('');

    // Rapid changes
    act(() => {
      fireEvent.change(input, { target: { value: 't' } });
      jest.advanceTimersByTime(100);
      fireEvent.change(input, { target: { value: 'te' } });
      jest.advanceTimersByTime(100);
      fireEvent.change(input, { target: { value: 'tes' } });
      jest.advanceTimersByTime(100);
      fireEvent.change(input, { target: { value: 'test' } });
    });

    // Should not have been called again yet
    expect(handleSearch).toHaveBeenCalledTimes(1);

    // Complete the delay
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Should be called once more with final value
    expect(handleSearch).toHaveBeenCalledTimes(2);
    expect(handleSearch).toHaveBeenLastCalledWith('test');
  });
});
