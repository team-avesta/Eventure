import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ScreenshotUpload from '@/components/screenshots/ScreenshotUpload';
import { Module } from '@/services/adminS3Service';
import { useScreenshotUpload } from '@/hooks/useScreenshotUpload';
import { act } from 'react';
import { pageLabelService } from '@/services/pageLabelService';
import { PageLabel } from '@/types/pageLabel';

// Mock the custom hook
jest.mock('@/hooks/useScreenshotUpload', () => ({
  useScreenshotUpload: jest.fn(),
}));

// Mock the pageLabelService
jest.mock('@/services/pageLabelService', () => ({
  pageLabelService: {
    getAllLabels: jest.fn(),
  },
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

  const mockLabels: PageLabel[] = [
    { id: 'label1', name: 'Label 1' },
    { id: 'label2', name: 'Label 2' },
  ];

  const mockHookReturn = {
    file: null,
    setFile: jest.fn(),
    pageName: '',
    setPageName: jest.fn(),
    customName: '',
    setCustomName: jest.fn(),
    setSelectedLabel: jest.fn(),
    error: '',
    fileInputRef: { current: null },
    isUploading: false,
    handleSubmit: jest.fn((e) => e.preventDefault()),
  };

  beforeEach(() => {
    (useScreenshotUpload as jest.Mock).mockReturnValue(mockHookReturn);
    (pageLabelService.getAllLabels as jest.Mock).mockResolvedValue(mockLabels);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form elements correctly', async () => {
    await act(async () => {
      render(<ScreenshotUpload modules={mockModules} />);
    });

    // Check for module select
    expect(screen.getByLabelText('Module')).toBeInTheDocument();
    expect(screen.getByText('Select a module')).toBeInTheDocument();
    expect(screen.getByText('Module 1')).toBeInTheDocument();
    expect(screen.getByText('Module 2')).toBeInTheDocument();

    // Check for label select
    expect(screen.getByLabelText('Label (Optional)')).toBeInTheDocument();
    expect(screen.getByText('Select a label (optional)')).toBeInTheDocument();
    expect(screen.getByText('Label 1')).toBeInTheDocument();
    expect(screen.getByText('Label 2')).toBeInTheDocument();

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

  it('fetches labels on mount', async () => {
    await act(async () => {
      render(<ScreenshotUpload modules={mockModules} />);
    });

    expect(pageLabelService.getAllLabels).toHaveBeenCalled();
  });

  it('handles label selection', async () => {
    await act(async () => {
      render(<ScreenshotUpload modules={mockModules} />);
    });

    const select = screen.getByLabelText('Label (Optional)');

    await act(async () => {
      fireEvent.change(select, { target: { value: 'label1' } });
    });

    expect(mockHookReturn.setSelectedLabel).toHaveBeenCalledWith('label1');
  });

  it('handles module selection', async () => {
    await act(async () => {
      render(<ScreenshotUpload modules={mockModules} />);
    });

    const select = screen.getByLabelText('Module');

    await act(async () => {
      fireEvent.change(select, { target: { value: 'module1' } });
    });

    expect(mockHookReturn.setPageName).toHaveBeenCalledWith('module1');
  });

  it('handles screenshot name input', async () => {
    await act(async () => {
      render(<ScreenshotUpload modules={mockModules} />);
    });

    const input = screen.getByLabelText('Screenshot Name');

    await act(async () => {
      fireEvent.change(input, { target: { value: 'Test Screenshot' } });
    });

    expect(mockHookReturn.setCustomName).toHaveBeenCalledWith(
      'Test Screenshot'
    );
  });

  it('handles form submission', async () => {
    await act(async () => {
      render(<ScreenshotUpload modules={mockModules} />);
    });

    const submitButton = screen.getByRole('button', {
      name: 'Upload Screenshot',
    });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(mockHookReturn.handleSubmit).toHaveBeenCalled();
  });

  it('displays error message when present', async () => {
    const mockError = 'Test error message';
    (useScreenshotUpload as jest.Mock).mockReturnValue({
      ...mockHookReturn,
      error: mockError,
    });

    await act(async () => {
      render(<ScreenshotUpload modules={mockModules} />);
    });

    expect(screen.getByText(mockError)).toBeInTheDocument();
  });

  it('shows loading state during upload', async () => {
    (useScreenshotUpload as jest.Mock).mockReturnValue({
      ...mockHookReturn,
      isUploading: true,
    });

    await act(async () => {
      render(<ScreenshotUpload modules={mockModules} />);
    });

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('calls onSuccess callback when provided', async () => {
    const onSuccess = jest.fn();

    await act(async () => {
      render(<ScreenshotUpload modules={mockModules} onSuccess={onSuccess} />);
    });

    // Verify that onSuccess was passed to the hook
    expect(useScreenshotUpload).toHaveBeenCalledWith({ onSuccess });
  });

  it('handles empty modules array', async () => {
    await act(async () => {
      render(<ScreenshotUpload modules={[]} />);
    });

    const select = screen.getByLabelText('Module');
    expect(select).toBeInTheDocument();
    expect(screen.getByText('Select a module')).toBeInTheDocument();
    expect(screen.queryByText('Module 1')).not.toBeInTheDocument();
  });

  it('does not show label select when no labels are available', async () => {
    (pageLabelService.getAllLabels as jest.Mock).mockResolvedValue([]);

    await act(async () => {
      render(<ScreenshotUpload modules={mockModules} />);
    });

    expect(screen.queryByLabelText('Label (Optional)')).not.toBeInTheDocument();
  });

  it('handles error when fetching labels', async () => {
    // Mock console.error before the error occurs
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    // Mock the getAllLabels function to reject with an error
    (pageLabelService.getAllLabels as jest.Mock).mockRejectedValue(
      new Error('Failed to fetch labels')
    );

    // Suppress the error that will be thrown during rendering
    await act(async () => {
      // The component will log the error but shouldn't crash
      render(<ScreenshotUpload modules={mockModules} />);
    });

    // Verify the component doesn't crash and still renders
    expect(screen.getByLabelText('Module')).toBeInTheDocument();

    // Clean up
    consoleSpy.mockRestore();
  });
});
