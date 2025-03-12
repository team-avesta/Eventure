import React from 'react';
import Breadcrumb from '@/components/shared/Breadcrumb';
import { FiMove } from 'react-icons/fi';

interface ModuleHeaderProps {
  moduleName: string;
  isAdmin: boolean;
  hasMultipleScreenshots: boolean;
  isDragModeEnabled: boolean;
  onToggleDragMode: () => void;
}

/**
 * Header component for the module screenshots page
 */
const ModuleHeader: React.FC<ModuleHeaderProps> = ({
  moduleName,
  isAdmin,
  hasMultipleScreenshots,
  isDragModeEnabled,
  onToggleDragMode,
}) => {
  const renderReorderButton = () => {
    if (!isAdmin || !hasMultipleScreenshots) {
      return null;
    }

    return (
      <button
        onClick={onToggleDragMode}
        className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium transition-colors ${
          isDragModeEnabled
            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
        data-testid="toggle-drag-mode"
      >
        <FiMove
          className={`${
            isDragModeEnabled ? 'rotate-180' : ''
          } transition-transform mr-2 -ml-1 h-5 w-5`}
        />
        {isDragModeEnabled ? 'Exit Reorder Mode' : 'Reorder Screenshots'}
      </button>
    );
  };

  return (
    <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Breadcrumb
          items={[
            {
              label: moduleName,
            },
          ]}
        />
        <div className="mt-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">{moduleName}</h1>
          {renderReorderButton()}
        </div>
      </div>
    </div>
  );
};

export default ModuleHeader;
