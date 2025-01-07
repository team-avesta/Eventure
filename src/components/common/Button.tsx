import { Spinner } from './icons/Spinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
  isLoading?: boolean;
}

export function Button({
  variant = 'primary',
  fullWidth = false,
  isLoading = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'rounded-md px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variants = {
    primary:
      'bg-primary text-white hover:bg-primary-hover focus:ring-primary border border-transparent',
    secondary:
      'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500 border border-transparent',
    outline:
      'bg-white text-gray-700 hover:bg-gray-50 focus:ring-primary border border-gray-300',
  };

  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} 
        ${fullWidth ? 'w-full' : ''} 
        ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''} 
        ${className}`}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <Spinner className="-ml-1 mr-2" size={16} />
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
