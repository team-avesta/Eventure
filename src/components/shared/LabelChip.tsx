import { Chip } from './Chip';
import { FiPlus, FiTag } from 'react-icons/fi';

interface LabelChipProps {
  label: string | null;
  onClick?: () => void;
  isClickable?: boolean;
  isAddButton?: boolean;
}

export function LabelChip({
  label,
  onClick,
  isClickable = false,
  isAddButton = false,
}: LabelChipProps) {
  if (!label && !isAddButton) {
    return null;
  }

  const labelIcon = isAddButton ? (
    <FiPlus className="w-3 h-3" />
  ) : (
    <FiTag className="w-3 h-3" />
  );

  return (
    <Chip
      label={isAddButton ? 'Add label' : label || ''}
      icon={labelIcon}
      colorClasses={
        isAddButton
          ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          : 'bg-indigo-100 text-indigo-800'
      }
      onClick={onClick ? (e) => onClick() : undefined}
      title={
        isClickable
          ? isAddButton
            ? 'Add label'
            : 'Click to change label'
          : undefined
      }
      isClickable={isClickable}
    />
  );
}
