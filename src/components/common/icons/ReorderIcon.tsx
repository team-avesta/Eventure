import React from 'react';

interface ReorderIconProps {
  className?: string;
  isActive?: boolean;
}

/**
 * Icon for reordering/drag and drop functionality
 */
const ReorderIcon: React.FC<ReorderIconProps> = ({
  className = '',
  isActive = false,
}) => {
  return (
    <svg
      className={`${className} ${
        isActive ? 'rotate-180' : ''
      } transition-transform`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
      />
    </svg>
  );
};

export default ReorderIcon;
