import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScreenshotFilters } from '@/components/screenshots/module';
import { PageLabel } from '@/types/pageLabel';

// Mock the SearchInput component
jest.mock('@/components/shared/SearchInput', () => ({
  SearchInput: ({ onSearch, placeholder, delay, ...props }: any) => (
    <input
      type="text"
      onChange={(e) => onSearch(e.target.value)}
      placeholder={placeholder}
      data-delay={delay}
      data-testid="screenshot-search"
      {...props}
    />
  ),
}));

// Mock the Dropdown component
jest.mock('@/components/shared/Dropdown', () => ({
  Dropdown: ({
    options,
    selectedId,
    onSelect,
    allOptionLabel,
    placeholder,
    ...props
  }: any) => (
    <select
      value={selectedId || ''}
      onChange={(e) => onSelect(e.target.value === '' ? null : e.target.value)}
      data-testid="label-filter"
      data-all-option-label={allOptionLabel}
      data-placeholder={placeholder}
      {...props}
    >
      <option value="">All</option>
      {options.map((option: any) => (
        <option key={option.id} value={option.id}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));

describe('ScreenshotFilters', () => {
  // Mock props
  const mockLabels: PageLabel[] = [
    { id: 'label1', name: 'Homepage' },
    { id: 'label2', name: 'Dashboard' },
    { id: 'label3', name: 'Settings' },
  ];

  const defaultProps = {
    onSearch: jest.fn(),
    labels: mockLabels,
    selectedLabelId: null,
    onLabelSelect: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the search input correctly', () => {
    render(<ScreenshotFilters {...defaultProps} />);

    const searchInput = screen.getByTestId('screenshot-search');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute('placeholder', 'Search screenshots...');
    expect(searchInput).toHaveAttribute('data-delay', '0');
  });

  it('calls onSearch when search input changes', () => {
    render(<ScreenshotFilters {...defaultProps} />);

    const searchInput = screen.getByTestId('screenshot-search');
    fireEvent.change(searchInput, { target: { value: 'test search' } });

    expect(defaultProps.onSearch).toHaveBeenCalledWith('test search');
  });

  it('renders the label dropdown when labels are available', () => {
    render(<ScreenshotFilters {...defaultProps} />);

    const dropdown = screen.getByTestId('label-filter');
    expect(dropdown).toBeInTheDocument();

    // Check that all options are rendered
    mockLabels.forEach((label) => {
      expect(screen.getByText(label.name)).toBeInTheDocument();
    });
  });

  it('does not render the label dropdown when no labels are available', () => {
    render(<ScreenshotFilters {...defaultProps} labels={[]} />);

    expect(screen.queryByTestId('label-filter')).not.toBeInTheDocument();
  });

  it('calls onLabelSelect when a label is selected', () => {
    render(<ScreenshotFilters {...defaultProps} />);

    const dropdown = screen.getByTestId('label-filter');
    fireEvent.change(dropdown, { target: { value: 'label2' } });

    expect(defaultProps.onLabelSelect).toHaveBeenCalledWith('label2');
  });

  it('calls onLabelSelect with null when "All" is selected', () => {
    render(<ScreenshotFilters {...defaultProps} selectedLabelId="label1" />);

    const dropdown = screen.getByTestId('label-filter');
    fireEvent.change(dropdown, { target: { value: '' } });

    expect(defaultProps.onLabelSelect).toHaveBeenCalledWith(null);
  });

  it('selects the correct label in the dropdown', () => {
    render(<ScreenshotFilters {...defaultProps} selectedLabelId="label2" />);

    const dropdown = screen.getByTestId('label-filter');
    expect(dropdown).toHaveValue('label2');
  });

  it('has responsive layout classes', () => {
    const { container } = render(<ScreenshotFilters {...defaultProps} />);

    // Check main container
    const mainContainer = container.firstChild;
    expect(mainContainer).toHaveClass('mb-4');
    expect(mainContainer).toHaveClass('flex');
    expect(mainContainer).toHaveClass('flex-wrap');
    expect(mainContainer).toHaveClass('items-center');
    expect(mainContainer).toHaveClass('gap-2');

    // Check search input container
    const searchContainer = container.querySelector('.w-full');
    expect(searchContainer).toHaveClass('sm:w-auto');
    expect(searchContainer).toHaveClass('sm:flex-1');
    expect(searchContainer).toHaveClass('mb-2');
    expect(searchContainer).toHaveClass('sm:mb-0');
  });
});
