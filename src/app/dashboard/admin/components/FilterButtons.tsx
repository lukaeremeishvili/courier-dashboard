'use client'

import React, { useState } from "react";

type FilterType = "all" | "user" | "courier";

interface FilterButtonsProps {
  initialFilter: FilterType;
  onFilterChange: (newFilter: FilterType) => void;
}

const FilterButtons: React.FC<FilterButtonsProps> = ({
  initialFilter,
  onFilterChange,
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>(initialFilter);

  const handleFilterClick = (newFilter: FilterType) => {
    setActiveFilter(newFilter);
    onFilterChange(newFilter);
  };

  return (
    <div className="flex space-x-2 flex-wrap mb-4">
      <button
        onClick={() => handleFilterClick("all")}
        className={`px-3 py-1 rounded-md text-sm ${
          activeFilter === "all"
            ? "bg-indigo-600 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        All
      </button>
      <button
        onClick={() => handleFilterClick("user")}
        className={`px-3 py-1 rounded-md text-sm ${
          activeFilter === "user"
            ? "bg-indigo-600 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        Users
      </button>
      <button
        onClick={() => handleFilterClick("courier")}
        className={`px-3 py-1 rounded-md text-sm ${
          activeFilter === "courier"
            ? "bg-indigo-600 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        Couriers
      </button>
    </div>
  );
};

export default FilterButtons;
