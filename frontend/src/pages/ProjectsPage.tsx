import React, { useEffect, useState } from 'react';
import { ProjectCard } from '../components/Projects/ProjectCard';
import { ProjectFilter } from '../components/Projects/ProjectFilter';
import { CreateProjectModal } from '../components/Projects/CreateProjectModal';
import { Button } from '../components/UI/Button';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import { EmptyState } from '../components/UI/EmptyState';
import { Project } from '../types';
import { projectService } from '../services/projects';
import { Plus, RefreshCw, FolderKanban } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { showToast } = useToast();

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await projectService.listProjects({
        search: search || undefined,
        project_type: selectedType || undefined,
        status: selectedStatus || undefined,
        page_size: 50,
      });
      setProjects(response.items);
    } catch (err: any) {
      showToast('Failed to load projects. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [search, selectedType, selectedStatus]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Environmental Projects
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your global carbon offset and biodiversity conservation portfolios
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchProjects}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            New Project
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-[#1e333a]">
        <ProjectFilter
          search={search}
          onSearchChange={setSearch}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
        />
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <LoadingSpinner message="Loading environmental projects..." />
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Projects Match Your Criteria"
          description="Try modifying your search keywords, clear the filters, or create a new environmental project."
          icon={<FolderKanban className="w-7 h-7" />}
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

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreated={fetchProjects}
      />
    </div>
  );
};
