import React from 'react';
import ResponsiveLineChart from './ResponsiveLineChart';

export default function PredictionLineChart({ data }) {
  // Transform data to match ResponsiveLineChart format
  const transformedData = data
    .filter(d => d.actualPrice !== null) // Only show actual prices (not predictions)
    .map(d => ({
      day: d.day,
      price: d.actualPrice,
    }));

  return (
    <ResponsiveLineChart
      data={transformedData}
      showSimulation={true}
      height="h-64"
    />
  );
}
