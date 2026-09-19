import React, { useState, useMemo } from 'react';
import {
  Globe,
  Sparkles,
  ShieldAlert,
  Search,
  ExternalLink,
  RefreshCw,
  Layers,
  Leaf,
  Info,
  Calendar,
  Camera,
  MapPin,
  CheckCircle2,
  TreePine,
  AlertCircle,
} from 'lucide-react';
import { SiteBiodiversityResponse, GBIFSpeciesRecord } from '../../types';
import { Button } from '../UI/Button';
import { Badge } from '../UI/Badge';

interface GBIFBiodiversityPanelProps {
  biodiversity: SiteBiodiversityResponse | null;
  isLoading: boolean;
  onRefresh?: () => void;
}

export const GBIFBiodiversityPanel: React.FC<GBIFBiodiversityPanelProps> = ({
  biodiversity,
  isLoading,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKingdom, setSelectedKingdom] = useState<string>('ALL');
  const [threatOnly, setThreatOnly] = useState(false);

  const filteredSpecies = useMemo(() => {
    if (!biodiversity?.verified_species) return [];
    return biodiversity.verified_species.filter((spec) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        spec.scientific_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (spec.common_name && spec.common_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (spec.family && spec.family.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (spec.class_name && spec.class_name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesKingdom =
        selectedKingdom === 'ALL' ||
        (spec.kingdom && spec.kingdom.toLowerCase() === selectedKingdom.toLowerCase());

      const matchesThreat =
        !threatOnly ||
        (spec.iucn_category && ['CR', 'EN', 'VU'].includes(spec.iucn_category.toUpperCase()));

      return matchesSearch && matchesKingdom && matchesThreat;
    });
  }, [biodiversity, searchQuery, selectedKingdom, threatOnly]);

  const getIUCNBadgeStyle = (category?: string) => {
    switch (category?.toUpperCase()) {
      case 'CR':
        return 'bg-red-950/90 text-red-300 border-red-500/50 shadow-red-950/50';
      case 'EN':
        return 'bg-orange-950/90 text-orange-300 border-orange-500/50 shadow-orange-950/50';
      case 'VU':
        return 'bg-amber-950/90 text-amber-300 border-amber-500/50 shadow-amber-950/50';
      case 'NT':
        return 'bg-lime-950/90 text-lime-300 border-lime-500/50 shadow-lime-950/50';
      case 'LC':
        return 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50 shadow-emerald-950/50';
      default:
        return 'bg-slate-900/90 text-slate-300 border-slate-700/50 shadow-slate-950/50';
    }
  };

  if (isLoading && !biodiversity) {
    return (
      <div className="glass-panel p-8 rounded-3xl border border-[#1c353d] flex flex-col items-center justify-center space-y-4 min-h-[320px]">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        <div className="text-center">
          <p className="text-sm font-semibold text-white">Querying GBIF Biodiversity Backbone...</p>
          <p className="text-xs text-slate-400 mt-1">
            Analyzing global occurrence records, IUCN Red List categories, and spatial coordinates
          </p>
        </div>
      </div>
    );
  }

  if (!biodiversity) return null;

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#1c353d] relative overflow-hidden shadow-2xl space-y-7">
      {/* Top Header Cockpit */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1c353d]/80">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-950 via-[#0a1c22] to-emerald-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-950/40 shrink-0">
            <Globe className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 tracking-wider">
                GBIF Verified
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {biodiversity.is_live_data ? 'Live Geospatial Telemetry' : 'Regional Biome Baseline'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              GBIF Biodiversity & Species Telemetry
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Global Biodiversity Information Facility occurrence ledger synced with PostGIS boundary
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          {onRefresh && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onRefresh}
              isLoading={isLoading}
              icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
              className="bg-[#0b1619] hover:bg-[#122328] border-[#1c353d] text-xs font-mono"
            >
              Sync GBIF
            </Button>
          )}
          <a
            href="https://www.gbif.org"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#091417] border border-[#1c353d] text-xs font-medium text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-colors"
          >
            <span>GBIF.org</span>
            <ExternalLink className="w-3 h-3 text-cyan-400" />
          </a>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#060c0e]/80 p-4 rounded-2xl border border-[#1c353d] relative overflow-hidden group hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
              Total Occurrences
            </span>
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            {biodiversity.total_occurrences.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">Spatial observation records</div>
        </div>

        <div className="bg-[#060c0e]/80 p-4 rounded-2xl border border-[#1c353d] relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
              Species Richness
            </span>
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
            {biodiversity.distinct_species_count}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">Unique observed taxa</div>
        </div>

        <div className="bg-[#060c0e]/80 p-4 rounded-2xl border border-[#1c353d] relative overflow-hidden group hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
              Biodiversity Score
            </span>
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-300 font-mono">
            {biodiversity.biodiversity_index}
            <span className="text-xs font-sans text-slate-400 font-normal"> /100</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">
            Shannon H': {biodiversity.shannon_diversity_index}
          </div>
        </div>

        <div className="bg-[#060c0e]/80 p-4 rounded-2xl border border-[#1c353d] relative overflow-hidden group hover:border-red-500/30 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
              Threatened Taxa
            </span>
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">
            {biodiversity.threat_status_summary.total_threatened}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">IUCN Red List (CR/EN/VU)</div>
        </div>
      </div>

      {/* IUCN Red List Matrix & Kingdom Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* IUCN Matrix Bar */}
        <div className="lg:col-span-2 bg-[#081215]/80 p-5 rounded-2xl border border-[#1c353d] space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              IUCN Red List Conservation Matrix
            </span>
            <span className="text-[10px] font-mono text-slate-500">Global Threat Categories</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            <div className="bg-red-950/40 border border-red-500/30 p-2.5 rounded-xl text-center">
              <div className="text-[10px] font-mono font-bold text-red-400">CR</div>
              <div className="text-base font-extrabold text-white font-mono mt-0.5">
                {biodiversity.threat_status_summary.critically_endangered}
              </div>
              <div className="text-[9px] text-slate-400 leading-tight">Critically End.</div>
            </div>

            <div className="bg-orange-950/40 border border-orange-500/30 p-2.5 rounded-xl text-center">
              <div className="text-[10px] font-mono font-bold text-orange-400">EN</div>
              <div className="text-base font-extrabold text-white font-mono mt-0.5">
                {biodiversity.threat_status_summary.endangered}
              </div>
              <div className="text-[9px] text-slate-400 leading-tight">Endangered</div>
            </div>

            <div className="bg-amber-950/40 border border-amber-500/30 p-2.5 rounded-xl text-center">
              <div className="text-[10px] font-mono font-bold text-amber-400">VU</div>
              <div className="text-base font-extrabold text-white font-mono mt-0.5">
                {biodiversity.threat_status_summary.vulnerable}
              </div>
              <div className="text-[9px] text-slate-400 leading-tight">Vulnerable</div>
            </div>

            <div className="bg-lime-950/40 border border-lime-500/30 p-2.5 rounded-xl text-center">
              <div className="text-[10px] font-mono font-bold text-lime-400">NT</div>
              <div className="text-base font-extrabold text-white font-mono mt-0.5">
                {biodiversity.threat_status_summary.near_threatened}
              </div>
              <div className="text-[9px] text-slate-400 leading-tight">Near Threat.</div>
            </div>

            <div className="bg-emerald-950/40 border border-emerald-500/30 p-2.5 rounded-xl text-center">
              <div className="text-[10px] font-mono font-bold text-emerald-400">LC</div>
              <div className="text-base font-extrabold text-white font-mono mt-0.5">
                {biodiversity.threat_status_summary.least_concern}
              </div>
              <div className="text-[9px] text-slate-400 leading-tight">Least Concern</div>
            </div>

            <div className="bg-slate-900/40 border border-slate-700/30 p-2.5 rounded-xl text-center">
              <div className="text-[10px] font-mono font-bold text-slate-400">NE/DD</div>
              <div className="text-base font-extrabold text-white font-mono mt-0.5">
                {biodiversity.threat_status_summary.data_deficient_or_not_evaluated}
              </div>
              <div className="text-[9px] text-slate-400 leading-tight">Other/NE</div>
            </div>
          </div>
        </div>

        {/* Taxonomic Breakdown */}
        <div className="bg-[#081215]/80 p-5 rounded-2xl border border-[#1c353d] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <TreePine className="w-4 h-4 text-emerald-400" />
              Taxonomic Kingdoms
            </span>
          </div>

          <div className="space-y-2">
            {biodiversity.kingdom_distribution.length > 0 ? (
              biodiversity.kingdom_distribution.slice(0, 4).map((tax) => (
                <div key={tax.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">{tax.name}</span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {tax.count} ({tax.percentage ?? 0}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#0e1e24] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        tax.name === 'Plantae'
                          ? 'bg-emerald-500'
                          : tax.name === 'Animalia'
                          ? 'bg-cyan-500'
                          : tax.name === 'Fungi'
                          ? 'bg-amber-500'
                          : 'bg-purple-500'
                      }`}
                      style={{ width: `${Math.min(100, tax.percentage || 10)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic">No kingdom breakdown available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Observed Species Catalog Explorer */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Observed Species Catalog ({filteredSpecies.length})
            </h3>
            <p className="text-xs text-slate-400">
              Verified scientific observations documented within this ecological boundary
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[180px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search species..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#091417] border border-[#1c353d] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <select
              value={selectedKingdom}
              onChange={(e) => setSelectedKingdom(e.target.value)}
              className="bg-[#091417] border border-[#1c353d] text-xs text-slate-300 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-cyan-500/50"
            >
              <option value="ALL">All Kingdoms</option>
              <option value="Plantae">Flora (Plantae)</option>
              <option value="Animalia">Fauna (Animalia)</option>
              <option value="Fungi">Fungi</option>
            </select>

            <button
              type="button"
              onClick={() => setThreatOnly(!threatOnly)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                threatOnly
                  ? 'bg-amber-950/80 border-amber-500/50 text-amber-300'
                  : 'bg-[#091417] border-[#1c353d] text-slate-400 hover:text-slate-200'
              }`}
            >
              Threatened Only
            </button>
          </div>
        </div>

        {/* Species Cards Grid */}
        {filteredSpecies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSpecies.map((species, idx) => (
              <div
                key={`${species.scientific_name}-${idx}`}
                className="bg-[#060c0e]/90 hover:bg-[#0a161b] border border-[#1c353d] hover:border-cyan-500/40 rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between space-y-3 group shadow-lg"
              >
                <div>
                  {/* Photo or Habitat Placeholder */}
                  <div className="w-full h-36 rounded-xl overflow-hidden bg-[#0a1418] border border-[#1c353d]/80 relative mb-3 flex items-center justify-center">
                    {species.image_url ? (
                      <img
                        src={species.image_url}
                        alt={species.common_name || species.scientific_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          // Fallback on image load error
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-600 gap-1">
                        <Leaf className="w-8 h-8 text-emerald-600/40" />
                        <span className="text-[10px] font-mono text-slate-500">Taxon Verified</span>
                      </div>
                    )}

                    {/* IUCN Status Chip on Image */}
                    <div className="absolute top-2 right-2">
                      <span
                        className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full border shadow-sm ${getIUCNBadgeStyle(
                          species.iucn_category
                        )}`}
                      >
                        {species.iucn_category || 'NE'}
                      </span>
                    </div>

                    {/* Kingdom Chip on Image */}
                    <div className="absolute bottom-2 left-2">
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-slate-200 border border-white/10">
                        {species.kingdom || 'Taxon'}
                      </span>
                    </div>
                  </div>

                  {/* Vernacular & Binomial Name */}
                  <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {species.common_name || species.scientific_name}
                  </h4>
                  <p className="text-xs text-slate-400 italic font-serif">
                    {species.scientific_name}
                  </p>

                  {/* Taxonomy Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {species.family && (
                      <span className="text-[10px] font-mono bg-[#0c1a1f] text-slate-400 px-2 py-0.5 rounded border border-[#1c353d]">
                        {species.family}
                      </span>
                    )}
                    {species.class_name && (
                      <span className="text-[10px] font-mono bg-[#0c1a1f] text-cyan-300/80 px-2 py-0.5 rounded border border-[#1c353d]">
                        {species.class_name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer with Sighting Date & GBIF link */}
                <div className="pt-2.5 border-t border-[#1c353d]/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {species.recorded_date ? species.recorded_date.slice(0, 10) : 'Verified Sighting'}
                  </span>

                  {species.gbif_url ? (
                    <a
                      href={species.gbif_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold"
                    >
                      <span>GBIF Record</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ) : (
                    <span className="text-slate-600">GBIF Verified</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-[#060c0e]/60 border border-[#1c353d] text-center space-y-2">
            <AlertCircle className="w-6 h-6 text-slate-500 mx-auto" />
            <p className="text-xs text-slate-300 font-medium">
              No species matched "{searchQuery}" under the current filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedKingdom('ALL');
                setThreatOnly(false);
              }}
              className="text-xs text-cyan-400 underline font-semibold hover:text-cyan-300"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
