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

interface BiodiversityChartProps {
  timeSeries: AnalyticsRecord[];
}

export const BiodiversityChart: React.FC<BiodiversityChartProps> = ({ timeSeries }) => {
  const labels = timeSeries.map((item) => item.date);
  const bioValues = timeSeries.map((item) => item.biodiversity_index);
  const envScores = timeSeries.map((item) => item.environmental_score);

  const data = {
    labels,
    datasets: [
      {
        label: 'Biodiversity Index (0-100)',
        data: bioValues,
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.15)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#06b6d4',
        pointBorderColor: '#ffffff',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Composite Environmental Score',
        data: envScores,
        borderColor: '#a855f7',
        backgroundColor: 'transparent',
        borderDash: [4, 4],
        tension: 0.3,
        pointBackgroundColor: '#a855f7',
        pointBorderColor: '#ffffff',
        pointRadius: 3,
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
        min: 50,
        max: 100,
        grid: { color: 'rgba(30, 51, 58, 0.4)' },
        ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 } },
        title: {
          display: true,
          text: 'Score Index',
          color: '#06b6d4',
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
