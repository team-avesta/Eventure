import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DimensionsSection from '@/components/shared/DimensionsSection';

// Mock the CheckboxField component
jest.mock('@/components/shared/CheckboxField', () => {
  return jest.fn(({ label, checked, onChange, value }) => (
    <div data-testid={`checkbox-${value}`}>
      <label>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e)}
          data-testid={`checkbox-input-${value}`}
        />
        {label}
      </label>
    </div>
  ));
});

describe('DimensionsSection', () => {
  const mockDimensions = [
    { id: '1', name: 'Dimension 1' },
    { id: '2', name: 'Dimension 2' },
    { id: '3', name: 'Dimension 3' },
  ];

  const defaultProps = {
    dimensions: mockDimensions,
    selectedDimensions: ['1'],
    onDimensionChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with dimensions', () => {
    render(<DimensionsSection {...defaultProps} />);

    // Check if the label is rendered
    expect(screen.getByText('Dimensions')).toBeInTheDocument();

    // Check if all dimensions are rendered
    mockDimensions.forEach((dimension) => {
      expect(
        screen.getByTestId(`checkbox-${dimension.id}`)
      ).toBeInTheDocument();
    });
  });

  it('formats dimension labels correctly', () => {
    render(<DimensionsSection {...defaultProps} />);

    // The formatDimensionLabel function should pad the id with zeros
    expect(screen.getByText('01. Dimension 1')).toBeInTheDocument();
    expect(screen.getByText('02. Dimension 2')).toBeInTheDocument();
    expect(screen.getByText('03. Dimension 3')).toBeInTheDocument();
  });

  it('passes correct checked state to checkboxes', () => {
    render(<DimensionsSection {...defaultProps} />);

    // Dimension 1 should be checked
    const checkbox1 = screen.getByTestId('checkbox-input-1');
    expect(checkbox1).toBeChecked();

    // Dimensions 2 and 3 should not be checked
    const checkbox2 = screen.getByTestId('checkbox-input-2');
    const checkbox3 = screen.getByTestId('checkbox-input-3');
    expect(checkbox2).not.toBeChecked();
    expect(checkbox3).not.toBeChecked();
  });

  it('calls onDimensionChange when a checkbox is clicked', async () => {
    const onDimensionChange = jest.fn();
    const user = userEvent.setup();

    render(
      <DimensionsSection
        {...defaultProps}
        onDimensionChange={onDimensionChange}
      />
    );

    // Click on the second checkbox
    const checkbox2 = screen.getByTestId('checkbox-input-2');
    await user.click(checkbox2);

    // Check if onDimensionChange was called with the correct arguments
    expect(onDimensionChange).toHaveBeenCalledWith('2', true);
  });

  it('renders empty state when no dimensions are provided', () => {
    render(<DimensionsSection {...defaultProps} dimensions={[]} />);

    // The section should still render but with no checkboxes
    expect(screen.getByText('Dimensions')).toBeInTheDocument();
    expect(screen.queryByTestId(/checkbox-/)).not.toBeInTheDocument();
  });

  it('handles multiple selected dimensions correctly', () => {
    render(
      <DimensionsSection {...defaultProps} selectedDimensions={['1', '3']} />
    );

    // Dimensions 1 and 3 should be checked
    const checkbox1 = screen.getByTestId('checkbox-input-1');
    const checkbox3 = screen.getByTestId('checkbox-input-3');
    expect(checkbox1).toBeChecked();
    expect(checkbox3).toBeChecked();

    // Dimension 2 should not be checked
    const checkbox2 = screen.getByTestId('checkbox-input-2');
    expect(checkbox2).not.toBeChecked();
  });
});
