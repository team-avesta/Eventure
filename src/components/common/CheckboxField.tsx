import React from 'react';

interface CheckboxFieldProps {
  id?: string;
  name: string;
  value: string;
  label: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  labelClassName?: string;
  disabled?: boolean;
}

const CheckboxField: React.FC<CheckboxFieldProps> = ({
  id,
  name,
  value,
  label,
  checked,
  onChange,
  className = '',
  labelClassName = '',
  disabled = false,
}) => {
  const checkboxId = id || `checkbox-${name}-${value}`;
  const baseClassName =
    'h-4 w-4 text-blue-500 rounded border-gray-300 focus:ring-blue-500';
  const combinedClassName = `${baseClassName} ${className}`;
  const baseLabelClassName =
    'flex items-center space-x-3 hover:bg-gray-50 p-1 rounded cursor-pointer';
  const combinedLabelClassName = `${baseLabelClassName} ${labelClassName}`;

  return (
    <label htmlFor={checkboxId} className={combinedLabelClassName}>
      <input
        type="checkbox"
        id={checkboxId}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={combinedClassName}
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
};

export default CheckboxField;
