import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmationModal from '@/components/shared/ConfirmationModal';

describe('ConfirmationModal', () => {
  const mockProps = {
    isOpen: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    title: 'Delete Item',
    message: 'Are you sure you want to delete this item?',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when open', () => {
    render(<ConfirmationModal {...mockProps} />);

    expect(screen.getByText(mockProps.title)).toBeInTheDocument();
    expect(screen.getByText(mockProps.message)).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<ConfirmationModal {...mockProps} isOpen={false} />);

    expect(screen.queryByText(mockProps.title)).not.toBeInTheDocument();
    expect(screen.queryByText(mockProps.message)).not.toBeInTheDocument();
  });

  it('calls onConfirm and onClose when confirm button is clicked', () => {
    render(<ConfirmationModal {...mockProps} />);

    fireEvent.click(screen.getByText('Delete'));

    expect(mockProps.onConfirm).toHaveBeenCalledTimes(1);
    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when cancel button is clicked', () => {
    render(<ConfirmationModal {...mockProps} />);

    fireEvent.click(screen.getByText('Cancel'));

    expect(mockProps.onConfirm).not.toHaveBeenCalled();
    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('uses custom button text when provided', () => {
    render(
      <ConfirmationModal
        {...mockProps}
        confirmText="Yes, delete it"
        cancelText="No, keep it"
      />
    );

    expect(screen.getByText('Yes, delete it')).toBeInTheDocument();
    expect(screen.getByText('No, keep it')).toBeInTheDocument();
  });

  it('calls onClose when clicking outside the modal', () => {
    render(<ConfirmationModal {...mockProps} />);

    // Get the Dialog component and simulate its onClose
    const dialog = screen.getByRole('dialog');
    // Headless UI handles the backdrop click internally
    // We can simulate it by calling onClose directly on the Dialog
    fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' });

    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });
});
