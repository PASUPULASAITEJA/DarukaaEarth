import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useNavigate } from 'react-router-dom';
import { GeoJSONFeatureCollection } from '../../types/geojson';
import { MapLegend } from './MapLegend';
import { Search, MapPin, Check, Globe, Tag } from 'lucide-react';

interface MapboxViewerProps {
  geojson?: GeoJSONFeatureCollection;
  selectedSiteId?: string;
  onSelectSite?: (siteId: string) => void;
  height?: string;
  zoomToBounds?: boolean;
}

// Highly reliable open styles with world place names & zero API key requirement (Esri Enterprise Public CDN)
const OPEN_MAP_STYLES: Record<string, string | maplibregl.StyleSpecification> = {
  dark: {
    version: 8,
    sources: {
      'esri-dark-base': {
        type: 'raster',
        tiles: [
          'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        ],
        tileSize: 256,
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
      },
      'esri-dark-labels': {
        type: 'raster',
        tiles: [
          'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
        ],
        tileSize: 256,
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
      },
    },
    layers: [
      {
        id: 'esri-dark-base-tiles',
        type: 'raster',
        source: 'esri-dark-base',
        minzoom: 0,
        maxzoom: 20,
      },
      {
        id: 'esri-dark-labels-tiles',
        type: 'raster',
        source: 'esri-dark-labels',
        minzoom: 0,
        maxzoom: 20,
      },
    ],
  },
  satellite: {
    version: 8,
    sources: {
      'esri-satellite': {
        type: 'raster',
        tiles: [
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        ],
        tileSize: 256,
        attribution: 'Tiles &copy; Esri World Imagery',
      },
      'esri-labels': {
        type: 'raster',
        tiles: [
          'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        ],
        tileSize: 256,
        attribution: 'Tiles &copy; Esri World Boundaries & Places',
      },
    },
    layers: [
      {
        id: 'esri-satellite-tiles',
        type: 'raster',
        source: 'esri-satellite',
        minzoom: 0,
        maxzoom: 20,
      },
      {
        id: 'esri-labels-tiles',
        type: 'raster',
        source: 'esri-labels',
        minzoom: 0,
        maxzoom: 20,
      },
    ],
  },
  outdoors: {
    version: 8,
    sources: {
      'esri-topo': {
        type: 'raster',
        tiles: [
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
        ],
        tileSize: 256,
        attribution: 'Tiles &copy; Esri World Topographic Map',
      },
    },
    layers: [
      {
        id: 'esri-topo-tiles',
        type: 'raster',
        source: 'esri-topo',
        minzoom: 0,
        maxzoom: 20,
      },
    ],
  },
};

const MAPBOX_VECTOR_STYLES: Record<string, string> = {
  dark: 'mapbox://styles/mapbox/dark-v11',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  outdoors: 'mapbox://styles/mapbox/outdoors-v12',
};

export const MapboxViewer: React.FC<MapboxViewerProps> = ({
  geojson,
  selectedSiteId,
  onSelectSite,
  height = '500px',
  zoomToBounds = true,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapStyle, setMapStyle] = useState<'dark' | 'satellite' | 'outdoors'>('dark');
  const [showSiteNames, setShowSiteNames] = useState(true);
  const [useMapboxVector, setUseMapboxVector] = useState<boolean>(() => {
    return localStorage.getItem('darukaa_use_mapbox_vector') === 'true';
  });

  const [mapboxToken, setMapboxToken] = useState<string>(() => {
    return localStorage.getItem('darukaa_custom_mapbox_token') || '';
  });

  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number; zoom: number }>({
    lat: 0.0,
    lng: 0.0,
    zoom: 2.0,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const navigate = useNavigate();

  const getActiveStyle = (styleKey: 'dark' | 'satellite' | 'outdoors'): any => {
    if (useMapboxVector && mapboxToken && mapboxToken.startsWith('pk.')) {
      return MAPBOX_VECTOR_STYLES[styleKey];
    }
    return OPEN_MAP_STYLES[styleKey] || OPEN_MAP_STYLES.dark;
  };

  const renderGeoJsonLayers = useCallback(() => {
    if (!map.current || !geojson || !geojson.features) return;

    // Clear existing site name markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const sourceId = 'sites-geojson';
    const fillLayerId = 'sites-fill';
    const lineLayerId = 'sites-line';
    const highlightLayerId = 'sites-highlight';

    try {
      if (map.current.getLayer(highlightLayerId)) map.current.removeLayer(highlightLayerId);
      if (map.current.getLayer(lineLayerId)) map.current.removeLayer(lineLayerId);
      if (map.current.getLayer(fillLayerId)) map.current.removeLayer(fillLayerId);
      if (map.current.getSource(sourceId)) map.current.removeSource(sourceId);

      map.current.addSource(sourceId, {
        type: 'geojson',
        data: geojson as any,
      });

      // 1. Vibrant Polygon Fill Layer
      map.current.addLayer({
        id: fillLayerId,
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': [
            'match',
            ['get', 'project_type'],
            'Carbon',
            '#10b981',
            'Biodiversity',
            '#06b6d4',
            'Carbon & Biodiversity',
            '#a855f7',
            '#10b981',
          ],
          'fill-opacity': 0.6,
        },
      });

      // 2. High-Visibility Boundary Line Layer
      map.current.addLayer({
        id: lineLayerId,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': [
            'match',
            ['get', 'project_type'],
            'Carbon',
            '#34d399',
            'Biodiversity',
            '#22d3ee',
            'Carbon & Biodiversity',
            '#c084fc',
            '#34d399',
          ],
          'line-width': 3.5,
          'line-opacity': 0.95,
        },
      });

      // 3. Highlight Border for Selected Site
      map.current.addLayer({
        id: highlightLayerId,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': '#facc15',
          'line-width': 5,
        },
        filter: ['==', ['get', 'id'], selectedSiteId || ''],
      });

      // 4. Render visible site name badges with click-to-fly zoom
      if (showSiteNames && geojson.features.length > 0) {
        geojson.features.forEach((feat) => {
          const props = feat.properties as any;
          if (!feat.geometry || !feat.geometry.coordinates) return;

          let lngSum = 0;
          let latSum = 0;
          let count = 0;
          const siteBounds = new maplibregl.LngLatBounds();

          const extractCoords = (arr: any[]): void => {
            if (arr.length >= 2 && typeof arr[0] === 'number' && typeof arr[1] === 'number') {
              lngSum += arr[0];
              latSum += arr[1];
              siteBounds.extend([arr[0], arr[1]]);
              count++;
            } else if (Array.isArray(arr)) {
              arr.forEach(extractCoords);
            }
          };
          extractCoords(feat.geometry.coordinates);

          if (count > 0) {
            const centerLng = lngSum / count;
            const centerLat = latSum / count;

            const isSelected = selectedSiteId === props.id;
            const markerEl = document.createElement('div');
            markerEl.className = 'site-name-badge-container';

            const dotColor =
              props.project_type === 'Carbon'
                ? 'bg-emerald-400'
                : props.project_type === 'Biodiversity'
                ? 'bg-cyan-400'
                : 'bg-purple-400';

            const borderColor = isSelected
              ? 'border-yellow-400 ring-2 ring-yellow-400/50 shadow-[0_0_15px_rgba(250,204,21,0.4)]'
              : 'border-[#1c353d] hover:border-emerald-400';

            markerEl.innerHTML = `
              <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#060c0e]/95 border ${borderColor} backdrop-blur-md shadow-2xl transition-all cursor-pointer hover:scale-110 select-none pointer-events-auto">
                <span class="w-2.5 h-2.5 rounded-full ${dotColor} shrink-0 animate-pulse"></span>
                <span class="font-bold text-xs text-white tracking-tight whitespace-nowrap">${props.name || 'Site'}</span>
                ${
                  props.area_hectares
                    ? `<span class="text-[11px] text-emerald-300 font-mono font-semibold ml-0.5 whitespace-nowrap">${props.area_hectares.toLocaleString()}ha</span>`
                    : ''
                }
              </div>
            `;

            markerEl.onclick = (e) => {
              e.stopPropagation();
              if (map.current) {
                if (!siteBounds.isEmpty()) {
                  map.current.fitBounds(siteBounds, { padding: 120, maxZoom: 13, duration: 1500 });
                } else {
                  map.current.flyTo({
                    center: [centerLng, centerLat],
                    zoom: 11,
                    duration: 1500,
                    essential: true,
                  });
                }
              }
              if (onSelectSite) {
                onSelectSite(props.id);
              }
            };

            const marker = new maplibregl.Marker({ element: markerEl, anchor: 'center' })
              .setLngLat([centerLng, centerLat])
              .addTo(map.current!);

            markersRef.current.push(marker);
          }
        });
      }

      if (zoomToBounds && geojson.features.length > 0) {
        const bounds = new maplibregl.LngLatBounds();
        geojson.features.forEach((feat) => {
          if (feat.geometry && feat.geometry.coordinates) {
            const flatten = (arr: any[]): void => {
              if (
                arr.length >= 2 &&
                typeof arr[0] === 'number' &&
                typeof arr[1] === 'number'
              ) {
                bounds.extend([arr[0], arr[1]]);
              } else if (Array.isArray(arr)) {
                arr.forEach(flatten);
              }
            };
            flatten(feat.geometry.coordinates);
          }
        });
        if (!bounds.isEmpty()) {
          map.current.fitBounds(bounds, { padding: 60, maxZoom: 14 });
        }
      }
    } catch (err) {
      console.warn('GeoJSON layer warning:', err);
    }
  }, [geojson, selectedSiteId, zoomToBounds, showSiteNames, onSelectSite]);

  const initMap = useCallback(() => {
    if (!mapContainer.current) return;
    if (map.current) {
      map.current.remove();
      map.current = null;
    }

    try {
      const currentStyle = getActiveStyle(mapStyle);
      const newMap = new maplibregl.Map({
        container: mapContainer.current,
        style: currentStyle,
        center: [0, 20],
        zoom: 1.8,
        attributionControl: false,
        transformRequest: (url) => {
          if (useMapboxVector && mapboxToken && url.includes('mapbox.com')) {
            return {
              url: url.includes('access_token') ? url : `${url}${url.includes('?') ? '&' : '?'}access_token=${mapboxToken}`,
            };
          }
          return { url };
        },
      });

      newMap.addControl(new maplibregl.NavigationControl(), 'top-right');
      newMap.addControl(new maplibregl.FullscreenControl(), 'top-right');

      newMap.on('load', () => {
        setMapLoaded(true);
        newMap.resize();
        renderGeoJsonLayers();
      });

      newMap.on('style.load', () => {
        setMapLoaded(true);
        renderGeoJsonLayers();
      });

      newMap.on('mousemove', (e) => {
        setCursorCoords({
          lat: parseFloat(e.lngLat.lat.toFixed(4)),
          lng: parseFloat(e.lngLat.lng.toFixed(4)),
          zoom: parseFloat(newMap.getZoom().toFixed(1)),
        });
      });

      const popup = new maplibregl.Popup({
        closeButton: true,
        closeOnClick: true,
        maxWidth: '320px',
      });

      newMap.on('click', 'sites-fill', (e) => {
        if (!e.features || !e.features[0]) return;
        const feat = e.features[0];
        const props = feat.properties as any;
        const siteId = props.id;

        if (onSelectSite) {
          onSelectSite(siteId);
        }

        const coordinates = e.lngLat;
        const popupHtml = `
          <div class="space-y-2.5 font-sans p-1">
            <div class="flex items-center justify-between gap-2">
              <h4 class="font-bold text-sm text-white tracking-tight">${props.name || 'Site'}</h4>
              <span class="text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold ${
                props.project_type === 'Carbon'
                  ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/40'
                  : props.project_type === 'Biodiversity'
                  ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-500/40'
                  : 'bg-purple-950/90 text-purple-300 border border-purple-500/40'
              }">${props.project_type || 'Project'}</span>
            </div>
            <div class="text-xs text-slate-300 space-y-1.5 bg-[#060c0e]/80 p-2.5 rounded-xl border border-[#1c353d]">
              <p class="flex justify-between"><span class="text-slate-400">Project:</span> <strong class="text-slate-200 font-semibold">${props.project_name || '—'}</strong></p>
              <p class="flex justify-between"><span class="text-slate-400">Site Type:</span> <span class="text-slate-200">${props.site_type || '—'}</span></p>
              <p class="flex justify-between"><span class="text-slate-400">Geodesic Area:</span> <strong class="text-emerald-400 font-mono">${
                props.area_hectares || 0
              } ha</strong></p>
            </div>
            <div class="pt-1 flex gap-2">
              <button id="view-site-analytics-btn-${siteId}" class="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold py-2 px-3 rounded-xl shadow-lg transition-all cursor-pointer text-center flex items-center justify-center gap-1">
                Launch Site Analytics &rarr;
              </button>
            </div>
          </div>
        `;

        popup.setLngLat(coordinates).setHTML(popupHtml).addTo(newMap);

        setTimeout(() => {
          const btn = document.getElementById(`view-site-analytics-btn-${siteId}`);
          if (btn) {
            btn.onclick = () => {
              navigate(`/sites/${siteId}`);
            };
          }
        }, 50);
      });

      newMap.on('mouseenter', 'sites-fill', () => {
        newMap.getCanvas().style.cursor = 'pointer';
      });
      newMap.on('mouseleave', 'sites-fill', () => {
        newMap.getCanvas().style.cursor = '';
      });

      map.current = newMap;
      setTimeout(() => newMap.resize(), 300);
    } catch (err) {
      console.warn('Map initialization error:', err);
    }
  }, [mapStyle, mapboxToken, useMapboxVector, onSelectSite, navigate, renderGeoJsonLayers]);

  useEffect(() => {
    initMap();

    const handleResize = () => {
      if (map.current) map.current.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [useMapboxVector, mapboxToken, mapStyle]);

  useEffect(() => {
    if (mapLoaded) {
      renderGeoJsonLayers();
    }
  }, [geojson, mapLoaded, renderGeoJsonLayers]);

  const changeStyle = (styleKey: 'dark' | 'satellite' | 'outdoors') => {
    if (!map.current) return;
    setMapStyle(styleKey);
    map.current.setStyle(getActiveStyle(styleKey));
    map.current.once('style.load', () => {
      renderGeoJsonLayers();
    });
  };

  const handleLocationSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        searchQuery
      )}&limit=4`;
      const nomRes = await fetch(nominatimUrl, {
        headers: { 'Accept-Language': 'en' },
      });
      const nomData = await nomRes.json();
      if (nomData && nomData.length > 0) {
        const formatted = nomData.map((item: any) => ({
          id: item.place_id,
          place_name: item.display_name,
          center: [parseFloat(item.lon), parseFloat(item.lat)],
        }));
        setSearchResults(formatted);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Geocoding error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const flyToLocation = (center: [number, number]) => {
    if (map.current) {
      map.current.flyTo({ center, zoom: 7, essential: true });
      setSearchResults([]);
      setSearchQuery('');
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-[#1c353d] shadow-2xl bg-[#060c0e]">
      {/* Map canvas container */}
      <div
        ref={mapContainer}
        style={{ height, width: '100%', minHeight: '420px' }}
        className="w-full relative z-0"
      />

      {/* Top Controls Bar */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2">
        {/* Geocoding Search Input */}
        <div className="relative">
          <form onSubmit={handleLocationSearch} className="flex items-center">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search location / biome..."
                className="w-48 sm:w-60 bg-[#0a1215]/90 border border-[#1c353d] rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 backdrop-blur-xl transition-all shadow-xl"
              />
            </div>
          </form>

          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 mt-1.5 w-full bg-[#0a1215]/95 border border-[#1c353d] rounded-xl shadow-2xl overflow-hidden z-20 backdrop-blur-xl">
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => flyToLocation(result.center)}
                  className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-emerald-950/60 hover:text-emerald-300 flex items-center gap-2 border-b border-[#1c353d] last:border-b-0 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{result.place_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Style Switcher */}
        <div className="flex items-center bg-[#0a1215]/90 border border-[#1c353d] rounded-xl p-1 backdrop-blur-xl shadow-xl">
          <button
            onClick={() => changeStyle('dark')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              mapStyle === 'dark'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dark
          </button>
          <button
            onClick={() => changeStyle('satellite')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              mapStyle === 'satellite'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => changeStyle('outdoors')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              mapStyle === 'outdoors'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Terrain
          </button>
        </div>

        {/* Site Names Label Toggle */}
        <button
          type="button"
          onClick={() => setShowSiteNames((prev) => !prev)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold backdrop-blur-xl shadow-xl transition-all cursor-pointer ${
            showSiteNames
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300 shadow-emerald-950/50'
              : 'bg-[#0a1215]/90 border-[#1c353d] text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle Visible Site Names on Map"
        >
          <Tag className="w-3.5 h-3.5 text-emerald-400" />
          <span>Site Names: {showSiteNames ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Bottom Geospatial HUD Overlay */}
      <div className="absolute bottom-3 left-3 z-10 hidden sm:flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-[#0a1215]/85 backdrop-blur-xl border border-[#1c353d] text-[11px] font-mono text-slate-300 shadow-xl pointer-events-none">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-slate-400">LAT:</span>
          <span className="text-emerald-300 font-bold">{cursorCoords.lat}°</span>
        </div>
        <span className="text-[#1c353d]">|</span>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">LON:</span>
          <span className="text-cyan-300 font-bold">{cursorCoords.lng}°</span>
        </div>
        <span className="text-[#1c353d]">|</span>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">ZOOM:</span>
          <span className="text-teal-300 font-bold">{cursorCoords.zoom}x</span>
        </div>
      </div>

      {/* Legend */}
      <MapLegend />
    </div>
  );
};
