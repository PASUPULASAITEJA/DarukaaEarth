import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  MapPin,
  Calendar,
  Layers,
  Compass,
  ArrowRight,
  Database,
  Leaf,
  Sparkles,
  Trees,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { Modal } from '../components/UI/Modal';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import { EmptyState } from '../components/UI/EmptyState';
import { MapboxViewer } from '../components/Map/MapboxViewer';
import { MapboxDrawer } from '../components/Map/MapboxDrawer';
import { Project, Site, SiteType, SiteCreateInput } from '../types';
import { GeoJSONFeatureCollection } from '../types/geojson';
import { projectService } from '../services/projects';
import { siteService } from '../services/sites';
import { useToast } from '../context/ToastContext';

export const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [sitesGeoJSON, setSitesGeoJSON] = useState<GeoJSONFeatureCollection | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // Add Site Modal States
  const [isAddSiteModalOpen, setIsAddSiteModalOpen] = useState(false);
  const [siteName, setSiteName] = useState('');
  const [siteDesc, setSiteDesc] = useState('');
  const [siteType, setSiteType] = useState<SiteType>('Forest');
  const [drawnGeometry, setDrawnGeometry] = useState<any>(null);
  const [calculatedAreaHa, setCalculatedAreaHa] = useState<number>(0);
  const [calculatedAreaKm2, setCalculatedAreaKm2] = useState<number>(0);
  const [isSubmittingSite, setIsSubmittingSite] = useState(false);

  // Delete project state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { showToast } = useToast();
  const navigate = useNavigate();

  const loadProjectData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [projData, sitesData, geojsonData] = await Promise.all([
        projectService.getProject(id),
        projectService.getProjectSites(id),
        siteService.getAllSitesGeoJSON(id),
      ]);
      setProject(projData);
      setSites(sitesData);
      setSitesGeoJSON(geojsonData);
    } catch (err: any) {
      showToast('Failed to load project details.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjectData();
  }, [id]);

  const handleCreateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (!siteName.trim()) {
      showToast('Site name is required.', 'error');
      return;
    }
    if (!drawnGeometry) {
      showToast('Please draw a polygon boundary on the map first.', 'error');
      return;
    }

    setIsSubmittingSite(true);
    try {
      const payload: SiteCreateInput = {
        project_id: id,
        name: siteName.trim(),
        description: siteDesc.trim() || undefined,
        site_type: siteType,
        geometry: drawnGeometry,
      };

      await siteService.createSite(payload);
      showToast('Geographical site saved to PostGIS successfully!', 'success');
      setIsAddSiteModalOpen(false);
      setSiteName('');
      setSiteDesc('');
      setDrawnGeometry(null);
      setCalculatedAreaHa(0);
      setCalculatedAreaKm2(0);
      loadProjectData();
    } catch (err: any) {
      showToast(
        err.response?.data?.detail || 'Failed to save site. Ensure geometry is a valid polygon.',
        'error'
      );
    } finally {
      setIsSubmittingSite(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await projectService.deleteProject(id);
      showToast('Project deleted successfully.', 'success');
      navigate('/projects');
    } catch (err: any) {
      showToast('Failed to delete project.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading && !project) {
    return <LoadingSpinner message="Loading project details & GIS layers from PostGIS..." />;
  }

  if (!project) {
    return (
      <EmptyState
        title="Project Not Found"
        description="The requested environmental project could not be loaded."
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
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-300 transition-colors bg-[#0a1215] border border-[#1c353d] px-3.5 py-2 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-400" />
          <span>Back to All Projects</span>
        </Link>

        <div className="flex items-center gap-3">
          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsDeleteModalOpen(true)}
            icon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Delete Project
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddSiteModalOpen(true)}
            className="shadow-glow-emerald"
            icon={<Plus className="w-4 h-4" />}
          >
            Add Site (Draw Polygon)
          </Button>
        </div>
      </div>

      {/* Project Overview Cockpit Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#1c353d] relative overflow-hidden shadow-2xl">
        <div className="flex flex-wrap items-center gap-2.5 mb-3.5">
          <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
            {project.project_type}
          </span>
          <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
            {project.status}
          </span>
          {(project.country || project.region) && (
            <span className="text-xs text-slate-300 flex items-center gap-1.5 font-sans">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              {[project.region, project.country].filter(Boolean).join(', ')}
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          {project.name}
        </h1>

        <p className="text-sm text-slate-300 mt-3 max-w-3xl leading-relaxed">
          {project.description || 'No detailed description provided for this environmental project.'}
        </p>

        {/* Aggregate Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#1c353d]">
          <div className="bg-[#060c0e]/60 p-4 rounded-2xl border border-[#1c353d]">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Total Sites
            </span>
            <div className="text-2xl font-extrabold text-white mt-1 font-mono">
              {project.sites_count}
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">Polygons</div>
          </div>

          <div className="bg-[#060c0e]/60 p-4 rounded-2xl border border-[#1c353d]">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Total Area (Hectares)
            </span>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">
              {project.total_area_hectares.toLocaleString()} <span className="text-xs font-sans text-emerald-300">ha</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">WGS84 Geodesic</div>
          </div>

          <div className="bg-[#060c0e]/60 p-4 rounded-2xl border border-[#1c353d]">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Total Area (km²)
            </span>
            <div className="text-2xl font-extrabold text-white mt-1 font-mono">
              {project.total_area_km2.toLocaleString()} <span className="text-xs font-sans text-slate-400">km²</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">Surface Extent</div>
          </div>

          <div className="bg-[#060c0e]/60 p-4 rounded-2xl border border-[#1c353d]">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Timeline
            </span>
            <div className="text-xs font-semibold text-slate-200 mt-2 font-mono">
              {project.start_date || 'Not specified'}
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">Start Date</div>
          </div>
        </div>
      </div>

      {/* Project Sites Mapbox View */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-tight">Project Geographical Boundaries</h2>
            <span className="text-[10px] font-mono bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full">
              {sites.length} {sites.length === 1 ? 'Site' : 'Sites'} in PostGIS
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Click polygon to launch site analytics
          </span>
        </div>

        {sites.length > 0 ? (
          <div className="rounded-3xl overflow-hidden border border-[#1c353d] shadow-2xl">
            <MapboxViewer geojson={sitesGeoJSON} height="460px" zoomToBounds={true} />
          </div>
        ) : (
          <div className="p-10 text-center glass-panel rounded-3xl border border-dashed border-[#1c353d]">
            <Compass className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <p className="text-base font-bold text-white">No geographical sites added yet.</p>
            <p className="text-xs text-slate-400 mt-1 mb-5 max-w-md mx-auto">
              Click &quot;Add Site&quot; below to open the Mapbox interactive drawing tool and define your first polygon boundary.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddSiteModalOpen(true)}
              className="shadow-glow-emerald"
              icon={<Plus className="w-4 h-4" />}
            >
              Add First Site
            </Button>
          </div>
        )}
      </div>

      {/* Sites List Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight">Project Sites & Performance</h2>

        {sites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sites.map((s) => (
              <div
                key={s.id}
                className="glass-card rounded-3xl p-5 border border-[#1c353d] flex flex-col justify-between hover:border-emerald-500/50 hover:bg-[#182b31] transition-all shadow-md group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                      {s.site_type}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {s.area_hectares.toLocaleString()} ha
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-sm group-hover:text-emerald-300 transition-colors">{s.name}</h3>
                  <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed font-normal">
                    {s.description || 'No description provided.'}
                  </p>
                  <div className="mt-3.5 pt-3 border-t border-[#1c353d]/80 text-[11px] font-mono text-slate-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Centroid:</span>
                      <span className="text-slate-300">{s.centroid_latitude}°, {s.centroid_longitude}°</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t border-[#1c353d] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-500">
                    {s.area_km2.toLocaleString()} km²
                  </span>
                  <Link
                    to={`/sites/${s.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-950 text-xs font-semibold text-emerald-300 border border-emerald-500/30 group-hover:border-emerald-400/50 transition-all shadow-sm"
                  >
                    <span>View Analytics</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* Add Site Modal (Draw Polygon on Mapbox) */}
      <Modal
        isOpen={isAddSiteModalOpen}
        onClose={() => setIsAddSiteModalOpen(false)}
        title="Add Geographical Site"
        subtitle="Draw a polygon directly on the map to calculate site boundary & area"
        maxWidth="4xl"
      >
        <form onSubmit={handleCreateSite} className="space-y-5">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Site Name <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                required
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="e.g. Primary Forest Sector A"
                className="w-full bg-[#060c0e] border border-[#1c353d] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Site Biome Type
              </label>
              <select
                value={siteType}
                onChange={(e) => setSiteType(e.target.value as SiteType)}
                className="w-full bg-[#060c0e] border border-[#1c353d] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Forest">Forest Canopy</option>
                <option value="Peatland">Peatland / Bog</option>
                <option value="Wetland">Wetland</option>
                <option value="Grassland">Grassland</option>
                <option value="Mangrove">Mangrove / Blue Carbon</option>
                <option value="Agroforestry">Agroforestry</option>
                <option value="Marine">Marine Protected Area</option>
                <option value="Savanna">Savanna</option>
                <option value="Other">Other Biome</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Site Description
            </label>
            <input
              type="text"
              value={siteDesc}
              onChange={(e) => setSiteDesc(e.target.value)}
              placeholder="Ecological characteristics, canopy density, planting species..."
              className="w-full bg-[#060c0e] border border-[#1c353d] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Mapbox Polygon Drawer Component */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Draw Polygon on Map <span className="text-emerald-400">*</span>
              <span className="ml-2 font-normal text-slate-400">
                (Click polygon drawing tool at top-right of map to draw and close boundary)
              </span>
            </label>
            <div className="rounded-2xl overflow-hidden border border-[#1c353d]">
              <MapboxDrawer
                height="380px"
                onPolygonChange={(geo, ha, km2) => {
                  setDrawnGeometry(geo);
                  setCalculatedAreaHa(ha);
                  setCalculatedAreaKm2(km2);
                }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-[#1c353d] flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsAddSiteModalOpen(false)}
              disabled={isSubmittingSite}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="shadow-glow-emerald"
              isLoading={isSubmittingSite}
              disabled={!drawnGeometry || !siteName.trim()}
            >
              Save Site to PostGIS ({calculatedAreaHa.toLocaleString()} ha)
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Project?"
        subtitle="This action cannot be undone and will delete all associated sites & analytics."
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            Are you sure you want to permanently delete{' '}
            <strong className="text-white">{project.name}</strong>?
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
              onClick={handleDeleteProject}
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
