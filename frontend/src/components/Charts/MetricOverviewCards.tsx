import React from 'react';
import { CurrentMetrics } from '../../types';
import { Leaf, Trees, Sparkles, TrendingUp, Compass } from 'lucide-react';

interface MetricOverviewCardsProps {
  metrics: CurrentMetrics;
  areaHectares: number;
  areaKm2: number;
}

export const MetricOverviewCards: React.FC<MetricOverviewCardsProps> = ({
  metrics,
  areaHectares,
  areaKm2,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Carbon Sequestration */}
      <div className="glass-card rounded-2xl p-5 border border-[#1e333a] relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Carbon Sequestered
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Leaf className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-extrabold text-slate-100 tracking-tight">
            {metrics.carbon_sequestration_tonnes.toLocaleString()} <span className="text-sm font-semibold text-emerald-400">tCO₂e</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-400 mt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+{metrics.carbon_reduction_rate}% reduction rate</span>
          </div>
        </div>
      </div>

      {/* 2. Biodiversity Index */}
      <div className="glass-card rounded-2xl p-5 border border-[#1e333a] relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Biodiversity Index
          </span>
          <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-extrabold text-slate-100 tracking-tight">
            {metrics.biodiversity_index} <span className="text-sm font-semibold text-cyan-400">/ 100</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Endemic species & habitat health</p>
        </div>
      </div>

      {/* 3. Vegetation Canopy */}
      <div className="glass-card rounded-2xl p-5 border border-[#1e333a] relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Vegetation Coverage
          </span>
          <div className="w-8 h-8 rounded-xl bg-teal-950/80 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Trees className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-extrabold text-slate-100 tracking-tight">
            {metrics.vegetation_coverage_pct}%
          </div>
          <p className="text-xs text-slate-400 mt-1">Satellite NDVI canopy density</p>
        </div>
      </div>

      {/* 4. Total Area */}
      <div className="glass-card rounded-2xl p-5 border border-[#1e333a] relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Site Polygon Area
          </span>
          <div className="w-8 h-8 rounded-xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Compass className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-extrabold text-slate-100 tracking-tight">
            {areaHectares.toLocaleString()} <span className="text-sm font-semibold text-purple-400">ha</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">{areaKm2.toLocaleString()} km² total footprint</p>
        </div>
      </div>
    </div>
  );
};
