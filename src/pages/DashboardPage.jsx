import React, { useEffect, useState } from 'react';
import { Leaf, TrendingUp, AlertCircle, Calendar, BarChart3, Activity, Target } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  AreaChart, Area, ComposedChart, ReferenceLine
} from 'recharts';
import SectionHeading from '../components/atoms/SectionHeading.jsx';
import { getPredictions } from '../services/api.js';

export default function DashboardPage() {
  const [aiData, setAiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const data = await getPredictions();
        setAiData(data);
      } catch (err) {
        console.error(err);
        setError('Unable to load live AI predictions. Showing fallback forecast.');
        setAiData({
          currentAvgPrice: 2280,
          priceTrend: 'rising',
          recommendation: 'Strong upward trend detected. High confidence in price increase. Consider holding harvest for optimal profits.',
          forecast: [
            { day: 'Mon', actualPrice: 2280, predictedPrice: 2320, demand: 19350, confidence: { priceLower: 2250, priceUpper: 2390 } },
            { day: 'Tue', actualPrice: null, predictedPrice: 2350, demand: 19450, confidence: { priceLower: 2280, priceUpper: 2420 } },
            { day: 'Wed', actualPrice: null, predictedPrice: 2380, demand: 19550, confidence: { priceLower: 2310, priceUpper: 2450 } },
            { day: 'Thu', actualPrice: null, predictedPrice: 2410, demand: 19650, confidence: { priceLower: 2340, priceUpper: 2480 } },
            { day: 'Fri', actualPrice: null, predictedPrice: 2440, demand: 19750, confidence: { priceLower: 2370, priceUpper: 2510 } },
            { day: 'Sat', actualPrice: null, predictedPrice: 2470, demand: 19850, confidence: { priceLower: 2400, priceUpper: 2540 } },
            { day: 'Sun', actualPrice: null, predictedPrice: 2500, demand: 19950, confidence: { priceLower: 2430, priceUpper: 2570 } },
          ],
          analysis: {
            trend: 'rising',
            avg_future_price: 2410,
            price_change_percent: 5.7,
            confidence: 'high'
          },
          chartData: [
            { date: '2026-03-28', actualPrice: 2260, actualDemand: 19200, predictedPrice: null, predictedDemand: null },
            { date: '2026-03-29', actualPrice: 2270, actualDemand: 19250, predictedPrice: null, predictedDemand: null },
            { date: '2026-03-30', actualPrice: 2275, actualDemand: 19300, predictedPrice: null, predictedDemand: null },
            { date: '2026-03-31', actualPrice: 2280, actualDemand: 19350, predictedPrice: null, predictedDemand: null },
            { date: '2026-04-01', actualPrice: null, actualDemand: null, predictedPrice: 2320, predictedDemand: 19450 },
            { date: '2026-04-02', actualPrice: null, actualDemand: null, predictedPrice: 2350, predictedDemand: 19550 },
            { date: '2026-04-03', actualPrice: null, actualDemand: null, predictedPrice: 2380, predictedDemand: 19650 },
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-emerald-600 mb-4"></div>
        <p className="text-gray-500 font-bold animate-pulse">AI is analyzing historical market data...</p>
        <p className="text-sm text-gray-400 mt-2">Training advanced ML models with Prophet and ARIMA</p>
      </div>
    );
  }

  // Prepare chart data

  const priceChartData = aiData?.chartData?.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    actual: item.actualPrice,
    predicted: item.predictedPrice,
    lower: item.predictedPrice ? item.predictedPrice * 0.95 : null, // Approximate confidence interval
    upper: item.predictedPrice ? item.predictedPrice * 1.05 : null
  })) || [];

  const demandChartData = aiData?.forecast?.map(item => ({
    day: item.day,
    demand: item.demand,
    predicted: item.predictedPrice
  })) || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <SectionHeading title="Predictive Intelligence" subtitle="AI-driven forecasts using advanced ML models (Prophet + ARIMA)." />

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle size={24} className="mt-1" />
          <div>
            <p className="font-semibold">{error}</p>
            <p className="text-sm text-yellow-600">Live ML predictions are unavailable right now, so a local fallback forecast is shown.</p>
          </div>
        </div>
      )}

      {/* Enhanced KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Current Avg Price</p>
          <h3 className="text-2xl md:text-3xl font-black text-gray-800">KES {aiData?.currentAvgPrice?.toLocaleString()}</h3>
          <p className={`text-xs flex items-center mt-2 font-bold w-fit px-2 py-1 rounded-md ${
            aiData?.priceTrend === 'rising' ? 'text-emerald-600 bg-emerald-50' :
            aiData?.priceTrend === 'falling' ? 'text-red-600 bg-red-50' : 'text-blue-600 bg-blue-50'
          }`}>
            <TrendingUp size={12} className={`mr-1 ${aiData?.priceTrend !== 'rising' ? 'rotate-180' : ''}`} />
            Trend is {aiData?.priceTrend}
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">7-Day Peak Forecast</p>
          <h3 className="text-2xl md:text-3xl font-black text-blue-600">
            KES {Math.max(...(aiData?.forecast?.map(f => f.predictedPrice) || [0]))?.toLocaleString()}
          </h3>
          <p className="text-xs text-blue-600 flex items-center gap-1 mt-2 font-bold bg-blue-50 w-fit px-2 py-1 rounded-md">
            <Calendar size={12} /> Expected later this week
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Price Change</p>
          <h3 className={`text-2xl md:text-3xl font-black ${
            aiData?.analysis?.price_change_percent > 0 ? 'text-emerald-600' : 'text-red-600'
          }`}>
            {aiData?.analysis?.price_change_percent > 0 ? '+' : ''}{aiData?.analysis?.price_change_percent}%
          </h3>
          <p className="text-xs text-gray-500 font-bold mt-2 bg-gray-50 w-fit px-2 py-1 rounded-md">
            <Activity size={12} className="inline mr-1" />
            {aiData?.analysis?.confidence} confidence
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Avg Future Price</p>
          <h3 className="text-2xl md:text-3xl font-black text-purple-600">
            KES {aiData?.analysis?.avg_future_price?.toLocaleString()}
          </h3>
          <p className="text-xs text-purple-600 font-bold mt-2 bg-purple-50 w-fit px-2 py-1 rounded-md">
            <Target size={12} className="inline mr-1" />
            ML Prediction
          </p>
        </div>
      </div>

      {/* AI Recommendation Card */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 p-6 rounded-3xl shadow-md text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4">
          <Leaf size={120} />
        </div>
        <div className="relative z-10">
          <h3 className="text-xl font-black mb-3 flex items-center gap-2">
            <Activity size={24} />
            AI Recommendation
          </h3>
          <p className="text-emerald-100 text-lg leading-relaxed">{aiData?.recommendation}</p>
          <div className="mt-4 flex items-center gap-4 text-sm">
            <span className="bg-white/20 px-3 py-1 rounded-full">
              Model: Prophet + ARIMA
            </span>
            <span className="bg-white/20 px-3 py-1 rounded-full">
              Confidence: {aiData?.analysis?.confidence}
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price Forecast Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="font-black text-gray-800 text-lg mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-500" />
            Price Forecast (30 Days)
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={priceChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="upper"
                  stackId="1"
                  stroke="none"
                  fill="#dbeafe"
                  fillOpacity={0.3}
                />
                <Area
                  type="monotone"
                  dataKey="lower"
                  stackId="2"
                  stroke="none"
                  fill="white"
                  fillOpacity={1}
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#16a34a"
                  strokeWidth={3}
                  dot={{ fill: '#16a34a', strokeWidth: 2, r: 4 }}
                  name="Actual Price"
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="#2563eb"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#2563eb', strokeWidth: 2, r: 3 }}
                  name="Predicted Price"
                />
                <ReferenceLine x={priceChartData.find(d => d.actual === null)?.date} stroke="#6b7280" strokeDasharray="2 2" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Green: Actual prices | Blue: ML predictions | Shaded: Confidence interval
          </p>
        </div>

        {/* Demand Forecast Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="font-black text-gray-800 text-lg mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-orange-500" />
            Demand Forecast (7 Days)
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demandChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                  formatter={(value, name) => [
                    name === 'demand' ? `${value.toLocaleString()} kg` : `KES ${value.toLocaleString()}`,
                    name === 'demand' ? 'Demand Volume' : 'Price'
                  ]}
                />
                <Legend />
                <Bar dataKey="demand" fill="#f97316" radius={[4, 4, 0, 0]} name="Demand" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Weekly demand predictions based on historical patterns
          </p>
        </div>
      </div>

      {/* Forecast Table */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="font-black text-gray-800 text-lg mb-4">7-Day Forecast Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b-2 border-gray-100 text-gray-400 uppercase tracking-wider text-xs">
                <th className="pb-4 font-bold">Day</th>
                <th className="pb-4 font-bold">Predicted Price</th>
                <th className="pb-4 font-bold">Demand (kg)</th>
                <th className="pb-4 font-bold">Confidence Range</th>
                <th className="pb-4 font-bold">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {aiData?.forecast?.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 font-bold text-gray-800">{item.day}</td>
                  <td className="py-4 text-gray-800 font-bold">
                    KES {item.predictedPrice?.toLocaleString()}
                    {item.actualPrice && <span className="text-emerald-600 ml-2">(Actual)</span>}
                  </td>
                  <td className="py-4 text-gray-600">{item.demand?.toLocaleString()}</td>
                  <td className="py-4 text-gray-600">
                    {item.confidence ?
                      `KES ${item.confidence.priceLower?.toLocaleString()} - ${item.confidence.priceUpper?.toLocaleString()}` :
                      'N/A'
                    }
                  </td>
                  <td className="py-4">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-black ${
                      item.predictedPrice > aiData.currentAvgPrice ? 'bg-emerald-100 text-emerald-700' :
                      item.predictedPrice < aiData.currentAvgPrice ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {item.predictedPrice > aiData.currentAvgPrice ? '↗ Rising' :
                       item.predictedPrice < aiData.currentAvgPrice ? '↘ Falling' : '→ Stable'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}