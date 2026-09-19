import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/UI/Button';
import { Globe, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0b1315] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 shadow-2xl">
        <Globe className="w-8 h-8" />
      </div>
      <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-100 tracking-tight">404</h1>
      <h2 className="text-xl font-bold text-slate-200 mt-2">Geospatial Coordinates Not Found</h2>
      <p className="text-sm text-slate-400 max-w-md mt-2 mb-8 leading-relaxed">
        The environmental project or site you are looking for does not exist or has been moved.
      </p>
      <Link to="/dashboard">
        <Button variant="primary" icon={<ArrowLeft className="w-4 h-4" />}>
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
};
