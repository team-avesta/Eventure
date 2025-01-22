import { AdminSection } from '@/data/adminSections';

interface AdminCardProps extends AdminSection {
  onClick: () => void;
}

export function AdminCard({
  title,
  description,
  icon,
  onClick,
}: AdminCardProps) {
  const renderIcon = () => (
    <div className="flex-shrink-0">
      <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center transition-colors duration-200 group-hover:bg-blue-600">
        {icon}
      </div>
    </div>
  );

  const renderContent = () => (
    <div className="ml-4 flex-1 min-w-0 text-left">
      <h3 className="text-base font-semibold text-gray-900 group-hover:text-gray-700">
        {title}
      </h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
  );

  return (
    <button
      onClick={onClick}
      className="w-full relative bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group text-left"
    >
      <div className="p-6">
        <div className="flex items-start">
          {renderIcon()}
          {renderContent()}
        </div>
      </div>
    </button>
  );
}
