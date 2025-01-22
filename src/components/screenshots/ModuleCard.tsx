import Link from 'next/link';
import { ArrowRightIcon } from '@/components/common/icons/index';

interface ModuleCardProps {
  name: string;
  moduleKey: string;
  screenshotsCount: number;
}

export function ModuleCard({
  name,
  moduleKey,
  screenshotsCount,
}: ModuleCardProps) {
  const renderModuleInfo = () => (
    <div className="relative z-10">
      <h2
        className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-indigo-600 truncate max-w-[250px]"
        title={name}
      >
        {name}
      </h2>
      <div className="flex items-center gap-1.5 mt-1">
        <div className="w-2 h-2 rounded-full bg-green-500/70"></div>
        <span className="text-xs text-gray-500">
          {screenshotsCount} captures
        </span>
      </div>
    </div>
  );

  const renderViewButton = () => (
    <div className="w-full py-3 rounded-lg bg-gray-900/5 group-hover:bg-blue-500 transition-colors flex items-center justify-center gap-2">
      <span className="text-sm font-medium text-gray-600 group-hover:text-white">
        View Screenshots
      </span>
      <ArrowRightIcon className="w-4 h-4 text-gray-500 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
    </div>
  );

  return (
    <Link href={`/screenshots/modules/${moduleKey}`} className="block group">
      <div className="bg-gradient-to-br from-white to-gray-50/80 backdrop-blur-sm rounded-xl shadow hover:shadow-md transition-all duration-300 h-[180px] flex flex-col overflow-hidden group border border-gray-100/50">
        <div className="px-6 py-5 flex items-center justify-between relative">
          {renderModuleInfo()}
        </div>

        <div className="flex-1 flex items-end p-6">{renderViewButton()}</div>
      </div>
    </Link>
  );
}
