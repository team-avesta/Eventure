import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ActionButtons from '@/components/screenshots/detail/Header/ActionButtons';

// Mock the Switch component
jest.mock('@/components/common/Switch', () => {
  return function MockSwitch({
    isDraggable,
    setIsDraggable,
  }: {
    isDraggable: boolean;
    setIsDraggable: (value: boolean) => void;
  }) {
    return (
      <div data-testid="mock-switch">
        <button
          data-testid="toggle-switch"
          onClick={() => setIsDraggable(!isDraggable)}
        >
          {isDraggable ? 'Draggable: On' : 'Draggable: Off'}
        </button>
      </div>
    );
  };
});

describe('ActionButtons', () => {
  const defaultProps = {
    userRole: 'admin',
    isDraggable: false,
    setIsDraggable: jest.fn(),
    onAddEventClick: jest.fn(),
    onReplaceImageClick: jest.fn(),
    fileInputRef: {
      current: document.createElement('input'),
    } as React.RefObject<HTMLInputElement>,
    handleFileChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly for admin users', () => {
    render(<ActionButtons {...defaultProps} />);

    expect(screen.getByText('Add Event')).toBeInTheDocument();
    expect(screen.getByText('Replace Image')).toBeInTheDocument();
    expect(screen.getByTestId('mock-switch')).toBeInTheDocument();
  });

  it('does not render for non-admin users', () => {
    render(<ActionButtons {...defaultProps} userRole="user" />);

    expect(screen.queryByText('Add Event')).not.toBeInTheDocument();
    expect(screen.queryByText('Replace Image')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mock-switch')).not.toBeInTheDocument();
  });

  it('calls onAddEventClick when Add Event button is clicked', async () => {
    const user = userEvent.setup();
    render(<ActionButtons {...defaultProps} />);

    await user.click(screen.getByText('Add Event'));
    expect(defaultProps.onAddEventClick).toHaveBeenCalledTimes(1);
  });

  it('calls onReplaceImageClick when Replace Image button is clicked', async () => {
    const user = userEvent.setup();
    render(<ActionButtons {...defaultProps} />);

    await user.click(screen.getByText('Replace Image'));
    expect(defaultProps.onReplaceImageClick).toHaveBeenCalledTimes(1);
  });

  it('has a hidden file input with correct props', () => {
    const { container } = render(<ActionButtons {...defaultProps} />);

    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).toHaveClass('hidden');
    expect(fileInput).toHaveAttribute('accept', 'image/*');
  });

  it('calls handleFileChange when file is selected', async () => {
    const { container } = render(<ActionButtons {...defaultProps} />);

    const fileInput = container.querySelector('input[type="file"]');
    const file = new File(['test'], 'test.png', { type: 'image/png' });

    // Simulate file selection
    if (fileInput) {
      fireEvent.change(fileInput, { target: { files: [file] } });
    }

    expect(defaultProps.handleFileChange).toHaveBeenCalledTimes(1);
  });

  it('toggles isDraggable when switch is clicked', async () => {
    const user = userEvent.setup();
    render(<ActionButtons {...defaultProps} />);

    await user.click(screen.getByTestId('toggle-switch'));
    expect(defaultProps.setIsDraggable).toHaveBeenCalledWith(true);
  });
});
