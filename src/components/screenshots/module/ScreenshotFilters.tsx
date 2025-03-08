import React from 'react';
import { SearchInput } from '@/components/common/SearchInput';
import { Dropdown } from '@/components/common/Dropdown';
import { PageLabel } from '@/types/pageLabel';

interface ScreenshotFiltersProps {
  onSearch: (value: string) => void;
  labels: PageLabel[];
  selectedLabelId: string | null;
  onLabelSelect: (labelId: string | null) => void;
}

/**
 * Component for filtering screenshots by search term and label
 */
const ScreenshotFilters: React.FC<ScreenshotFiltersProps> = ({
  onSearch,
  labels,
  selectedLabelId,
  onLabelSelect,
}) => {
  const renderLabelDropdown = () => {
    if (labels.length === 0) {
      return null;
    }

    return (
      <Dropdown
        options={labels.map((label) => ({
          id: label.id,
          label: label.name,
        }))}
        selectedId={selectedLabelId}
        onSelect={onLabelSelect}
        allOptionLabel="All labels"
        placeholder="Filter by label"
        data-testid="label-filter"
      />
    );
  };

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <div className="w-full sm:w-auto sm:flex-1 mb-2 sm:mb-0">
        <SearchInput
          onSearch={onSearch}
          placeholder="Search screenshots..."
          delay={0}
          data-testid="screenshot-search"
        />
      </div>
      {renderLabelDropdown()}
    </div>
  );
};

export default ScreenshotFilters;
