import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import * as turf from '@turf/turf';
import { Trash2, Edit3, Check, Search, MapPin, Globe } from 'lucide-react';

interface MapboxDrawerProps {
  initialCenter?: [number, number];
  initialZoom?: number;
  height?: string;
  onPolygonChange: (geojson: any, areaHectares: number, areaKm2: number) => void;
}

const OPEN_MAP_STYLES: Record<string, string | maplibregl.StyleSpecification> = {
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
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
    },
    layers: [
      {
        id: 'esri-satellite-tiles',
        type: 'raster',
        source: 'esri-satellite',
        minzoom: 0,
        maxzoom: 20,
      },
    ],
  },
  outdoors: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
};

const MAPBOX_VECTOR_STYLES: Record<string, string> = {
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  dark: 'mapbox://styles/mapbox/dark-v11',
  outdoors: 'mapbox://styles/mapbox/outdoors-v12',
};

export const MapboxDrawer: React.FC<MapboxDrawerProps> = ({
  initialCenter = [0, 20],
  initialZoom = 2.5,
  height = '420px',
  onPolygonChange,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const draw = useRef<MapboxDraw | null>(null);

  const [currentAreaHa, setCurrentAreaHa] = useState<number>(0);
  const [currentAreaKm2, setCurrentAreaKm2] = useState<number>(0);
  const [hasPolygon, setHasPolygon] = useState<boolean>(false);
  const [mapStyle, setMapStyle] = useState<'satellite' | 'dark' | 'outdoors'>('satellite');

  const [useMapboxVector, setUseMapboxVector] = useState<boolean>(() => {
    return localStorage.getItem('darukaa_use_mapbox_vector') === 'true';
  });

  const [mapboxToken, setMapboxToken] = useState<string>(() => {
    return localStorage.getItem('darukaa_custom_mapbox_token') || '';
  });

  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [tempToken, setTempToken] = useState(mapboxToken);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const getActiveStyle = (styleKey: 'satellite' | 'dark' | 'outdoors'): any => {
    if (useMapboxVector && mapboxToken && mapboxToken.startsWith('pk.')) {
      return MAPBOX_VECTOR_STYLES[styleKey];
    }
    return OPEN_MAP_STYLES[styleKey] || OPEN_MAP_STYLES.satellite;
  };

  const initMap = useCallback(() => {
    if (!mapContainer.current) return;
    if (map.current) {
      map.current.remove();
      map.current = null;
    }

    const currentStyle = getActiveStyle(mapStyle);
    const newMap = new maplibregl.Map({
      container: mapContainer.current,
      style: currentStyle,
      center: initialCenter,
      zoom: initialZoom,
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

    const drawControl = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
      },
      defaultMode: 'draw_polygon',
      styles: [
        {
          id: 'gl-draw-polygon-fill-active',
          type: 'fill',
          filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
          paint: {
            'fill-color': '#10b981',
            'fill-opacity': 0.35,
          },
        },
        {
          id: 'gl-draw-polygon-stroke-active',
          type: 'line',
          filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
          paint: {
            'line-color': '#34d399',
            'line-width': 3,
            'line-dasharray': [0.2, 2],
          },
        },
        {
          id: 'gl-draw-polygon-and-line-vertex-active',
          type: 'circle',
          filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point']],
          paint: {
            'circle-radius': 6,
            'circle-color': '#10b981',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
          },
        },
      ],
    });

    draw.current = drawControl;
    newMap.addControl(drawControl as any, 'top-right');
    newMap.addControl(new maplibregl.NavigationControl(), 'top-right');

    const updateArea = () => {
      if (!draw.current) return;
      const data = draw.current.getAll();
      if (data.features.length > 0) {
        const feature = data.features[data.features.length - 1];
        try {
          const areaSqMeters = turf.area(feature);
          const ha = Number((areaSqMeters / 10000).toFixed(2));
          const km2 = Number((areaSqMeters / 1000000).toFixed(4));
          setCurrentAreaHa(ha);
          setCurrentAreaKm2(km2);
          setHasPolygon(true);
          onPolygonChange(feature.geometry, ha, km2);
        } catch {
          // In progress
        }
      } else {
        setCurrentAreaHa(0);
        setCurrentAreaKm2(0);
        setHasPolygon(false);
        onPolygonChange(null, 0, 0);
      }
    };

    (newMap as any).on('draw.create', updateArea);
    (newMap as any).on('draw.delete', updateArea);
    (newMap as any).on('draw.update', updateArea);

    newMap.on('load', () => {
      newMap.resize();
    });

    map.current = newMap;
    setTimeout(() => newMap.resize(), 300);
  }, [mapStyle, mapboxToken, useMapboxVector, initialCenter, initialZoom, onPolygonChange]);

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

  const changeStyle = (styleKey: 'satellite' | 'dark' | 'outdoors') => {
    if (!map.current) return;
    setMapStyle(styleKey);
    map.current.setStyle(getActiveStyle(styleKey));
  };

  const handleClearDraw = () => {
    if (draw.current) {
      draw.current.deleteAll();
      setCurrentAreaHa(0);
      setCurrentAreaKm2(0);
      setHasPolygon(false);
      onPolygonChange(null, 0, 0);
    }
  };

  const saveTokenSettings = () => {
    const trimmed = tempToken.trim();
    localStorage.setItem('darukaa_custom_mapbox_token', trimmed);
    setMapboxToken(trimmed);
    if (trimmed.startsWith('pk.')) {
      setUseMapboxVector(true);
      localStorage.setItem('darukaa_use_mapbox_vector', 'true');
    } else {
      setUseMapboxVector(false);
      localStorage.setItem('darukaa_use_mapbox_vector', 'false');
    }
    setIsTokenModalOpen(false);
  };

  const handleLocationSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

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
      console.error('Geocoding search error:', err);
    }
  };

  const flyToLocation = (center: [number, number]) => {
    if (map.current) {
      map.current.flyTo({ center, zoom: 10, essential: true });
      setSearchResults([]);
      setSearchQuery('');
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-[#1e333a] shadow-inner bg-[#0b1315]">
      {/* Container */}
      <div ref={mapContainer} style={{ height, width: '100%' }} className="w-full relative z-0" />

      {/* Top Search & Style Bar */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2">
        {/* Geocoding Search */}
        <div className="relative">
          <form onSubmit={handleLocationSearch} className="flex items-center">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search location to map..."
                className="w-48 sm:w-56 bg-[#0f1b1e]/90 border border-[#1e333a] rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 backdrop-blur-md shadow-lg"
              />
            </div>
          </form>

          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 mt-1.5 w-full bg-[#0f1b1e]/95 border border-[#1e333a] rounded-xl shadow-2xl overflow-hidden z-20 backdrop-blur-md">
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => flyToLocation(result.center)}
                  className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-emerald-950/60 hover:text-emerald-300 flex items-center gap-2 border-b border-[#1e333a] last:border-b-0"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{result.place_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Style Switcher */}
        <div className="flex items-center bg-[#0f1b1e]/90 border border-[#1e333a] rounded-xl p-1 backdrop-blur-md shadow-lg">
          <button
            type="button"
            onClick={() => changeStyle('satellite')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
              mapStyle === 'satellite'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Satellite
          </button>
          <button
            type="button"
            onClick={() => changeStyle('dark')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
              mapStyle === 'dark'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dark
          </button>
          <button
            type="button"
            onClick={() => changeStyle('outdoors')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
              mapStyle === 'outdoors'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Terrain
          </button>
        </div>
      </div>

      {/* Floating Instructions & Tools */}
      <div className="absolute top-3 right-12 z-10 flex items-center gap-2">
        <button
          type="button"
          onClick={handleClearDraw}
          className="bg-[#0f1b1e]/90 hover:bg-rose-950/80 text-slate-300 hover:text-rose-300 border border-[#1e333a] hover:border-rose-500/40 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg backdrop-blur-md transition-colors"
          title="Clear Drawn Polygon"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
          <span>Clear</span>
        </button>
      </div>

      {/* Geodesic Area Calculation Floating HUD */}
      <div className="absolute bottom-3 left-3 right-3 z-10 bg-[#0f1b1e]/95 backdrop-blur-md border border-[#1e333a] p-3 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-slate-300">Calculated Area:</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-extrabold text-emerald-400 font-mono">
              {currentAreaHa.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-medium">hectares (ha)</span>
            <span className="text-slate-600">|</span>
            <span className="text-sm font-bold text-slate-200 font-mono">
              {currentAreaKm2.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-medium">km²</span>
          </div>
        </div>

        <div className="text-right">
          {hasPolygon ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/30">
              <Check className="w-3.5 h-3.5" />
              Polygon Captured
            </span>
          ) : (
            <span className="text-xs text-slate-400 italic">
              Click polygon tool (top-right) to draw site boundary
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
