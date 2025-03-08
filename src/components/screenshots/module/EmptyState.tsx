import React from 'react';

interface EmptyStateProps {
  message: string;
}

/**
 * Component to display when no screenshots are available or match filters
 */
const EmptyState: React.FC<EmptyStateProps> = ({ message }) => {
  return (
    <div
      className="bg-white shadow rounded-lg p-6 text-center text-gray-500"
      data-testid="empty-state"
    >
      {message}
    </div>
  );
};

export default EmptyState;
