import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <>
        <label
          htmlFor={props.id}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
        <div className="mt-1">
          <input
            {...props}
            ref={ref}
            className={`block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 shadow-sm 
              focus:border-primary focus:outline-none focus:ring-primary sm:text-sm 
              ${error ? 'border-red-500' : ''} 
              ${className}`}
          />
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </>
    );
  }
);

Input.displayName = 'Input';
