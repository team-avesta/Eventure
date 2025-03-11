import React from 'react';

interface SwitchProps {
  isDraggable: boolean;
  setIsDraggable: (isDraggable: boolean) => void;
}

const Switch = ({ isDraggable, setIsDraggable }: SwitchProps) => {
  return (
    <div className="h-11 px-5 rounded-md border border-gray-300 bg-white flex items-center shadow-sm">
      <label className="flex items-center cursor-pointer">
        <span className="text-sm font-medium text-gray-700 mr-3">Drag</span>
        <div className="relative">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={isDraggable}
            onChange={(e) => setIsDraggable(e.target.checked)}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0073CF] rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0073CF]"></div>
        </div>
      </label>
    </div>
  );
};

export default Switch;
