import { useState, useEffect } from 'react';
import { adminS3Service, Module, EEventType } from '@/services/adminS3Service';
import ScreenshotUpload from '@/components/screenshots/ScreenshotUpload';
import { ModuleCard } from '@/components/screenshots/ModuleCard';
import { AnalyticsModal } from '@/components/screenshots/AnalyticsModal';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import { CgSpinner } from 'react-icons/cg';
import { Event } from '@/types';

interface EventCounts {
  pageViewCount: number;
  trackEventWithPageViewCount: number;
  trackEventCount: number;
  outlinkCount: number;
}

const ScreenshotPage = () => {
  const { isAdmin, isLoading: isAuthLoading } = useAuth();
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const data = await adminS3Service.fetchModules();
      const modulesWithEvents = await adminS3Service.fetchModuleEventCounts(
        data
      );
      setModules(modulesWithEvents);
    } catch (error) {
      toast.error('Failed to fetch modules');
    } finally {
      setIsLoading(false);
    }
  };

  const getEventCounts = (events: Event[]): EventCounts => {
    const counts = {
      [EEventType.PageView]: 0,
      [EEventType.TrackEventWithPageView]: 0,
      [EEventType.TrackEvent]: 0,
      [EEventType.Outlink]: 0,
    };

    events.forEach((event) => {
      if (event?.eventType) {
        if (event.eventType === EEventType.BackendEvent) {
          counts[EEventType.TrackEvent]++; // Count BackendEvent as TrackEvent
        } else {
          counts[event.eventType]++;
        }
      }
    });

    return {
      pageViewCount: counts[EEventType.PageView],
      trackEventWithPageViewCount: counts[EEventType.TrackEventWithPageView],
      trackEventCount: counts[EEventType.TrackEvent],
      outlinkCount: counts[EEventType.Outlink],
    };
  };

  const renderPageContent = () => {
    if (isAuthLoading || isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <CgSpinner size={32} className="animate-spin" role="progressbar" />
        </div>
      );
    }

    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-8 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            {isAdmin && (
              <ScreenshotUpload modules={modules} onSuccess={fetchModules} />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules?.map((module) => {
              const moduleEvents = module.screenshots.flatMap(
                (s) => s.events || []
              );
              const eventCounts = getEventCounts(moduleEvents);

              return (
                <ModuleCard
                  key={module.id}
                  name={module.name}
                  moduleKey={module.key}
                  screenshotsCount={module.screenshots?.length || 0}
                  {...eventCounts}
                />
              );
            })}
          </div>

          <AnalyticsModal
            isOpen={showAnalytics}
            onClose={() => setShowAnalytics(false)}
            modules={modules}
          />
        </div>
      </div>
    );
  };

  return renderPageContent();
};

export default ScreenshotPage;
