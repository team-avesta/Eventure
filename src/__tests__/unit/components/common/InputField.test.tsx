import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InputField from '@/components/common/InputField';

describe('InputField', () => {
  const defaultProps = {
    id: 'test-input',
    name: 'test-input',
    label: 'Test Input',
    value: '',
    readOnly: true,
  };

  it('renders correctly with default props', () => {
    render(<InputField {...defaultProps} />);

    const input = screen.getByRole('textbox');
    const label = screen.getByText('Test Input');

    expect(input).toBeInTheDocument();
    expect(label).toBeInTheDocument();
    expect(input).toHaveAttribute('id', 'test-input');
    expect(input).toHaveAttribute('name', 'test-input');
    expect(input).not.toBeRequired();
  });

  it('renders with required attribute when required prop is true', () => {
    render(<InputField {...defaultProps} required={true} />);

    const input = screen.getByRole('textbox');
    const label = screen.getByText('Test Input *');

    expect(input).toBeRequired();
    expect(label).toBeInTheDocument();
  });

  it('renders with readOnly attribute when readOnly prop is true', () => {
    render(<InputField {...defaultProps} readOnly={true} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('readOnly');
    expect(input.className).toContain('bg-gray-100');
    expect(input.className).toContain('cursor-not-allowed');
  });

  it('renders with disabled attribute when disabled prop is true', () => {
    render(<InputField {...defaultProps} disabled={true} />);

    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
    expect(input.className).toContain('bg-gray-100');
    expect(input.className).toContain('cursor-not-allowed');
  });

  it('calls onChange handler when input value changes', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();

    render(
      <InputField {...defaultProps} onChange={onChange} readOnly={false} />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, 'test value');

    expect(onChange).toHaveBeenCalled();
  });

  it('applies custom className when provided', () => {
    render(<InputField {...defaultProps} className="custom-input-class" />);

    const input = screen.getByRole('textbox');
    expect(input.className).toContain('custom-input-class');
  });

  it('renders with placeholder when provided', () => {
    render(<InputField {...defaultProps} placeholder="Enter value here" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('placeholder', 'Enter value here');
  });

  it('renders with different input type when specified', () => {
    render(<InputField {...defaultProps} type="email" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('displays the correct value', () => {
    render(<InputField {...defaultProps} value="test value" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('test value');
  });
});
