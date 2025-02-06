import { render, screen, fireEvent } from '@testing-library/react';
import ScreenshotUpload from '@/components/screenshots/ScreenshotUpload';
import { Module } from '@/services/adminS3Service';
import { useScreenshotUpload } from '@/hooks/useScreenshotUpload';

// Mock the custom hook
jest.mock('@/hooks/useScreenshotUpload', () => ({
  useScreenshotUpload: jest.fn(),
}));

describe('ScreenshotUpload', () => {
  const mockModules: Module[] = [
    {
      id: '1',
      key: 'module1',
      name: 'Module 1',
      screenshots: [],
    },
    {
      id: '2',
      key: 'module2',
      name: 'Module 2',
      screenshots: [],
    },
  ];

  const mockHookReturn = {
    file: null,
    setFile: jest.fn(),
    pageName: '',
    setPageName: jest.fn(),
    customName: '',
    setCustomName: jest.fn(),
    error: '',
    fileInputRef: { current: null },
    isUploading: false,
    handleSubmit: jest.fn((e) => e.preventDefault()),
  };

  beforeEach(() => {
    (useScreenshotUpload as jest.Mock).mockReturnValue(mockHookReturn);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form elements correctly', () => {
    render(<ScreenshotUpload modules={mockModules} />);

    // Check for module select
    expect(screen.getByLabelText('Module')).toBeInTheDocument();
    expect(screen.getByText('Select a module')).toBeInTheDocument();
    expect(screen.getByText('Module 1')).toBeInTheDocument();
    expect(screen.getByText('Module 2')).toBeInTheDocument();

    // Check for screenshot name input
    expect(screen.getByLabelText('Screenshot Name')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(
        'Enter a descriptive name for this screenshot'
      )
    ).toBeInTheDocument();

    // Check for file upload
    expect(screen.getByText('Upload a file')).toBeInTheDocument();
    expect(screen.getByText('or drag and drop')).toBeInTheDocument();

    // Check for submit button
    expect(
      screen.getByRole('button', { name: 'Upload Screenshot' })
    ).toBeInTheDocument();
  });

  it('handles module selection', () => {
    render(<ScreenshotUpload modules={mockModules} />);

    const select = screen.getByLabelText('Module');
    fireEvent.change(select, { target: { value: 'module1' } });

    expect(mockHookReturn.setPageName).toHaveBeenCalledWith('module1');
  });

  it('handles screenshot name input', () => {
    render(<ScreenshotUpload modules={mockModules} />);

    const input = screen.getByLabelText('Screenshot Name');
    fireEvent.change(input, { target: { value: 'Test Screenshot' } });

    expect(mockHookReturn.setCustomName).toHaveBeenCalledWith(
      'Test Screenshot'
    );
  });

  it('handles form submission', () => {
    render(<ScreenshotUpload modules={mockModules} />);

    const submitButton = screen.getByRole('button', {
      name: 'Upload Screenshot',
    });
    fireEvent.click(submitButton);

    expect(mockHookReturn.handleSubmit).toHaveBeenCalled();
  });

  it('displays error message when present', () => {
    const mockError = 'Test error message';
    (useScreenshotUpload as jest.Mock).mockReturnValue({
      ...mockHookReturn,
      error: mockError,
    });

    render(<ScreenshotUpload modules={mockModules} />);

    expect(screen.getByText(mockError)).toBeInTheDocument();
  });

  it('shows loading state during upload', () => {
    (useScreenshotUpload as jest.Mock).mockReturnValue({
      ...mockHookReturn,
      isUploading: true,
    });

    render(<ScreenshotUpload modules={mockModules} />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('calls onSuccess callback when provided', () => {
    const onSuccess = jest.fn();
    render(<ScreenshotUpload modules={mockModules} onSuccess={onSuccess} />);

    // Verify that onSuccess was passed to the hook
    expect(useScreenshotUpload).toHaveBeenCalledWith({ onSuccess });
  });

  it('handles empty modules array', () => {
    render(<ScreenshotUpload modules={[]} />);

    const select = screen.getByLabelText('Module');
    expect(select).toBeInTheDocument();
    expect(screen.getByText('Select a module')).toBeInTheDocument();
    expect(screen.queryByText('Module 1')).not.toBeInTheDocument();
  });
});
