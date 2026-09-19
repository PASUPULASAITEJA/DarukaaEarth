import React from 'react';

export const MapLegend: React.FC = () => {
  const items = [
    { label: 'Carbon Project', color: '#10b981', stroke: '#059669' },
    { label: 'Biodiversity Project', color: '#06b6d4', stroke: '#0891b2' },
    { label: 'Carbon & Biodiversity', color: '#a855f7', stroke: '#9333ea' },
  ];

  return (
    <div className="absolute bottom-4 left-4 z-10 bg-[#111d21]/90 backdrop-blur-md border border-[#1e333a] rounded-xl p-3 shadow-xl text-xs space-y-2">
      <div className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider">
        Project Legend
      </div>
      <div className="space-y-1.5">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span
              className="w-3.5 h-3.5 rounded-sm border"
              style={{
                backgroundColor: item.color + '44',
                borderColor: item.color,
              }}
            />
            <span className="text-slate-300">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
