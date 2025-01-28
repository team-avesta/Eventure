import { Screenshot, ScreenshotStatus } from '@/services/adminS3Service';
import Image from 'next/image';
import Link from 'next/link';

const statusColors = {
  [ScreenshotStatus.TODO]: 'bg-orange-500 text-white',
  [ScreenshotStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
  [ScreenshotStatus.DONE]: 'bg-green-100 text-green-800',
};

const statusIcons = {
  [ScreenshotStatus.TODO]: (
    <svg
      className="w-4 h-4 mr-1"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    </svg>
  ),
  [ScreenshotStatus.IN_PROGRESS]: (
    <svg
      className="w-4 h-4 mr-1"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  [ScreenshotStatus.DONE]: (
    <svg
      className="w-4 h-4 mr-1"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  ),
};

interface ScreenshotCardProps {
  screenshot: Screenshot;
  userRole: string;
  onStatusChange: (screenshotId: string, status: ScreenshotStatus) => void;
  onDelete: (screenshotId: string) => void;
}

export default function ScreenshotCard({
  screenshot,
  userRole,
  onStatusChange,
  onDelete,
}: ScreenshotCardProps) {
  return (
    <div className="relative group">
      <Link href={`/screenshots/${screenshot.id}`} className="block">
        <div className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200">
          <div className="relative h-48">
            <Image
              src={screenshot.url}
              alt={screenshot.name}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="p-4">
            <div className="flex items-center space-x-2">
              <h3
                className="text-lg font-medium text-gray-900 truncate flex-1"
                title={screenshot.name}
              >
                {screenshot.name}
              </h3>
              {userRole === 'admin' ? (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    const currentStatus =
                      screenshot.status || ScreenshotStatus.TODO;
                    const statusValues = Object.values(ScreenshotStatus);
                    const currentIndex = statusValues.indexOf(currentStatus);
                    const nextStatus =
                      statusValues[(currentIndex + 1) % statusValues.length];
                    onStatusChange(screenshot.id, nextStatus);
                  }}
                  className={`px-2 py-1 rounded-full text-xs font-medium flex items-center whitespace-nowrap transition-colors duration-200 ${
                    statusColors[screenshot.status || ScreenshotStatus.TODO]
                  } hover:opacity-80`}
                  title="Click to change status"
                >
                  {statusIcons[screenshot.status || ScreenshotStatus.TODO]}
                  {screenshot.status || ScreenshotStatus.TODO}
                </button>
              ) : (
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium flex items-center whitespace-nowrap ${
                    statusColors[screenshot.status || ScreenshotStatus.TODO]
                  }`}
                >
                  {statusIcons[screenshot.status || ScreenshotStatus.TODO]}
                  {screenshot.status || ScreenshotStatus.TODO}
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Added {new Date(screenshot.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </Link>
      {userRole === 'admin' && (
        <div className="absolute top-2 right-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              onDelete(screenshot.id);
            }}
            className="p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-700"
            title="Delete screenshot"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
