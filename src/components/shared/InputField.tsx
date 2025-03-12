import React from 'react';

interface InputFieldProps {
  id: string;
  name: string;
  label: string;
  type?: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
  disabled?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  required = false,
  placeholder = '',
  readOnly = false,
  className = '',
  disabled = false,
}) => {
  const baseClassName =
    'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm';
  const readOnlyClassName =
    readOnly || disabled
      ? 'bg-gray-100 text-gray-600 cursor-not-allowed'
      : 'focus:border-indigo-500 focus:ring-indigo-500';
  const combinedClassName = `${baseClassName} ${readOnlyClassName} ${className}`;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label} {required && '*'}
      </label>
      <input
        type={type}
        name={name}
        id={id}
        value={value}
        onChange={onChange}
        required={required}
        readOnly={readOnly}
        disabled={disabled}
        className={combinedClassName}
        placeholder={placeholder}
      />
    </div>
  );
};

export default InputField;
