import Link from 'next/link';

interface ModuleCardProps {
  name: string;
  moduleKey: string;
  screenshotsCount: number;
  pageViewCount: number;
  trackEventWithPageViewCount: number;
  trackEventCount: number;
  outlinkCount: number;
}

export function ModuleCard({
  name,
  moduleKey,
  screenshotsCount,
  pageViewCount,
  trackEventWithPageViewCount,
  trackEventCount,
  outlinkCount,
}: ModuleCardProps) {
  const totalEvents =
    pageViewCount +
    trackEventWithPageViewCount +
    trackEventCount +
    outlinkCount;

  const renderModuleInfo = () => (
    <div className="relative z-10">
      <h2
        className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-indigo-600 truncate max-w-[250px]"
        title={name}
      >
        {name}
      </h2>
      <div className="flex flex-col gap-1 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500/70"></div>
          <span className="text-xs text-gray-500">
            {screenshotsCount === 1
              ? `${screenshotsCount} screenshot`
              : `${screenshotsCount} screenshots`}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-blue-500/70"></div>
          <span className="text-xs text-gray-500">
            {pageViewCount} pageviews
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-indigo-500/70"></div>
          <span className="text-xs text-gray-500">
            {trackEventWithPageViewCount} trackevent with pageview
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-purple-500/70"></div>
          <span className="text-xs text-gray-500">
            {trackEventCount} trackevent
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-pink-500/70"></div>
          <span className="text-xs text-gray-500">{outlinkCount} outlink</span>
        </div>
        <div className="flex items-center gap-1.5 mt-1 pt-1 border-t border-gray-100">
          <div className="w-2 h-2 rounded-full bg-gray-500/70"></div>
          <span className="text-xs font-medium text-gray-600">
            {totalEvents} total events
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <Link href={`/screenshots/modules/${moduleKey}`} className="block group">
      <div className="bg-gradient-to-br from-white to-gray-50/80 backdrop-blur-sm rounded-xl shadow hover:shadow-md transition-all duration-300 h-[220px] flex flex-col overflow-hidden group border border-gray-100/50">
        <div className="px-6 py-5 flex items-center justify-between relative">
          {renderModuleInfo()}
        </div>
      </div>
    </Link>
  );
}
