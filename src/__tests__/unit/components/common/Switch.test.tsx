import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Switch from '@/components/common/Switch';

describe('Switch Component', () => {
  const mockSetIsDraggable = jest.fn();

  beforeEach(() => {
    mockSetIsDraggable.mockClear();
  });

  it('renders correctly when draggable is false', () => {
    render(<Switch isDraggable={false} setIsDraggable={mockSetIsDraggable} />);

    // Check if the component renders with the correct label
    expect(screen.getByText('Drag')).toBeInTheDocument();

    // Check if the switch is in the off position
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('renders correctly when draggable is true', () => {
    render(<Switch isDraggable={true} setIsDraggable={mockSetIsDraggable} />);

    // Check if the component renders with the correct label
    expect(screen.getByText('Drag')).toBeInTheDocument();

    // Check if the switch is in the on position
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('toggles the switch when clicked', async () => {
    const user = userEvent.setup();

    // Start with draggable false
    render(<Switch isDraggable={false} setIsDraggable={mockSetIsDraggable} />);

    // Click the switch
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    // Check if setIsDraggable was called with true
    expect(mockSetIsDraggable).toHaveBeenCalledWith(true);
  });

  it('toggles from true to false when clicked', async () => {
    const user = userEvent.setup();

    // Start with draggable true
    render(<Switch isDraggable={true} setIsDraggable={mockSetIsDraggable} />);

    // Click the switch
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    // Check if setIsDraggable was called with false
    expect(mockSetIsDraggable).toHaveBeenCalledWith(false);
  });

  it('has the correct accessibility attributes', () => {
    render(<Switch isDraggable={false} setIsDraggable={mockSetIsDraggable} />);

    const checkbox = screen.getByRole('checkbox');

    // Check accessibility attributes
    expect(checkbox).toHaveAttribute('type', 'checkbox');
    expect(checkbox).not.toBeChecked();
  });
});
