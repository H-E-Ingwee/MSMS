import React, { useEffect, useState } from 'react';
import { Leaf, TrendingUp } from 'lucide-react';
import SectionHeading from '../components/atoms/SectionHeading';
import KpiCard from '../components/molecules/KpiCard';
import PredictionLineChart from '../components/molecules/PredictionLineChart';
import DemandBarChart from '../components/molecules/DemandBarChart';
import { getPredictiveData } from '../services/api';

const KPI_ITEMS = [
  {label: 'Current Avg Price', value: 'KES 480/kg', deltaText: '+5% from yesterday', accent: 'text-green-700'},
  {label: 'Forecast (Weekend)', value: 'KES 600/kg', deltaText: 'High Demand Expected', accent: 'text-blue-700'},
  {label: 'AI Recommendation', value: 'Hold harvest until Friday', icon: <Leaf className="text-green-600" size={24} />},
];

export default function DashboardPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPredictiveData().then(response => {
      setData(response);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <SectionHeading title="Predictive Dashboard" subtitle="AI-driven insights for optimal harvesting." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {KPI_ITEMS.map((kpi, idx) => (
          <KpiCard key={idx} label={kpi.label} value={kpi.value} deltaText={kpi.deltaText} icon={kpi.icon} accent={kpi.accent} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
          <h3 className="text-md font-bold text-gray-800 mb-4">7-Day Price Forecast (KES)</h3>
          {loading ? <p>Loading...</p> : <PredictionLineChart data={data} />}
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
          <h3 className="text-md font-bold text-gray-800 mb-4">Predicted Demand Volume (kg)</h3>
          {loading ? <p>Loading...</p> : <DemandBarChart data={data} />}
        </div>
      </div>
    </div>
  );
}
