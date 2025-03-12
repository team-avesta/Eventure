import { ScreenshotStatus } from '@/services/adminS3Service';
import { Chip } from './Chip';
import { FiClipboard, FiClock, FiCheck } from 'react-icons/fi';

const statusColors = {
  [ScreenshotStatus.TODO]: 'bg-orange-500 text-white',
  [ScreenshotStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
  [ScreenshotStatus.DONE]: 'bg-green-100 text-green-800',
};

const statusIcons = {
  [ScreenshotStatus.TODO]: <FiClipboard className="w-4 h-4" />,
  [ScreenshotStatus.IN_PROGRESS]: <FiClock className="w-4 h-4" />,
  [ScreenshotStatus.DONE]: <FiCheck className="w-4 h-4" />,
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
