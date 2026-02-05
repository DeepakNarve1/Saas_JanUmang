"use client";

import React, { useState } from "react";
import { Filter } from "lucide-react";

interface DashboardFiltersProps {
  onApply: (dates: { start: string; end: string }) => void;
  onClear: () => void;
}

const DashboardFilters = ({ onApply, onClear }: DashboardFiltersProps) => {
  const [dates, setDates] = useState({ start: "", end: "" });

  return (
    <div className="mt-8 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-gray-800 rounded-lg p-4 flex flex-col md:flex-row items-end md:items-center gap-4">
      <div className="flex items-center gap-2">
        <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          Filter Graphs:
        </span>
      </div>
      <div className="flex gap-4">
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
            Start Date
          </label>
          <input
            type="date"
            className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-sm bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 focus:ring-2 ring-blue-500 outline-none"
            value={dates.start}
            onChange={(e) => setDates({ ...dates, start: e.target.value })}
            onClick={(e) => (e.target as HTMLInputElement).showPicker()}
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
            End Date
          </label>
          <input
            type="date"
            className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-sm bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 focus:ring-2 ring-blue-500 outline-none"
            value={dates.end}
            onChange={(e) => setDates({ ...dates, end: e.target.value })}
            onClick={(e) => (e.target as HTMLInputElement).showPicker()}
          />
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2 md:mt-0">
        <button
          onClick={() => onApply(dates)}
          className="px-4 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors shadow-sm"
        >
          Filter
        </button>
        <button
          onClick={() => {
            setDates({ start: "", end: "" });
            onClear();
          }}
          className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default DashboardFilters;
