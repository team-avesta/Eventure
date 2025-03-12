import { ReactNode } from 'react';

interface ChipProps {
  label: string;
  icon?: ReactNode;
  colorClasses: string;
  onClick?: (e: React.MouseEvent) => void;
  title?: string;
  isClickable?: boolean;
}

export function Chip({
  label,
  icon,
  colorClasses,
  onClick,
  title,
  isClickable = false,
}: ChipProps) {
  const Element = onClick ? 'span' : 'div';

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      e.stopPropagation();
      onClick(e);
    }
  };

  return (
    <Element
      onClick={handleClick}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses} ${
        isClickable ? 'hover:opacity-80 cursor-pointer pointer-events-auto' : ''
      }`}
      title={title}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {label}
    </Element>
  );
}
