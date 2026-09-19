import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  MapPin,
  Compass,
  Leaf,
  Sparkles,
  Plus,
  RefreshCw,
  ArrowRight,
  Database,
  Activity,
  Trees,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import { EmptyState } from '../components/UI/EmptyState';
import { MapboxViewer } from '../components/Map/MapboxViewer';
import { CreateProjectModal } from '../components/Projects/CreateProjectModal';
import { ProjectCard } from '../components/Projects/ProjectCard';
import { DashboardSummary } from '../types';
import { analyticsService } from '../services/analytics';
import { useToast } from '../context/ToastContext';

export const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSiteId, setSelectedSiteId] = useState<string | undefined>(undefined);

  const { showToast } = useToast();

  const fetchSummary = async (showRefreshToast = false) => {
    if (showRefreshToast) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const data = await analyticsService.getDashboardSummary();
      setSummary(data);
      if (showRefreshToast) showToast('Geospatial metrics synchronized with PostGIS.', 'info');
    } catch (err: any) {
      showToast('Failed to load dashboard metrics. Please refresh.', 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (isLoading && !summary) {
    return <LoadingSpinner message="Querying PostGIS spatial registry & aggregating metrics..." />;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Command Center Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0a1215] border border-[#1c353d] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
              Active Geospatial Telemetry
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Global Project Cockpit
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time geospatial analytics, PostGIS geometry calculations, and certified carbon & biodiversity metrics
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fetchSummary(true)}
            isLoading={isRefreshing}
            className="bg-[#0f1b1f] hover:bg-[#132328] border-[#1c353d]"
            icon={<RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />}
          >
            Sync Database
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="shadow-glow-emerald"
            icon={<Plus className="w-4 h-4" />}
          >
            Create Project
          </Button>
        </div>
      </div>

      {/* 1. Summary Cards (Live from Backend Database) */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Total Projects */}
          <div className="glass-card rounded-2xl p-5 border border-[#1c353d] relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Total Projects
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-md group-hover:scale-105 transition-transform">
                <FolderKanban className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white mt-3 tracking-tight font-mono">
              {summary.total_projects}
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="text-emerald-400 font-medium">{summary.active_projects_count} Active</span>
              <span className="text-slate-500 font-mono">100% DB sync</span>
            </div>
          </div>

          {/* Total Sites */}
          <div className="glass-card rounded-2xl p-5 border border-[#1c353d] relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Total Sites
              </span>
              <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-md group-hover:scale-105 transition-transform">
                <MapPin className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white mt-3 tracking-tight font-mono">
              {summary.total_sites}
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="text-cyan-400 font-medium">PostGIS Polygons</span>
              <span className="text-slate-500 font-mono">SRID 4326</span>
            </div>
          </div>

          {/* Total Area */}
          <div className="glass-card rounded-2xl p-5 border border-[#1c353d] relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Total Area
              </span>
              <div className="w-9 h-9 rounded-xl bg-teal-950/80 border border-teal-500/40 flex items-center justify-center text-teal-400 shadow-md group-hover:scale-105 transition-transform">
                <Compass className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white mt-3 tracking-tight font-mono">
              {summary.total_area_hectares.toLocaleString()}{' '}
              <span className="text-xs font-semibold text-teal-400 font-sans">ha</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="text-slate-300 font-medium">{summary.total_area_km2.toLocaleString()} km²</span>
              <span className="text-slate-500 font-mono">Geodesic</span>
            </div>
          </div>

          {/* Carbon Projects */}
          <div className="glass-card rounded-2xl p-5 border border-[#1c353d] relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Carbon Projects
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-md group-hover:scale-105 transition-transform">
                <Leaf className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white mt-3 tracking-tight font-mono">
              {summary.carbon_projects_count}
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="text-emerald-400 font-medium">~{summary.total_carbon_sequestered_tonnes.toLocaleString()} tCO₂e</span>
              <span className="text-slate-500 font-mono">MRV</span>
            </div>
          </div>

          {/* Biodiversity Projects */}
          <div className="glass-card rounded-2xl p-5 border border-[#1c353d] relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Biodiversity
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-md group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white mt-3 tracking-tight font-mono">
              {summary.biodiversity_projects_count + summary.combined_projects_count}
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="text-purple-300 font-medium">Score: {summary.average_biodiversity_score}/100</span>
              <span className="text-slate-500 font-mono">Canopy</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. Main Interactive Mapbox Map */}
      <div className="space-y-4" id="map">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">Interactive Geospatial Map</h2>
              <span className="text-[10px] font-mono bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full">
                Live PostGIS Layer
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Click any project polygon boundary to inspect real-time metrics and open time-series analytics
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-[#0a1215] px-3 py-1.5 rounded-xl border border-[#1c353d]">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>PostGIS GiST Spatial Index Active</span>
          </div>
        </div>

        <div className="rounded-3xl overflow-hidden border border-[#1c353d] shadow-2xl">
          <MapboxViewer
            geojson={summary?.sites_geojson}
            selectedSiteId={selectedSiteId}
            onSelectSite={(id) => setSelectedSiteId(id)}
            height="520px"
            zoomToBounds={true}
          />
        </div>
      </div>

      {/* 3. Recent Projects & Sites Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Environmental Projects</h2>
              <p className="text-xs text-slate-400">Recent high-integrity carbon and biodiversity projects</p>
            </div>
            <Link
              to="/projects"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-950/40 hover:bg-emerald-950/70 border border-emerald-500/30 px-3 py-1.5 rounded-xl transition-all"
            >
              <span>View All Projects</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {summary?.recent_projects && summary.recent_projects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {summary.recent_projects.slice(0, 4).map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Projects Found"
              description="Create your first environmental carbon or biodiversity project to begin mapping."
              action={
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsCreateModalOpen(true)}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Create Project
                </Button>
              }
            />
          )}
        </div>

        {/* Recent Sites Sidebar List */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Geographical Sites</h2>
            <p className="text-xs text-slate-400">PostGIS polygon sites registered</p>
          </div>
          <div className="space-y-2.5">
            {summary?.recent_sites && summary.recent_sites.length > 0 ? (
              summary.recent_sites.map((site) => (
                <Link
                  key={site.id}
                  to={`/sites/${site.id}`}
                  className="glass-card rounded-2xl p-4 border border-[#1c353d] flex items-center justify-between hover:border-emerald-500/50 hover:bg-[#182b31] transition-all block group shadow-md"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-white group-hover:text-emerald-300 transition-colors">
                        {site.name}
                      </span>
                      <Badge variant="neutral">{site.site_type}</Badge>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <span>Project:</span>
                      <span className="text-slate-200 font-medium truncate max-w-[140px]">{site.project_name}</span>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <div>
                      <div className="text-xs font-bold text-emerald-400 font-mono">
                        {site.area_hectares.toLocaleString()} ha
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {site.area_km2.toLocaleString()} km²
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic p-6 text-center glass-card rounded-2xl border border-[#1c353d]">
                No sites created yet. Open a project to draw your first polygon.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreated={fetchSummary}
      />
    </div>
  );
};
