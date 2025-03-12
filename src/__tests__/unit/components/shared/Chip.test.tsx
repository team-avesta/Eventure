import { render, screen, fireEvent } from '@testing-library/react';
import { Chip } from '@/components/shared/Chip';

describe('Chip component', () => {
  const defaultProps = {
    label: 'Test Chip',
    colorClasses: 'bg-blue-100 text-blue-800',
  };

  it('renders with required props', () => {
    render(<Chip {...defaultProps} />);

    const chip = screen.getByText('Test Chip');
    expect(chip).toBeInTheDocument();
    expect(chip.classList.contains('bg-blue-100')).toBe(true);
    expect(chip.classList.contains('text-blue-800')).toBe(true);
  });

  it('renders as a div by default when no onClick is provided', () => {
    render(<Chip {...defaultProps} />);

    const chip = screen.getByText('Test Chip');
    expect(chip.tagName).toBe('DIV');
  });

  it('renders as a span when onClick is provided', () => {
    const handleClick = jest.fn();
    render(<Chip {...defaultProps} onClick={handleClick} />);

    const chip = screen.getByText('Test Chip');
    expect(chip.tagName).toBe('SPAN');
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Chip {...defaultProps} onClick={handleClick} />);

    const chip = screen.getByText('Test Chip');
    fireEvent.click(chip);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders with an icon when provided', () => {
    const icon = <svg data-testid="test-icon" />;
    render(<Chip {...defaultProps} icon={icon} />);

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(screen.getByText('Test Chip')).toBeInTheDocument();
  });

  it('applies clickable styles when isClickable is true', () => {
    render(<Chip {...defaultProps} isClickable={true} />);

    const chip = screen.getByText('Test Chip');
    expect(chip.classList.contains('hover:opacity-80')).toBe(true);
    expect(chip.classList.contains('cursor-pointer')).toBe(true);
    expect(chip.classList.contains('pointer-events-auto')).toBe(true);
  });

  it('does not apply clickable styles when isClickable is false', () => {
    render(<Chip {...defaultProps} isClickable={false} />);

    const chip = screen.getByText('Test Chip');
    expect(chip.classList.contains('hover:opacity-80')).toBe(false);
    expect(chip.classList.contains('cursor-pointer')).toBe(false);
    expect(chip.classList.contains('pointer-events-auto')).toBe(false);
  });

  it('applies title attribute when provided', () => {
    render(<Chip {...defaultProps} title="Chip Title" />);

    const chip = screen.getByText('Test Chip');
    expect(chip).toHaveAttribute('title', 'Chip Title');
  });

  it('prevents event propagation when clicked', () => {
    const handleClick = jest.fn();
    const handleParentClick = jest.fn();

    render(
      <div onClick={handleParentClick}>
        <Chip {...defaultProps} onClick={handleClick} />
      </div>
    );

    const chip = screen.getByText('Test Chip');
    fireEvent.click(chip);

    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleParentClick).not.toHaveBeenCalled();
  });

  it('applies multiple color classes correctly', () => {
    const colorClasses = 'bg-red-100 text-red-800 border-red-200';
    render(<Chip {...defaultProps} colorClasses={colorClasses} />);

    const chip = screen.getByText('Test Chip');
    expect(chip.classList.contains('bg-red-100')).toBe(true);
    expect(chip.classList.contains('text-red-800')).toBe(true);
    expect(chip.classList.contains('border-red-200')).toBe(true);
  });
});
