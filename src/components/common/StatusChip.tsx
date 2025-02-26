import { ScreenshotStatus } from '@/services/adminS3Service';
import { Chip } from './Chip';

const statusColors = {
  [ScreenshotStatus.TODO]: 'bg-orange-500 text-white',
  [ScreenshotStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
  [ScreenshotStatus.DONE]: 'bg-green-100 text-green-800',
};

const statusIcons = {
  [ScreenshotStatus.TODO]: (
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
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    </svg>
  ),
  [ScreenshotStatus.IN_PROGRESS]: (
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
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  [ScreenshotStatus.DONE]: (
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
        d="M5 13l4 4L19 7"
      />
    </svg>
  ),
};

interface StatusChipProps {
  status: ScreenshotStatus;
  onClick?: () => void;
  isClickable?: boolean;
}

export function StatusChip({
  status,
  onClick,
  isClickable = false,
}: StatusChipProps) {
  return (
    <Chip
      label={status}
      icon={statusIcons[status]}
      colorClasses={statusColors[status]}
      onClick={onClick ? (e) => onClick() : undefined}
      title={isClickable ? 'Click to change status' : undefined}
      isClickable={isClickable}
    />
  );
}
