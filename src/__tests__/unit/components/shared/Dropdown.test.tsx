import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dropdown, DropdownOption } from '@/components/shared/Dropdown';

describe('Dropdown component', () => {
  const mockOptions: DropdownOption[] = [
    { id: 'option1', label: 'Option 1' },
    { id: 'option2', label: 'Option 2' },
    { id: 'option3', label: 'Option 3' },
  ];

  const defaultProps = {
    options: mockOptions,
    selectedId: null,
    onSelect: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<Dropdown {...defaultProps} />);

    // Button should be visible with default "All" text
    const button = screen.getByRole('button', { expanded: false });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('All');

    // Dropdown menu should be closed initially
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('displays the selected option label when an option is selected', () => {
    render(<Dropdown {...defaultProps} selectedId="option2" />);

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Option 2');
  });

  it('displays placeholder when no option is selected and allOptionLabel is not provided', () => {
    render(
      <Dropdown
        {...defaultProps}
        allOptionLabel=""
        placeholder="Select something"
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Select something');
  });

  it('opens the dropdown menu when clicked', async () => {
    render(<Dropdown {...defaultProps} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Menu should now be visible
    const menu = screen.getByRole('menu');
    expect(menu).toBeInTheDocument();

    // All options should be visible
    // Use getAllByText and check the first option is "All"
    const allOptions = screen.getAllByRole('menuitem');
    expect(allOptions[0]).toHaveTextContent('All');
    expect(
      screen.getByRole('menuitem', { name: 'Option 1' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: 'Option 2' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: 'Option 3' })
    ).toBeInTheDocument();
  });

  it('calls onSelect with the option id when an option is clicked', () => {
    render(<Dropdown {...defaultProps} />);

    // Open dropdown
    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Click an option
    const option2 = screen.getByRole('menuitem', { name: 'Option 2' });
    fireEvent.click(option2);

    // onSelect should be called with the option id
    expect(defaultProps.onSelect).toHaveBeenCalledWith('option2');
  });

  it('calls onSelect with null when "All" option is clicked', () => {
    render(<Dropdown {...defaultProps} selectedId="option1" />);

    // Open dropdown
    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Click the "All" option - get the first menuitem which should be "All"
    const allOptions = screen.getAllByRole('menuitem');
    const allOption = allOptions[0]; // First option is "All"
    fireEvent.click(allOption);

    // onSelect should be called with null
    expect(defaultProps.onSelect).toHaveBeenCalledWith(null);
  });

  it('closes the dropdown after selecting an option', () => {
    render(<Dropdown {...defaultProps} />);

    // Open dropdown
    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Click an option
    const option = screen.getByRole('menuitem', { name: 'Option 1' });
    fireEvent.click(option);

    // Menu should be closed
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('applies custom class names when provided', () => {
    render(
      <Dropdown
        {...defaultProps}
        className="custom-dropdown"
        buttonClassName="custom-button"
        menuClassName="custom-menu"
        optionClassName="custom-option"
      />
    );

    // Check custom classes are applied
    const dropdown = screen.getByRole('button').parentElement?.parentElement;
    expect(dropdown).toHaveClass('custom-dropdown');

    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-button');

    // Open dropdown to check menu and option classes
    fireEvent.click(button);

    const menu = screen.getByRole('menu');
    expect(menu).toHaveClass('custom-menu');

    const options = screen.getAllByRole('menuitem');
    options.forEach((option) => {
      expect(option).toHaveClass('custom-option');
    });
  });

  it('highlights the selected option', () => {
    render(<Dropdown {...defaultProps} selectedId="option2" />);

    // Open dropdown
    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Get all options
    const options = screen.getAllByRole('menuitem');

    // Find the selected option (should have blue background)
    const selectedOption = options.find(
      (option) =>
        option.textContent === 'Option 2' &&
        option.classList.contains('bg-blue-100') &&
        option.classList.contains('text-blue-800')
    );

    expect(selectedOption).toBeInTheDocument();
  });

  it('highlights the "All" option when selectedId is null', () => {
    render(<Dropdown {...defaultProps} selectedId={null} />);

    // Open dropdown
    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Get the "All" option - it should be the first menuitem
    const allOptions = screen.getAllByRole('menuitem');
    const allOption = allOptions[0]; // First option is "All"

    // Check if it has the selected styles
    expect(allOption).toHaveClass('bg-blue-100');
    expect(allOption).toHaveClass('text-blue-800');
  });

  it('uses custom allOptionLabel when provided', () => {
    render(<Dropdown {...defaultProps} allOptionLabel="Show All Items" />);

    // Button should show custom label
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Show All Items');

    // Open dropdown
    fireEvent.click(button);

    // First option should have custom label - use the first menuitem
    const allOptions = screen.getAllByRole('menuitem');
    const allOption = allOptions[0]; // First option is the custom "Show All Items"
    expect(allOption).toHaveTextContent('Show All Items');
  });

  it('closes the dropdown when clicking outside', async () => {
    // Create a container to simulate clicking outside
    const { container } = render(
      <div>
        <div data-testid="outside-element">Outside</div>
        <Dropdown {...defaultProps} />
      </div>
    );

    // Open dropdown
    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Menu should be open
    expect(screen.getByRole('menu')).toBeInTheDocument();

    // Click outside
    const outsideElement = screen.getByTestId('outside-element');
    fireEvent.mouseDown(outsideElement);

    // Menu should be closed
    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  it('toggles the dropdown when button is clicked multiple times', () => {
    render(<Dropdown {...defaultProps} />);

    const button = screen.getByRole('button');

    // First click - open
    fireEvent.click(button);
    expect(screen.getByRole('menu')).toBeInTheDocument();

    // Second click - close
    fireEvent.click(button);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    // Third click - open again
    fireEvent.click(button);
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('handles empty options array gracefully', () => {
    render(<Dropdown {...defaultProps} options={[]} />);

    // Open dropdown
    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Only the "All" option should be visible - use getAllByRole instead of getByText
    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems.length).toBe(1);
    expect(menuItems[0]).toHaveTextContent('All');
  });
});
