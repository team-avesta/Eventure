import React from 'react';
import Breadcrumb from '@/components/common/Breadcrumb';
import ActionButtons from './ActionButtons';
import EventTypeLegend from './EventTypeLegend';

interface ScreenshotHeaderProps {
  moduleName: string;
  moduleKey: string;
  screenshotName: string;
  userRole: string;
  isDraggable: boolean;
  setIsDraggable: (isDraggable: boolean) => void;
  eventTypes: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  onAddEventClick: () => void;
  onReplaceImageClick: () => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

const ScreenshotHeader: React.FC<ScreenshotHeaderProps> = ({
  moduleName,
  moduleKey,
  screenshotName,
  userRole,
  isDraggable,
  setIsDraggable,
  eventTypes,
  onAddEventClick,
  onReplaceImageClick,
  handleFileChange,
  fileInputRef,
}) => {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-[95%] mx-auto px-6 py-3">
        <div className="flex flex-col space-y-4">
          {/* Top row with breadcrumb */}
          <div className="flex items-center justify-between">
            <Breadcrumb
              items={[
                {
                  label: moduleName,
                  href: `/screenshots/modules/${moduleKey}`,
                },
                {
                  label: screenshotName,
                },
              ]}
            />

            <ActionButtons
              userRole={userRole}
              isDraggable={isDraggable}
              setIsDraggable={setIsDraggable}
              onAddEventClick={onAddEventClick}
              onReplaceImageClick={onReplaceImageClick}
              fileInputRef={fileInputRef}
              handleFileChange={handleFileChange}
            />
          </div>

          {/* Bottom row with legend */}
          <EventTypeLegend eventTypes={eventTypes} />
        </div>
      </div>
    </div>
  );
};

export default ScreenshotHeader;
