import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PageLabelModal from '@/components/admin/modals/PageLabelModal';
import { PageLabel } from '@/types/pageLabel';

// Mock headlessui Dialog component
jest.mock('@headlessui/react', () => {
  const DialogComponent = ({ children, open, onClose, className }: any) =>
    open ? (
      <div data-testid="dialog" className={className}>
        {children}
      </div>
    ) : null;

  const DialogPanel = ({ children, className }: any) => (
    <div data-testid="dialog-panel" className={className}>
      {children}
    </div>
  );

  const DialogTitle = ({ children, as: Component = 'h3', className }: any) => (
    <Component data-testid="dialog-title" className={className}>
      {children}
    </Component>
  );

  // Add display names
  DialogComponent.displayName = 'Dialog';
  DialogPanel.displayName = 'DialogPanel';
  DialogTitle.displayName = 'DialogTitle';

  // Set Panel and Title as properties of Dialog
  DialogComponent.Panel = DialogPanel;
  DialogComponent.Title = DialogTitle;

  return { Dialog: DialogComponent };
});

// Mock Input component
jest.mock('@/components/shared/Input', () => ({
  Input: ({ id, label, value, onChange, required, placeholder }: any) => (
    <div data-testid="input-component">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        data-testid={`input-${id}`}
      />
    </div>
  ),
}));

// Mock Button component
jest.mock('@/components/shared/Button', () => ({
  Button: ({ children, type, variant, onClick, disabled, isLoading }: any) => (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      data-testid={`button-${type === 'submit' ? 'submit' : 'cancel'}`}
      data-variant={variant}
      data-loading={isLoading ? 'true' : 'false'}
    >
      {children}
    </button>
  ),
}));

describe('PageLabelModal component', () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();
  const mockInitialData: PageLabel = {
    id: 'label-1',
    name: 'Test Label',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <PageLabelModal
        isOpen={false}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isSubmitting={false}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders the modal when isOpen is true', () => {
    render(
      <PageLabelModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isSubmitting={false}
      />
    );

    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-panel')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-title')).toBeInTheDocument();
  });

  it('displays "Add Page Label" title when no initialData is provided', () => {
    render(
      <PageLabelModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        isSubmitting={false}
      />
    );

    expect(screen.getByTestId('dialog-title')).toHaveTextContent(
      'Add Page Label'
    );
  });

  it('displays "Edit Page Label" title when initialData is provided', async () => {
    await act(async () => {
      render(
        <PageLabelModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          isSubmitting={false}
          initialData={mockInitialData}
        />
      );
    });

    expect(screen.getByTestId('dialog-title')).toHaveTextContent(
      'Edit Page Label'
    );
  });

  it('initializes input with empty value when no initialData is provided', async () => {
    await act(async () => {
      render(
        <PageLabelModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );
    });

    const input = screen.getByTestId('input-name');
    expect(input).toHaveValue('');
  });

  it('initializes input with initialData name when provided', async () => {
    await act(async () => {
      render(
        <PageLabelModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          isSubmitting={false}
          initialData={mockInitialData}
        />
      );
    });

    const input = screen.getByTestId('input-name');
    expect(input).toHaveValue('Test Label');
  });

  it('updates input value when user types', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(
        <PageLabelModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );
    });

    const input = screen.getByTestId('input-name');

    await act(async () => {
      await user.type(input, 'New Label');
    });

    expect(input).toHaveValue('New Label');
  });

  it('calls onSubmit with trimmed input value when form is submitted', async () => {
    await act(async () => {
      render(
        <PageLabelModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );
    });

    const input = screen.getByTestId('input-name');

    await act(async () => {
      fireEvent.change(input, { target: { value: '  New Label  ' } });
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('button-submit'));
    });

    expect(mockOnSubmit).toHaveBeenCalledWith({ name: 'New Label' });
  });

  it('calls onClose when cancel button is clicked', async () => {
    await act(async () => {
      render(
        <PageLabelModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('button-cancel'));
    });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('disables buttons when isSubmitting is true', async () => {
    await act(async () => {
      render(
        <PageLabelModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          isSubmitting={true}
        />
      );
    });

    const cancelButton = screen.getByTestId('button-cancel');
    const submitButton = screen.getByTestId('button-submit');

    expect(cancelButton).toBeDisabled();
    expect(submitButton).toHaveAttribute('data-loading', 'true');
  });

  it('shows "Create" text on submit button when adding new label', async () => {
    await act(async () => {
      render(
        <PageLabelModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );
    });

    const submitButton = screen.getByTestId('button-submit');
    expect(submitButton).toHaveTextContent('Create');
  });

  it('shows "Update" text on submit button when editing existing label', async () => {
    await act(async () => {
      render(
        <PageLabelModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          isSubmitting={false}
          initialData={mockInitialData}
        />
      );
    });

    const submitButton = screen.getByTestId('button-submit');
    expect(submitButton).toHaveTextContent('Update');
  });

  it('resets input when initialData changes', async () => {
    let rerender: any;

    await act(async () => {
      const result = render(
        <PageLabelModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          isSubmitting={false}
          initialData={mockInitialData}
        />
      );
      rerender = result.rerender;
    });

    const input = screen.getByTestId('input-name');
    expect(input).toHaveValue('Test Label');

    // Change initialData
    const newInitialData = {
      ...mockInitialData,
      name: 'Updated Label',
    };

    await act(async () => {
      rerender(
        <PageLabelModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          isSubmitting={false}
          initialData={newInitialData}
        />
      );
    });

    expect(input).toHaveValue('Updated Label');
  });

  it('resets input when switching from edit to create mode', async () => {
    let rerender: any;

    await act(async () => {
      const result = render(
        <PageLabelModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          isSubmitting={false}
          initialData={mockInitialData}
        />
      );
      rerender = result.rerender;
    });

    const input = screen.getByTestId('input-name');
    expect(input).toHaveValue('Test Label');

    // Switch to create mode (no initialData)
    await act(async () => {
      rerender(
        <PageLabelModal
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />
      );
    });

    expect(input).toHaveValue('');
  });
});
