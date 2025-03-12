import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileUpload } from '@/components/shared/FileUpload';

const getDropZone = () => {
  const uploadText = screen.getByText('Upload a file');
  const dropZoneDiv = uploadText.closest('div')?.parentElement?.parentElement;
  if (!dropZoneDiv) throw new Error('Drop zone not found');
  return dropZoneDiv;
};

describe('FileUpload', () => {
  const mockOnChange = jest.fn();
  const mockFile = new File(['test'], 'test.png', { type: 'image/png' });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<FileUpload onChange={mockOnChange} />);

    expect(screen.getByText('Upload a file')).toBeInTheDocument();
    expect(screen.getByText('or drag and drop')).toBeInTheDocument();
    expect(screen.getByText('PNG, JPG, GIF up to 10MB')).toBeInTheDocument();
  });

  it('renders with custom label', () => {
    render(<FileUpload onChange={mockOnChange} label="Custom Label" />);

    const input = screen.getByLabelText('Custom Label');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'file');
  });

  it('shows error message when provided', () => {
    const errorMessage = 'Invalid file type';
    render(<FileUpload onChange={mockOnChange} error={errorMessage} />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('shows selected file name when file is selected', () => {
    render(<FileUpload onChange={mockOnChange} selectedFile={mockFile} />);

    expect(screen.getByText('Selected: test.png')).toBeInTheDocument();
  });

  it('accepts custom file types', () => {
    render(<FileUpload onChange={mockOnChange} accept=".pdf,.doc" />);

    const input = screen.getByLabelText('Screenshot');
    expect(input).toHaveAttribute('accept', '.pdf,.doc');
  });

  describe('File Selection', () => {
    it('calls onChange when file is selected via input', () => {
      render(<FileUpload onChange={mockOnChange} />);

      const input = screen.getByLabelText('Screenshot');
      fireEvent.change(input, {
        target: {
          files: [mockFile],
        },
      });

      expect(mockOnChange).toHaveBeenCalledWith(mockFile);
    });

    it('calls onChange with null when no file is selected', () => {
      render(<FileUpload onChange={mockOnChange} />);

      const input = screen.getByLabelText('Screenshot');
      fireEvent.change(input, {
        target: {
          files: [],
        },
      });

      expect(mockOnChange).toHaveBeenCalledWith(null);
    });
  });

  describe('Drag and Drop', () => {
    it('handles file drop correctly', () => {
      render(<FileUpload onChange={mockOnChange} />);

      const dropZone = getDropZone();
      expect(dropZone).toBeInTheDocument();

      // Mock DataTransfer
      const dataTransfer = {
        files: [mockFile],
      };

      // Trigger drop event
      fireEvent.drop(dropZone, {
        dataTransfer,
      });

      expect(mockOnChange).toHaveBeenCalledWith(mockFile);
    });

    it('prevents default behavior on dragOver', () => {
      render(<FileUpload onChange={mockOnChange} />);

      const dropZone = getDropZone();
      expect(dropZone).toBeInTheDocument();

      // Create a mock event
      const event = new Event('dragover', {
        bubbles: true,
        cancelable: true,
      });

      // Add preventDefault spy
      Object.defineProperty(event, 'preventDefault', {
        value: jest.fn(),
      });

      // Dispatch event
      dropZone.dispatchEvent(event);

      expect(event.preventDefault).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('uses provided input ref', () => {
      const ref = { current: null };
      render(<FileUpload onChange={mockOnChange} inputRef={ref as any} />);

      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });

    it('has accessible upload button', () => {
      render(<FileUpload onChange={mockOnChange} />);

      const label = screen.getByText('Upload a file').closest('label');
      expect(label).toHaveAttribute('for', 'file-upload');
      expect(label).toHaveClass('cursor-pointer');
    });
  });

  describe('Styling', () => {
    it('applies hover styles to drop zone', () => {
      render(<FileUpload onChange={mockOnChange} />);

      const dropZone = getDropZone();
      expect(dropZone).toHaveClass(
        'flex',
        'justify-center',
        'px-6',
        'pt-5',
        'pb-6',
        'border-2',
        'border-gray-300',
        'border-dashed',
        'rounded-md',
        'hover:border-primary',
        'transition-colors',
        'duration-200'
      );
    });

    it('applies correct styles to upload text', () => {
      render(<FileUpload onChange={mockOnChange} />);

      const label = screen.getByText('Upload a file').closest('label');
      expect(label).toHaveClass(
        'relative',
        'cursor-pointer',
        'rounded-md',
        'font-medium',
        'text-primary',
        'hover:text-primary-hover',
        'focus-within:outline-none'
      );
    });
  });
});
