import { render, screen, fireEvent } from '@testing-library/react';
import { LabelChip } from '@/components/common/LabelChip';

// Mock the Chip component
jest.mock('@/components/common/Chip', () => ({
  Chip: ({ label, icon, colorClasses, onClick, title, isClickable }: any) => (
    <div
      data-testid="chip-component"
      data-label={label}
      data-color-classes={colorClasses}
      data-title={title || null}
      data-is-clickable={isClickable ? 'true' : 'false'}
      onClick={onClick}
    >
      {icon && <span data-testid="chip-icon">{icon}</span>}
      {label}
    </div>
  ),
}));

describe('LabelChip component', () => {
  it('renders null when label is null and isAddButton is false', () => {
    const { container } = render(<LabelChip label={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders with label text', () => {
    render(<LabelChip label="Test Label" />);

    const chip = screen.getByTestId('chip-component');
    expect(chip).toHaveTextContent('Test Label');
    expect(chip).toHaveAttribute('data-label', 'Test Label');
  });

  it('renders with indigo color classes by default', () => {
    render(<LabelChip label="Test Label" />);

    const chip = screen.getByTestId('chip-component');
    expect(chip).toHaveAttribute(
      'data-color-classes',
      'bg-indigo-100 text-indigo-800'
    );
  });

  it('renders with label icon by default', () => {
    render(<LabelChip label="Test Label" />);

    const icon = screen.getByTestId('chip-icon');
    expect(icon).toBeInTheDocument();
    expect(icon.querySelector('svg')).toBeInTheDocument();
  });

  it('renders as add button when isAddButton is true', () => {
    render(<LabelChip label={null} isAddButton={true} />);

    const chip = screen.getByTestId('chip-component');
    expect(chip).toHaveTextContent('Add label');
    expect(chip).toHaveAttribute('data-label', 'Add label');
    expect(chip).toHaveAttribute(
      'data-color-classes',
      'bg-gray-100 text-gray-600 hover:bg-gray-200'
    );
  });

  it('renders add button icon when isAddButton is true', () => {
    render(<LabelChip label={null} isAddButton={true} />);

    const icon = screen.getByTestId('chip-icon');
    expect(icon).toBeInTheDocument();
    // The add button has a plus icon (path with d attribute containing "M12 6v6m0 0v6m0-6h6m-6 0H6")
    const svg = icon.querySelector('svg');
    const path = svg?.querySelector('path');
    expect(path).toHaveAttribute(
      'd',
      expect.stringContaining('M12 6v6m0 0v6m0-6h6m-6 0H6')
    );
  });

  it('calls onClick when clicked and onClick is provided', () => {
    const mockOnClick = jest.fn();
    render(<LabelChip label="Test Label" onClick={mockOnClick} />);

    const chip = screen.getByTestId('chip-component');
    fireEvent.click(chip);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('sets isClickable to true when onClick is provided', () => {
    const mockOnClick = jest.fn();
    render(
      <LabelChip label="Test Label" onClick={mockOnClick} isClickable={true} />
    );

    const chip = screen.getByTestId('chip-component');
    expect(chip).toHaveAttribute('data-is-clickable', 'true');
  });

  it('sets correct title when isClickable is true', () => {
    render(<LabelChip label="Test Label" isClickable={true} />);

    const chip = screen.getByTestId('chip-component');
    expect(chip).toHaveAttribute('data-title', 'Click to change label');
  });

  it('sets correct title when isAddButton and isClickable are true', () => {
    render(<LabelChip label={null} isAddButton={true} isClickable={true} />);

    const chip = screen.getByTestId('chip-component');
    expect(chip).toHaveAttribute('data-title', 'Add label');
  });

  it('does not set title when isClickable is false', () => {
    render(<LabelChip label="Test Label" isClickable={false} />);

    const chip = screen.getByTestId('chip-component');
    expect(chip).not.toHaveAttribute('data-title');
  });

  it('renders with empty string when label is empty string', () => {
    // LabelChip returns null when label is empty string and isAddButton is false
    const { container } = render(<LabelChip label="" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders correctly with empty string when isAddButton is true', () => {
    render(<LabelChip label="" isAddButton={true} />);

    const chip = screen.getByTestId('chip-component');
    expect(chip).toHaveAttribute('data-label', 'Add label');
  });
});
