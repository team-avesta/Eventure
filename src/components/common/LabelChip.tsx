import { Chip } from './Chip';

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
    <svg
      className="w-3 h-3"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
      />
    </svg>
  ) : (
    <svg
      className="w-3 h-3"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
      />
    </svg>
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
