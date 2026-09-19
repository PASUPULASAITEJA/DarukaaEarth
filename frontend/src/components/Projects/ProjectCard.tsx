import React from 'react';
import { Link } from 'react-router-dom';
import { Project } from '../../types';
import { Badge } from '../UI/Badge';
import { MapPin, Calendar, Layers, ArrowRight, Trees, Leaf, Sparkles, ChevronRight } from 'lucide-react';

export const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
  const getTypeBadge = () => {
    switch (project.project_type) {
      case 'Carbon':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
            <Leaf className="w-3 h-3 text-emerald-400" />
            Carbon
          </span>
        );
      case 'Biodiversity':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            Biodiversity
          </span>
        );
      case 'Carbon & Biodiversity':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-purple-950/80 text-purple-300 border border-purple-500/30">
            <Trees className="w-3 h-3 text-purple-400" />
            Carbon & Bio
          </span>
        );
      default:
        return <Badge variant="neutral">{project.project_type}</Badge>;
    }
  };

  const getStatusBadge = () => {
    switch (project.status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Active
          </span>
        );
      case 'Planning':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
            Planning
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            Completed
          </span>
        );
      default:
        return <Badge variant="neutral">{project.status}</Badge>;
    }
  };

  return (
    <div className="glass-card rounded-3xl p-6 border border-[#1c353d] flex flex-col justify-between hover:border-emerald-500/50 hover:bg-[#182b31] transition-all duration-300 group shadow-lg">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          {getTypeBadge()}
          {getStatusBadge()}
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-1 tracking-tight">
          {project.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed font-normal">
          {project.description || 'No project description provided.'}
        </p>

        {/* Location & Date */}
        <div className="mt-4 pt-3.5 border-t border-[#1c353d]/80 space-y-2 text-xs text-slate-400">
          {(project.country || project.region) && (
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate text-slate-300">
                {[project.region, project.country].filter(Boolean).join(', ')}
              </span>
            </div>
          )}
          {project.start_date && (
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="text-slate-400">Timeline: <span className="text-slate-200">{project.start_date}</span></span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Stats & Action */}
      <div className="mt-5 pt-3.5 border-t border-[#1c353d] flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-400 text-[11px]">Sites:</span>{' '}
            <strong className="text-white font-bold text-xs">{project.sites_count}</strong>
          </div>
          <div>
            <span className="text-slate-400 text-[11px]">Area:</span>{' '}
            <strong className="text-emerald-400 font-bold text-xs">
              {project.total_area_hectares.toLocaleString()} ha
            </strong>
          </div>
        </div>

        <Link
          to={`/projects/${project.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-950 text-xs font-semibold text-emerald-300 border border-emerald-500/30 group-hover:border-emerald-400/50 transition-all shadow-sm"
        >
          <span>Explore</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
