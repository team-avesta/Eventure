import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from '@/components/common/Modal';

// Mock headlessui components
jest.mock('@headlessui/react', () => {
  const DialogComponent = ({ children, onClose, ...props }: any) => (
    <div
      role="dialog"
      onClick={(e) => {
        // Only trigger onClose if clicking directly on the dialog (overlay)
        if (e.target === e.currentTarget) {
          onClose?.();
        }
      }}
      {...props}
    >
      {typeof children === 'function' ? children({}) : children}
    </div>
  );
  DialogComponent.displayName = 'Dialog';

  const Panel = ({ children }: any) => (
    <div onClick={(e) => e.stopPropagation()}>{children}</div>
  );
  Panel.displayName = 'Dialog.Panel';

  const Title = ({ children, className }: any) => (
    <h3 className={className}>{children}</h3>
  );
  Title.displayName = 'Dialog.Title';

  DialogComponent.Panel = Panel;
  DialogComponent.Title = Title;

  return {
    Dialog: DialogComponent,
    Transition: {
      Root: ({ show, children }: any) => (show ? children : null),
      Child: ({ children }: any) => children,
    },
  };
});

// Mock heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  XMarkIcon: () => <div data-testid="close-icon" />,
}));

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    title: 'Test Modal',
    children: <div>Modal content</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when isOpen is true', () => {
    render(<Modal {...defaultProps} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<Modal {...defaultProps} isOpen={false} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });

  describe('Close Button', () => {
    it('renders close button with correct accessibility', () => {
      render(<Modal {...defaultProps} />);

      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toBeInTheDocument();
      expect(screen.getByTestId('close-icon')).toBeInTheDocument();
      expect(screen.getByText('Close')).toHaveClass('sr-only');
    });

    it('calls onClose when close button is clicked', async () => {
      render(<Modal {...defaultProps} />);

      const closeButton = screen.getByRole('button', { name: /close/i });
      await userEvent.click(closeButton);

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Action Buttons', () => {
    it('renders submit button when onSubmit is provided', () => {
      const handleSubmit = jest.fn();
      render(
        <Modal {...defaultProps} onSubmit={handleSubmit} submitLabel="Save" />
      );

      const submitButton = screen.getByRole('button', { name: 'Save' });
      expect(submitButton).toBeInTheDocument();
    });

    it('does not render submit button when onSubmit is not provided', () => {
      render(<Modal {...defaultProps} />);

      expect(
        screen.queryByRole('button', { name: 'Submit' })
      ).not.toBeInTheDocument();
    });

    it('renders cancel button by default', () => {
      render(<Modal {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      expect(cancelButton).toBeInTheDocument();
    });

    it('does not render cancel button when showCancelButton is false', () => {
      render(<Modal {...defaultProps} showCancelButton={false} />);

      expect(
        screen.queryByRole('button', { name: 'Cancel' })
      ).not.toBeInTheDocument();
    });

    it('calls onSubmit when submit button is clicked', async () => {
      const handleSubmit = jest.fn();
      render(<Modal {...defaultProps} onSubmit={handleSubmit} />);

      const submitButton = screen.getByRole('button', { name: 'Submit' });
      await userEvent.click(submitButton);

      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when cancel button is clicked', async () => {
      render(<Modal {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      await userEvent.click(cancelButton);

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Loading State', () => {
    it('disables submit button and shows loading state when isSubmitting is true', () => {
      render(<Modal {...defaultProps} onSubmit={jest.fn()} isSubmitting />);

      const submitButton = screen.getByRole('button', { name: /loading/i });
      expect(submitButton).toBeDisabled();
    });

    it('disables cancel button when isSubmitting is true', () => {
      render(<Modal {...defaultProps} isSubmitting />);

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      expect(cancelButton).toBeDisabled();
    });
  });

  describe('Disabled State', () => {
    it('disables submit button when isSubmitDisabled is true', () => {
      render(<Modal {...defaultProps} onSubmit={jest.fn()} isSubmitDisabled />);

      const submitButton = screen.getByRole('button', { name: 'Submit' });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Styling', () => {
    it('applies correct styles to modal panel', () => {
      render(<Modal {...defaultProps} />);

      const panel = screen.getByRole('dialog');
      expect(panel).toHaveClass('relative', 'z-50');
    });

    it('applies correct styles to title', () => {
      render(<Modal {...defaultProps} />);

      const title = screen.getByRole('heading', { name: 'Test Modal' });
      expect(title).toHaveClass(
        'text-xl',
        'font-semibold',
        'leading-6',
        'text-gray-900',
        'mb-6'
      );
    });
  });

  describe('Accessibility', () => {
    it('closes modal when clicking outside (overlay)', async () => {
      render(<Modal {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      await userEvent.click(dialog); // Click outside the panel

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
  });
});
