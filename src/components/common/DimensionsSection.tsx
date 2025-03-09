import React from 'react';
import CheckboxField from './CheckboxField';

interface Dimension {
  id: string;
  name: string;
}

interface DimensionsSectionProps {
  dimensions: Dimension[];
  selectedDimensions: string[];
  onDimensionChange: (dimensionId: string, checked: boolean) => void;
}

const DimensionsSection: React.FC<DimensionsSectionProps> = ({
  dimensions,
  selectedDimensions,
  onDimensionChange,
}) => {
  // Function to format dimension label
  const formatDimensionLabel = (dimension: Dimension): string => {
    return `${String(dimension.id).padStart(2, '0')}. ${dimension.name}`;
  };

  // Function to handle dimension change
  const handleDimensionChange = (dimensionId: string, checked: boolean) => {
    onDimensionChange(dimensionId, checked);
  };

  // Function to render dimension checkboxes
  const renderDimensionCheckboxes = () => {
    return dimensions.map((dimension) => (
      <CheckboxField
        key={dimension.id}
        name="dimensions"
        value={dimension.id}
        label={formatDimensionLabel(dimension)}
        checked={selectedDimensions.includes(dimension.id) || false}
        onChange={(e) => handleDimensionChange(dimension.id, e.target.checked)}
      />
    ));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Dimensions
      </label>
      <div className="max-h-[300px] overflow-y-auto border border-gray-300 rounded-md p-3 space-y-2">
        {renderDimensionCheckboxes()}
      </div>
    </div>
  );
};

export default DimensionsSection;
