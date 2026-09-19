import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'carbon' | 'biodiversity' | 'combined' | 'active' | 'planning' | 'completed' | 'archived' | 'neutral';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', size = 'sm' }) => {
  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-xs font-medium' : 'px-2.5 py-1 text-xs font-semibold';

  const variantStyles = {
    carbon: 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300',
    biodiversity: 'bg-cyan-950/80 border border-cyan-500/40 text-cyan-300',
    combined: 'bg-purple-950/80 border border-purple-500/40 text-purple-300',
    active: 'bg-emerald-900/60 border border-emerald-400/30 text-emerald-200',
    planning: 'bg-amber-950/80 border border-amber-500/40 text-amber-300',
    completed: 'bg-blue-950/80 border border-blue-500/40 text-blue-300',
    archived: 'bg-slate-800/80 border border-slate-600/40 text-slate-400',
    neutral: 'bg-[#1a2c32] border border-[#2a444c] text-slate-300',
  };

  // Helper mapping if string value passed
  let styleKey: keyof typeof variantStyles = variant;
  const lower = String(children).toLowerCase();
  if (lower.includes('carbon &') || lower.includes('combined')) styleKey = 'combined';
  else if (lower.includes('carbon')) styleKey = 'carbon';
  else if (lower.includes('biodiversity')) styleKey = 'biodiversity';
  else if (lower === 'active') styleKey = 'active';
  else if (lower === 'planning') styleKey = 'planning';
  else if (lower === 'completed') styleKey = 'completed';
  else if (lower === 'archived') styleKey = 'archived';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full ${sizeStyles} ${variantStyles[styleKey]}`}>
      {children}
    </span>
  );
};
