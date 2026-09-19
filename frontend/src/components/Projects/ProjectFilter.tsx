import React from 'react';
import { Search, Filter } from 'lucide-react';
import { ProjectType, ProjectStatus } from '../../types';

interface ProjectFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedType: string;
  onTypeChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
}

export const ProjectFilter: React.FC<ProjectFilterProps> = ({
  search,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedStatus,
  onStatusChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
      {/* Search Input */}
      <div className="relative flex-1 w-full">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by project name, description, country..."
          className="w-full bg-[#111d21] border border-[#1e333a] rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
        />
      </div>

      {/* Type Filter */}
      <select
        value={selectedType}
        onChange={(e) => onTypeChange(e.target.value)}
        aria-label="Filter by Project Type"
        className="w-full sm:w-auto bg-[#111d21] border border-[#1e333a] rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:border-emerald-500"
      >
        <option value="">All Project Types</option>
        <option value="Carbon">Carbon</option>
        <option value="Biodiversity">Biodiversity</option>
        <option value="Carbon & Biodiversity">Carbon & Biodiversity</option>
      </select>

      {/* Status Filter */}
      <select
        value={selectedStatus}
        onChange={(e) => onStatusChange(e.target.value)}
        aria-label="Filter by Status"
        className="w-full sm:w-auto bg-[#111d21] border border-[#1e333a] rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:border-emerald-500"
      >
        <option value="">All Statuses</option>
        <option value="Active">Active</option>
        <option value="Planning">Planning</option>
        <option value="Completed">Completed</option>
        <option value="Archived">Archived</option>
      </select>
    </div>
  );
};
