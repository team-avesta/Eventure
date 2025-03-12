import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OutlinkEventForm from '@/components/screenshots/detail/EventModals/OutlinkEventForm';
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
          <div key={option}>{option}</div>
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

describe('OutlinkEventForm', () => {
  const mockSetFormData = jest.fn();
  const mockHandleDimensionChange = jest.fn();
  const mockFormData: FormState = {
    description: 'Test description',
    eventcategory: 'Navigation',
    eventname: 'External Link',
    eventvalue: '10',
    dimensions: ['dimension1', 'dimension2'],
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock the useDropdownData hook
    (useDropdownData as jest.Mock).mockReturnValue({
      data: {
        eventCategories: ['Navigation', 'Engagement', 'Conversion'],
        eventNames: ['External Link', 'Internal Link', 'Download'],
        dimensions: ['dimension1', 'dimension2', 'dimension3', 'dimension4'],
      },
    });
  });

  it('renders all form fields correctly', () => {
    render(
      <OutlinkEventForm
        formData={mockFormData}
        setFormData={mockSetFormData}
        handleDimensionChange={mockHandleDimensionChange}
      />
    );

    // Check if all components are rendered
    expect(screen.getByTestId('textarea-description')).toBeInTheDocument();
    expect(
      screen.getByTestId('autocomplete-eventcategory')
    ).toBeInTheDocument();
    expect(screen.getByTestId('input-eventactionname')).toBeInTheDocument();
    expect(screen.getByTestId('autocomplete-eventname')).toBeInTheDocument();
    expect(screen.getByTestId('input-eventvalue')).toBeInTheDocument();
    expect(screen.getByTestId('dimensions-section')).toBeInTheDocument();
  });

  it('displays the correct initial values from formData', () => {
    render(
      <OutlinkEventForm
        formData={mockFormData}
        setFormData={mockSetFormData}
        handleDimensionChange={mockHandleDimensionChange}
      />
    );

    expect(screen.getByTestId('textarea-input-description')).toHaveValue(
      'Test description'
    );
    expect(screen.getByTestId('autocomplete-input-eventcategory')).toHaveValue(
      'Navigation'
    );
    expect(screen.getByTestId('input-field-eventactionname')).toHaveValue(
      'Outlink'
    );
    expect(screen.getByTestId('autocomplete-input-eventname')).toHaveValue(
      'External Link'
    );
    expect(screen.getByTestId('input-field-eventvalue')).toHaveValue('10');
  });

  it('shows the correct number of dimensions', () => {
    render(
      <OutlinkEventForm
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
      <OutlinkEventForm
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

  it('calls setFormData when eventcategory is changed', async () => {
    const user = userEvent.setup();
    render(
      <OutlinkEventForm
        formData={mockFormData}
        setFormData={mockSetFormData}
        handleDimensionChange={mockHandleDimensionChange}
      />
    );

    const eventCategoryInput = screen.getByTestId(
      'autocomplete-input-eventcategory'
    );
    await user.clear(eventCategoryInput);
    await user.type(eventCategoryInput, 'Engagement');

    expect(mockSetFormData).toHaveBeenCalled();
  });

  it('calls setFormData when eventname is changed', async () => {
    const user = userEvent.setup();
    render(
      <OutlinkEventForm
        formData={mockFormData}
        setFormData={mockSetFormData}
        handleDimensionChange={mockHandleDimensionChange}
      />
    );

    const eventNameInput = screen.getByTestId('autocomplete-input-eventname');
    await user.clear(eventNameInput);
    await user.type(eventNameInput, 'Download');

    expect(mockSetFormData).toHaveBeenCalled();
  });

  it('calls setFormData when eventvalue is changed', async () => {
    const user = userEvent.setup();
    render(
      <OutlinkEventForm
        formData={mockFormData}
        setFormData={mockSetFormData}
        handleDimensionChange={mockHandleDimensionChange}
      />
    );

    const eventValueInput = screen.getByTestId('input-field-eventvalue');
    await user.clear(eventValueInput);
    await user.type(eventValueInput, '20');

    expect(mockSetFormData).toHaveBeenCalled();
  });
});
