import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CheckboxField from '@/components/common/CheckboxField';

describe('CheckboxField', () => {
  const defaultProps = {
    name: 'test-checkbox',
    value: 'test-value',
    label: 'Test Checkbox',
    checked: false,
    onChange: jest.fn(),
  };

  it('renders correctly with default props', () => {
    render(<CheckboxField {...defaultProps} />);

    const checkbox = screen.getByRole('checkbox');
    const label = screen.getByText('Test Checkbox');

    expect(checkbox).toBeInTheDocument();
    expect(label).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it('renders with checked state when checked prop is true', () => {
    render(<CheckboxField {...defaultProps} checked={true} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('calls onChange handler when clicked', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();

    render(<CheckboxField {...defaultProps} onChange={onChange} />);

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(expect.any(Object));
  });

  it('applies custom className when provided', () => {
    render(
      <CheckboxField
        {...defaultProps}
        className="custom-checkbox-class"
        labelClassName="custom-label-class"
      />
    );

    const checkbox = screen.getByRole('checkbox');
    const label = checkbox.closest('label');

    expect(checkbox.className).toContain('custom-checkbox-class');
    expect(label?.className).toContain('custom-label-class');
  });

  it('disables the checkbox when disabled prop is true', () => {
    render(<CheckboxField {...defaultProps} disabled={true} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDisabled();
  });

  it('uses provided id when specified', () => {
    render(<CheckboxField {...defaultProps} id="custom-id" />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox.id).toBe('custom-id');
  });

  it('generates id based on name and value when id is not provided', () => {
    render(<CheckboxField {...defaultProps} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox.id).toBe('checkbox-test-checkbox-test-value');
  });
});
