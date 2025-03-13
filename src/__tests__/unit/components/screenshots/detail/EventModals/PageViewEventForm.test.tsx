import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PageViewEventForm from '@/components/screenshots/detail/EventModals/PageViewEventForm';
import { useDropdownData } from '@/hooks/useDropdownData';
import { FormState } from '@/types/types';

// Mock the hooks
jest.mock('@/hooks/useDropdownData', () => ({
  useDropdownData: jest.fn(),
}));

// Define types for mock components
interface AutocompleteProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  required?: boolean;
}

interface TextareaProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
}

interface InputFieldProps {
  id: string;
  label: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
  required?: boolean;
  placeholder?: string;
}

interface DimensionsSectionProps {
  dimensions: string[];
  selectedDimensions: string[];
  onDimensionChange: (dimension: string, checked: boolean) => void;
}

// Mock the components
jest.mock('@/components/shared/Autocomplete', () => ({
  Autocomplete: ({
    id,
    label,
    value,
    onChange,
    options,
    placeholder,
    required,
  }: AutocompleteProps) => (
    <div data-testid={`autocomplete-${id}`}>
      <label>
        {label} {required && '*'}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        data-testid={`autocomplete-input-${id}`}
      />
      <div data-testid={`autocomplete-options-${id}`}>
        {options.map((option: string) => (
          <div
            key={option}
            data-testid={`option-${option.replace(/\s+/g, '-').toLowerCase()}`}
            onClick={() => onChange(option)}
          >
            {option}
          </div>
        ))}
      </div>
    </div>
  ),
}));

jest.mock('@/components/shared/Textarea', () => ({
  Textarea: ({ id, label, value, onChange, rows }: TextareaProps) => (
    <div data-testid={`textarea-${id}`}>
      <label>{label}</label>
      <textarea
        value={value}
        onChange={onChange}
        rows={rows}
        data-testid={`textarea-input-${id}`}
      />
    </div>
  ),
}));

jest.mock('@/components/shared/InputField', () => ({
  __esModule: true,
  default: ({
    id,
    label,
    value,
    onChange,
    readOnly,
    required,
    placeholder,
  }: InputFieldProps) => (
    <div data-testid={`input-${id}`}>
      <label>
        {label} {required && '*'}
      </label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        placeholder={placeholder}
        data-testid={`input-field-${id}`}
      />
    </div>
  ),
}));

jest.mock('@/components/shared/DimensionsSection', () => ({
  __esModule: true,
  default: ({
    dimensions,
    selectedDimensions,
    onDimensionChange,
  }: DimensionsSectionProps) => (
    <div data-testid="dimensions-section">
      <div data-testid="dimensions-count">{selectedDimensions.length}</div>
      <div data-testid="dimensions-total">{dimensions.length}</div>
    </div>
  ),
}));

describe('PageViewEventForm', () => {
  const mockSetFormData = jest.fn();
  const mockHandleDimensionChange = jest.fn();
  const mockGetPageById = jest.fn();
  const mockGetPageByTitle = jest.fn();
  const mockFormData: FormState = {
    description: 'Test description',
    customUrl: 'https://example.com/page1',
    dimensions: ['dimension1', 'dimension2'],
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock the useDropdownData hook
    mockGetPageById.mockImplementation((id) => {
      if (id === 'page1') {
        return {
          id: 'page1',
          title: 'Page 1',
          url: 'https://example.com/page1',
        };
      }
      if (id === 'page2') {
        return {
          id: 'page2',
          title: 'Page 2',
          url: 'https://example.com/page2',
        };
      }
      return null;
    });

    mockGetPageByTitle.mockImplementation((title) => {
      if (title === 'Page 1') {
        return {
          id: 'page1',
          title: 'Page 1',
          url: 'https://example.com/page1',
        };
      }
      if (title === 'Page 2') {
        return {
          id: 'page2',
          title: 'Page 2',
          url: 'https://example.com/page2',
        };
      }
      return null;
    });

    (useDropdownData as jest.Mock).mockReturnValue({
      data: {
        pageData: [
          { id: 'page1', title: 'Page 1', url: 'https://example.com/page1' },
          { id: 'page2', title: 'Page 2', url: 'https://example.com/page2' },
        ],
        dimensions: ['dimension1', 'dimension2', 'dimension3', 'dimension4'],
      },
      getPageById: mockGetPageById,
      getPageByTitle: mockGetPageByTitle,
    });
  });

  it('renders all form fields correctly', () => {
    render(
      <PageViewEventForm
        formData={mockFormData}
        setFormData={mockSetFormData}
        handleDimensionChange={mockHandleDimensionChange}
      />
    );

    // Check if all components are rendered
    expect(screen.getByTestId('textarea-description')).toBeInTheDocument();
    expect(screen.getByTestId('autocomplete-customTitle')).toBeInTheDocument();
    expect(screen.getByTestId('input-customUrl')).toBeInTheDocument();
    expect(screen.getByTestId('dimensions-section')).toBeInTheDocument();
  });

  it('displays the correct initial values from formData', () => {
    render(
      <PageViewEventForm
        formData={mockFormData}
        setFormData={mockSetFormData}
        handleDimensionChange={mockHandleDimensionChange}
      />
    );

    expect(screen.getByTestId('textarea-input-description')).toHaveValue(
      'Test description'
    );
    expect(screen.getByTestId('autocomplete-input-customTitle')).toHaveValue(
      ''
    );
    expect(screen.getByTestId('input-field-customUrl')).toHaveValue(
      'https://example.com/page1'
    );
  });

  it('shows the correct number of dimensions', () => {
    render(
      <PageViewEventForm
        formData={mockFormData}
        setFormData={mockSetFormData}
        handleDimensionChange={mockHandleDimensionChange}
      />
    );

    expect(screen.getByTestId('dimensions-count')).toHaveTextContent('2');
    expect(screen.getByTestId('dimensions-total')).toHaveTextContent('4');
  });

  it('calls setFormData when description is changed', async () => {
    const user = userEvent.setup();
    render(
      <PageViewEventForm
        formData={mockFormData}
        setFormData={mockSetFormData}
        handleDimensionChange={mockHandleDimensionChange}
      />
    );

    const descriptionInput = screen.getByTestId('textarea-input-description');
    await user.clear(descriptionInput);
    await user.type(descriptionInput, 'New description');

    expect(mockSetFormData).toHaveBeenCalled();
  });

  it('calls setFormData with updated URL when custom title is changed', async () => {
    const user = userEvent.setup();
    render(
      <PageViewEventForm
        formData={mockFormData}
        setFormData={mockSetFormData}
        handleDimensionChange={mockHandleDimensionChange}
      />
    );

    // Instead of typing, directly click on the option
    const option = screen.getByTestId('option-page-2');
    await user.click(option);

    // Check that setFormData was called with a function
    expect(mockSetFormData).toHaveBeenCalled();

    // Get the function that was passed to setFormData
    const setFormDataArg = mockSetFormData.mock.calls[0][0];

    // Call the function with the current formData
    const updatedFormData = setFormDataArg(mockFormData);

    // Check that the function returns an object with the expected customUrl
    expect(updatedFormData).toHaveProperty(
      'customUrl',
      'https://example.com/page2'
    );
  });
});
