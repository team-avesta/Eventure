import { AdminSection } from '@/data/adminSections';
import { PlusIcon, SettingsIcon } from '@/components/common/icons';

interface AdminCardProps extends AdminSection {
  onAdd: () => void;
  onManage: () => void;
}

export function AdminCard({
  title,
  description,
  icon,
  onAdd,
  onManage,
}: AdminCardProps) {
  const renderActionButtons = () => (
    <div className="absolute top-4 right-4 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <button
        onClick={onAdd}
        className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 focus:outline-none transition-all duration-200"
        title="Add New"
      >
        <PlusIcon className="w-4 h-4" />
      </button>
      <button
        onClick={onManage}
        className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 focus:outline-none transition-all duration-200"
        title="Manage"
      >
        <SettingsIcon className="w-4 h-4" />
      </button>
    </div>
  );

  const renderIcon = () => (
    <div className="flex-shrink-0">
      <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center transition-colors duration-200 group-hover:bg-blue-600">
        {icon}
      </div>
    </div>
  );

  const renderContent = () => (
    <div className="ml-4 flex-1 min-w-0">
      <h3 className="text-base font-semibold text-gray-900 group-hover:text-gray-700">
        {title}
      </h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
  );

  return (
    <div className="relative bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
      {renderActionButtons()}
      <div className="p-6">
        <div className="flex items-start">
          {renderIcon()}
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
