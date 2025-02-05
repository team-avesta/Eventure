import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import EditScreenshotNameModal from '@/components/screenshots/EditScreenshotNameModal';

describe('EditScreenshotNameModal', () => {
  const mockProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSave: jest.fn(),
    currentName: 'test-screenshot.png',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders modal when open', async () => {
    await act(async () => {
      render(<EditScreenshotNameModal {...mockProps} />);
    });

    expect(screen.getByText('Edit Screenshot Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
  });

  it('does not render when closed', async () => {
    await act(async () => {
      render(<EditScreenshotNameModal {...mockProps} isOpen={false} />);
    });

    expect(screen.queryByText('Edit Screenshot Name')).not.toBeInTheDocument();
  });

  it('initializes input with current name', async () => {
    await act(async () => {
      render(<EditScreenshotNameModal {...mockProps} />);
    });

    expect(screen.getByLabelText('Name')).toHaveValue('test-screenshot.png');
  });

  it('handles name change', async () => {
    await act(async () => {
      render(<EditScreenshotNameModal {...mockProps} />);
    });

    const input = screen.getByLabelText('Name');
    await act(async () => {
      fireEvent.change(input, { target: { value: 'new-name.png' } });
    });

    expect(input).toHaveValue('new-name.png');
  });

  it('disables save button when name is empty', async () => {
    await act(async () => {
      render(<EditScreenshotNameModal {...mockProps} />);
    });

    const input = screen.getByLabelText('Name');
    await act(async () => {
      fireEvent.change(input, { target: { value: '' } });
    });

    expect(screen.getByText('Save Changes')).toBeDisabled();
  });

  it('disables save button when name is unchanged', async () => {
    await act(async () => {
      render(<EditScreenshotNameModal {...mockProps} />);
    });

    const input = screen.getByLabelText('Name');
    await act(async () => {
      fireEvent.change(input, { target: { value: 'test-screenshot.png' } });
    });

    expect(screen.getByText('Save Changes')).toBeDisabled();
  });

  it('enables save button when name is valid and changed', async () => {
    await act(async () => {
      render(<EditScreenshotNameModal {...mockProps} />);
    });

    const input = screen.getByLabelText('Name');
    await act(async () => {
      fireEvent.change(input, { target: { value: 'new-name.png' } });
    });

    expect(screen.getByText('Save Changes')).not.toBeDisabled();
  });

  it('calls onSave with trimmed name and closes modal on form submission', async () => {
    await act(async () => {
      render(<EditScreenshotNameModal {...mockProps} />);
    });

    const input = screen.getByLabelText('Name');
    await act(async () => {
      fireEvent.change(input, { target: { value: '  new-name.png  ' } });
    });

    const form = screen.getByRole('form');
    await act(async () => {
      fireEvent.submit(form);
    });

    expect(mockProps.onSave).toHaveBeenCalledWith('new-name.png');
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('calls onClose when cancel button is clicked', async () => {
    await act(async () => {
      render(<EditScreenshotNameModal {...mockProps} />);
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Cancel'));
    });

    expect(mockProps.onClose).toHaveBeenCalled();
    expect(mockProps.onSave).not.toHaveBeenCalled();
  });

  it('calls onClose when clicking outside the modal', async () => {
    await act(async () => {
      render(<EditScreenshotNameModal {...mockProps} />);
    });

    const dialog = screen.getByRole('dialog');
    await act(async () => {
      fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' });
    });

    expect(mockProps.onClose).toHaveBeenCalled();
    expect(mockProps.onSave).not.toHaveBeenCalled();
  });
});
