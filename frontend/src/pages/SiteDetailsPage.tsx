import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Compass,
  MapPin,
  Calendar,
  Download,
  Trash2,
  BarChart3,
  Trees,
  Sparkles,
  Leaf,
  Info,
  Database,
  Activity,
} from 'lucide-react';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { Modal } from '../components/UI/Modal';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import { EmptyState } from '../components/UI/EmptyState';
import { MapboxViewer } from '../components/Map/MapboxViewer';
import { MetricOverviewCards } from '../components/Charts/MetricOverviewCards';
import { CarbonPerformanceChart } from '../components/Charts/CarbonPerformanceChart';
import { BiodiversityChart } from '../components/Charts/BiodiversityChart';
import { VegetationChart } from '../components/Charts/VegetationChart';
import { GBIFBiodiversityPanel } from '../components/Biodiversity/GBIFBiodiversityPanel';
import { Site, SiteAnalyticsResponse, SiteBiodiversityResponse } from '../types';
import { GeoJSONFeatureCollection } from '../types/geojson';
import { siteService } from '../services/sites';
import { analyticsService } from '../services/analytics';
import { biodiversityService } from '../services/biodiversity';
import { useToast } from '../context/ToastContext';

export const SiteDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [site, setSite] = useState<Site | null>(null);
  const [analytics, setAnalytics] = useState<SiteAnalyticsResponse | null>(null);
  const [biodiversity, setBiodiversity] = useState<SiteBiodiversityResponse | null>(null);
  const [isLoadingBiodiversity, setIsLoadingBiodiversity] = useState(false);
  const [siteGeoJSON, setSiteGeoJSON] = useState<GeoJSONFeatureCollection | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { showToast } = useToast();
  const navigate = useNavigate();

  const loadSiteData = async () => {
    if (!id) return;
    setIsLoading(true);
    setIsLoadingBiodiversity(true);
    try {
      const [siteData, analyticsData, biodivData] = await Promise.all([
        siteService.getSite(id),
        analyticsService.getSiteAnalytics(id),
        biodiversityService.getSiteBiodiversity(id).catch((err) => {
          console.warn('GBIF biodiversity telemetry fetch notice:', err);
          return null;
        }),
      ]);
      setSite(siteData);
      setAnalytics(analyticsData);
      if (biodivData) {
        setBiodiversity(biodivData);
      }


      if (siteData.geometry) {
        setSiteGeoJSON({
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              id: siteData.id,
              geometry: siteData.geometry,
              properties: {
                id: siteData.id,
                name: siteData.name,
                site_type: siteData.site_type,
                project_id: siteData.project_id,
                project_name: siteData.project_name,
                project_type: siteData.project_type,
                area_hectares: siteData.area_hectares,
                area_km2: siteData.area_km2,
                centroid_lat: siteData.centroid_latitude,
                centroid_lon: siteData.centroid_longitude,
              },
            },
          ],
        });
      }
    } catch (err: any) {
      showToast('Failed to load site details or analytics.', 'error');
    } finally {
      setIsLoading(false);
      setIsLoadingBiodiversity(false);
    }
  };

  const handleSyncGBIF = async () => {
    if (!id) return;
    setIsLoadingBiodiversity(true);
    try {
      const biodivData = await biodiversityService.getSiteBiodiversity(id);
      setBiodiversity(biodivData);
      showToast('GBIF biodiversity occurrence records refreshed.', 'success');
    } catch (err) {
      showToast('Failed to sync live GBIF telemetry.', 'error');
    } finally {
      setIsLoadingBiodiversity(false);
    }
  };

  useEffect(() => {
    loadSiteData();
  }, [id]);

  const handleDeleteSite = async () => {
    if (!id || !site) return;
    setIsDeleting(true);
    try {
      await siteService.deleteSite(id);
      showToast('Site deleted successfully.', 'success');
      navigate(`/projects/${site.project_id}`);
    } catch (err: any) {
      showToast('Failed to delete site.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportGeoJSON = () => {
    if (!siteGeoJSON || !site) return;
    const jsonStr = JSON.stringify(siteGeoJSON, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${site.name.toLowerCase().replace(/\s+/g, '_')}_boundary.geojson`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('GeoJSON boundary exported successfully!', 'success');
  };

  if (isLoading && !site) {
    return <LoadingSpinner message="Retrieving PostGIS polygon geometry & time-series analytics..." />;
  }

  if (!site) {
    return (
      <EmptyState
        title="Site Not Found"
        description="The requested site geometry could not be located in PostGIS."
        action={
          <Link to="/projects">
            <Button variant="primary">Back to Projects</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to={`/projects/${site.project_id}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-300 transition-colors bg-[#0a1215] border border-[#1c353d] px-3.5 py-2 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-400" />
          <span>Project: <strong className="text-white">{site.project_name}</strong></span>
        </Link>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportGeoJSON}
            className="bg-[#0f1b1f] hover:bg-[#132328] border-[#1c353d]"
            icon={<Download className="w-3.5 h-3.5 text-cyan-400" />}
          >
            Export GeoJSON
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsDeleteModalOpen(true)}
            icon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Delete Site
          </Button>
        </div>
      </div>

      {/* Site Header Overview Cockpit */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#1c353d] relative overflow-hidden shadow-2xl">
        <div className="flex flex-wrap items-center gap-2.5 mb-3">
          <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
            {site.site_type}
          </span>
          <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
            {site.project_type || 'Carbon Project'}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            ID: <span className="text-slate-300">{site.id.slice(0, 8)}...</span>
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          {site.name}
        </h1>

        <p className="text-sm text-slate-300 mt-2.5 max-w-3xl leading-relaxed">
          {site.description || 'Pristine conservation boundary monitored under verified environmental methodologies.'}
        </p>

        {/* Spatial Properties Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#1c353d]">
          <div className="bg-[#060c0e]/60 p-4 rounded-2xl border border-[#1c353d]">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Calculated Area
            </span>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">
              {site.area_hectares.toLocaleString()} <span className="text-xs font-sans text-emerald-300">ha</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">WGS84 Geodesic</div>
          </div>

          <div className="bg-[#060c0e]/60 p-4 rounded-2xl border border-[#1c353d]">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Square Kilometers
            </span>
            <div className="text-2xl font-extrabold text-white mt-1 font-mono">
              {site.area_km2.toLocaleString()} <span className="text-xs font-sans text-slate-400">km²</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">Surface Extent</div>
          </div>

          <div className="bg-[#060c0e]/60 p-4 rounded-2xl border border-[#1c353d]">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Centroid Coordinates
            </span>
            <div className="text-xs font-mono text-cyan-300 mt-2 font-bold">
              {site.centroid_latitude}°, {site.centroid_longitude}°
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">EPSG:4326</div>
          </div>

          <div className="bg-[#060c0e]/60 p-4 rounded-2xl border border-[#1c353d]">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Registered Date
            </span>
            <div className="text-xs font-semibold text-slate-200 mt-2 font-mono">
              {new Date(site.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">PostGIS Verified</div>
          </div>
        </div>
      </div>

      {/* Mapbox Site Boundary Viewer */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-tight">Site Polygon Geometry</h2>
            <span className="text-[10px] font-mono bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full">
              PostGIS GiST
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            SRID 4326
          </span>
        </div>

        <div className="rounded-3xl overflow-hidden border border-[#1c353d] shadow-2xl">
          <MapboxViewer
            geojson={siteGeoJSON}
            selectedSiteId={site.id}
            height="420px"
            zoomToBounds={true}
          />
        </div>
      </div>

      {/* GBIF Real-Time Biodiversity & Species Telemetry Panel */}
      <GBIFBiodiversityPanel
        biodiversity={biodiversity}
        isLoading={isLoadingBiodiversity}
        onRefresh={handleSyncGBIF}
      />

      {/* Environmental Analytics Section */}
      {analytics && (
        <div className="space-y-6">
          {/* Analytics Header with Required Demo Data Label */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-3xl bg-[#0f1b1f] border border-emerald-500/30 shadow-xl">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-950 to-[#132328] border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-md">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">
                  MRV Environmental Telemetry & Time-Series Ledger
                </h2>
                <p className="text-xs text-slate-400">
                  Historical carbon sequestration rate, biodiversity health index, and satellite canopy coverage (NDVI)
                </p>
              </div>
            </div>

            {analytics.is_sample_data && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-semibold shadow-inner">
                <Info className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Sample / Demonstration Dataset</span>
              </div>
            )}
          </div>

          {/* Current KPI Metric Overview Cards */}
          <MetricOverviewCards
            metrics={analytics.metrics}
            areaHectares={analytics.area_hectares}
            areaKm2={analytics.area_km2}
          />

          {/* Interactive Chart.js Graphs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Carbon Performance Chart */}
            <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-[#1c353d] space-y-4 shadow-xl">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-emerald-400" />
                  Carbon Sequestration Trajectory
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Monthly cumulative sequestration (tCO₂e) and emission reduction rate
                </p>
              </div>
              <CarbonPerformanceChart timeSeries={analytics.time_series} />
            </div>

            {/* Biodiversity Chart */}
            <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-[#1c353d] space-y-4 shadow-xl">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Biodiversity & Ecological Health
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Species richness index (0 to 100) and composite environmental performance score
                </p>
              </div>
              <BiodiversityChart timeSeries={analytics.time_series} />
            </div>
          </div>

          {/* Vegetation Canopy Full Width Chart */}
          <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-[#1c353d] space-y-4 shadow-xl">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Trees className="w-4 h-4 text-teal-400" />
                Vegetation Canopy Coverage Index (NDVI)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Satellite optical canopy density trajectory across sampling dates
              </p>
            </div>
            <VegetationChart timeSeries={analytics.time_series} />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Site?"
        subtitle="This action will permanently remove the polygon and its analytics from PostGIS."
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            Are you sure you want to delete site <strong className="text-white">{site.name}</strong>?
          </p>
          <div className="pt-3 border-t border-[#1c353d] flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleDeleteSite}
              isLoading={isDeleting}
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
