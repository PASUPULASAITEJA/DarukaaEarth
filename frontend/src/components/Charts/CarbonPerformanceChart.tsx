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

interface CarbonPerformanceChartProps {
  timeSeries: AnalyticsRecord[];
}

export const CarbonPerformanceChart: React.FC<CarbonPerformanceChartProps> = ({
  timeSeries,
}) => {
  const labels = timeSeries.map((item) => item.date);
  const carbonValues = timeSeries.map((item) => item.carbon_sequestration_tonnes);
  const reductionRates = timeSeries.map((item) => item.carbon_reduction_rate);

  const data = {
    labels,
    datasets: [
      {
        label: 'Carbon Sequestered (tCO₂e)',
        data: carbonValues,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 1.5,
        pointRadius: 4,
        pointHoverRadius: 6,
        yAxisID: 'y',
      },
      {
        label: 'Emission Reduction Rate (%)',
        data: reductionRates,
        borderColor: '#06b6d4',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        tension: 0.3,
        pointBackgroundColor: '#06b6d4',
        pointBorderColor: '#ffffff',
        pointRadius: 3,
        yAxisID: 'y1',
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
        boxPadding: 4,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(30, 51, 58, 0.4)' },
        ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 } },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        grid: { color: 'rgba(30, 51, 58, 0.4)' },
        ticks: { color: '#10b981', font: { family: 'Inter', size: 11 } },
        title: {
          display: true,
          text: 'Tonnes CO₂e',
          color: '#10b981',
          font: { size: 11 },
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: { drawOnChartArea: false },
        ticks: { color: '#06b6d4', font: { family: 'Inter', size: 11 } },
        title: {
          display: true,
          text: 'Reduction Rate %',
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
