import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { AnalyticsRecord } from '../../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface VegetationChartProps {
  timeSeries: AnalyticsRecord[];
}

export const VegetationChart: React.FC<VegetationChartProps> = ({ timeSeries }) => {
  const labels = timeSeries.map((item) => item.date);
  const vegValues = timeSeries.map((item) => item.vegetation_coverage_pct);

  const data = {
    labels,
    datasets: [
      {
        label: 'Vegetation Canopy Coverage (%)',
        data: vegValues,
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#22c55e',
        pointBorderColor: '#ffffff',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#cbd5e1',
          font: { family: 'Inter', size: 12 },
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: '#111d21',
        titleColor: '#f8fafc',
        bodyColor: '#e2e8f0',
        borderColor: '#1e333a',
        borderWidth: 1,
        padding: 10,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(30, 51, 58, 0.4)' },
        ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 } },
      },
      y: {
        min: 40,
        max: 100,
        grid: { color: 'rgba(30, 51, 58, 0.4)' },
        ticks: { color: '#22c55e', font: { family: 'Inter', size: 11 } },
        title: {
          display: true,
          text: 'Coverage %',
          color: '#22c55e',
          font: { size: 11 },
        },
      },
    },
  };

  return (
    <div className="h-72 w-full">
      <Line data={data} options={options} />
    </div>
  );
};
