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
        <p className="text-gray-500 font-bold animate-pulse">Analyzing market patterns...</p>
        <p className="text-sm text-gray-400 mt-2">Using smart computer programs to predict miraa prices</p>
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
      <SectionHeading 
        title="Smart Price Predictions" 
        subtitle="AI helps you understand future miraa prices based on market patterns. This helps farmers decide when to harvest and sell." 
      />

      {/* Educational Info Box */}
      <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-2xl p-4">
        <h4 className="font-bold mb-2 flex items-center gap-2">
          <Activity size={20} />
          How to Use This Dashboard
        </h4>
        <ul className="text-sm space-y-1">
          <li>• <strong>Current Price:</strong> Today's average market price per kg</li>
          <li>• <strong>Predictions:</strong> What prices might be in the coming days</li>
          <li>• <strong>Demand:</strong> How much miraa buyers might want to buy</li>
          <li>• <strong>AI Advice:</strong> Suggestions on when to harvest based on price trends</li>
        </ul>
        <p className="text-xs mt-2 text-blue-600">
          Note: These are wholesale predictions. Marketplace prices may vary based on quality and location.
        </p>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle size={24} className="mt-1" />
          <div>
            <p className="font-semibold">{error}</p>
            <p className="text-sm text-yellow-600">Showing sample predictions when live data isn't available.</p>
          </div>
        </div>
      )}

      {/* Enhanced KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Today's Market Price</p>
          <h3 className="text-2xl md:text-3xl font-black text-gray-800">KES {aiData?.currentAvgPrice?.toLocaleString()}</h3>
          <p className={`text-xs flex items-center mt-2 font-bold w-fit px-2 py-1 rounded-md ${
            aiData?.priceTrend === 'rising' ? 'text-emerald-600 bg-emerald-50' :
            aiData?.priceTrend === 'falling' ? 'text-red-600 bg-red-50' : 'text-blue-600 bg-blue-50'
          }`}>
            <TrendingUp size={12} className={`mr-1 ${aiData?.priceTrend !== 'rising' ? 'rotate-180' : ''}`} />
            Prices are {aiData?.priceTrend}
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Best Price This Week</p>
          <h3 className="text-2xl md:text-3xl font-black text-blue-600">
            KES {Math.max(...(aiData?.forecast?.map(f => f.predictedPrice) || [0]))?.toLocaleString()}
          </h3>
          <p className="text-xs text-blue-600 flex items-center gap-1 mt-2 font-bold bg-blue-50 w-fit px-2 py-1 rounded-md">
            <Calendar size={12} /> Coming soon
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
            {aiData?.analysis?.confidence === 'high' ? 'Very reliable' : 
             aiData?.analysis?.confidence === 'medium' ? 'Fairly reliable' : 'Less certain'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Average Next Week</p>
          <h3 className="text-2xl md:text-3xl font-black text-purple-600">
            KES {aiData?.analysis?.avg_future_price?.toLocaleString()}
          </h3>
          <p className="text-xs text-purple-600 font-bold mt-2 bg-purple-50 w-fit px-2 py-1 rounded-md">
            <Target size={12} className="inline mr-1" />
            AI Prediction
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
            Smart Farming Advice
          </h3>
          <p className="text-emerald-100 text-lg leading-relaxed mb-4">{aiData?.recommendation}</p>
          
          {/* Actionable Tips */}
          <div className="bg-white/10 rounded-xl p-4 mb-4">
            <h4 className="font-bold mb-2">💡 What This Means for You:</h4>
            <ul className="text-sm space-y-1 text-emerald-100">
              {aiData?.priceTrend === 'rising' ? (
                <>
                  <li>• Wait 2-3 days before harvesting to get higher prices</li>
                  <li>• Store your miraa properly to maintain quality</li>
                  <li>• Check prices daily in the marketplace</li>
                </>
              ) : aiData?.priceTrend === 'falling' ? (
                <>
                  <li>• Harvest and sell soon to avoid price drops</li>
                  <li>• Consider selling to regular buyers first</li>
                  <li>• Look for buyers willing to pay current prices</li>
                </>
              ) : (
                <>
                  <li>• Market is stable - harvest when ready</li>
                  <li>• Focus on quality to get better prices</li>
                  <li>• Build relationships with good buyers</li>
                </>
              )}
            </ul>
          </div>

          <div className="mt-4 flex items-center gap-4 text-sm">
            <span className="bg-white/20 px-3 py-1 rounded-full">
              Based on market patterns
            </span>
            <span className="bg-white/20 px-3 py-1 rounded-full">
              {aiData?.analysis?.confidence === 'high' ? 'Very reliable' : 
               aiData?.analysis?.confidence === 'medium' ? 'Fairly reliable' : 'Keep watching'}
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
            Price Trends: Past & Future
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            This chart shows what prices were in the past (green line) and what they might be in the future (blue dashed line). 
            The shaded area shows the possible price range - prices could be higher or lower than predicted.
          </p>
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
                  formatter={(value, name) => [
                    name === 'actual' ? `KES ${value?.toLocaleString()}` : 
                    name === 'predicted' ? `KES ${value?.toLocaleString()}` : value,
                    name === 'actual' ? 'Actual Price' : 
                    name === 'predicted' ? 'Predicted Price' : name
                  ]}
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
            Green: What prices actually were | Blue: What prices might be | Shaded: Possible price range
          </p>
        </div>

        {/* Demand Forecast Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="font-black text-gray-800 text-lg mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-orange-500" />
            How Much Buyers Want (Demand)
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            This shows how many kilograms of miraa buyers might want to buy each day. 
            Higher demand usually means you can sell more, but prices might not always be higher.
          </p>
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
                    name === 'demand' ? 'Expected Demand' : 'Price'
                  ]}
                />
                <Legend />
                <Bar dataKey="demand" fill="#f97316" radius={[4, 4, 0, 0]} name="Demand" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Higher bars mean more buyers looking to purchase miraa that day
          </p>
        </div>
      </div>

      {/* Forecast Table */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="font-black text-gray-800 text-lg mb-4">Daily Price Guide for Next Week</h3>
        <p className="text-sm text-gray-600 mb-4">
          This table shows what prices might be each day. Use it to plan when to harvest and sell your miraa.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b-2 border-gray-100 text-gray-400 uppercase tracking-wider text-xs">
                <th className="pb-4 font-bold">Day</th>
                <th className="pb-4 font-bold">Expected Price</th>
                <th className="pb-4 font-bold">Buyer Demand</th>
                <th className="pb-4 font-bold">Price Range</th>
                <th className="pb-4 font-bold">Market Direction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {aiData?.forecast?.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 font-bold text-gray-800">{item.day}</td>
                  <td className="py-4 text-gray-800 font-bold">
                    KES {item.predictedPrice?.toLocaleString()}
                    {item.actualPrice && <span className="text-emerald-600 ml-2">(Today's actual)</span>}
                  </td>
                  <td className="py-4 text-gray-600">{item.demand?.toLocaleString()} kg</td>
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
                      {item.predictedPrice > aiData.currentAvgPrice ? '↗ Better than today' :
                       item.predictedPrice < aiData.currentAvgPrice ? '↘ Worse than today' : '→ Same as today'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          💡 Tip: Look for days with high demand and good prices. The price range shows the most likely prices (not guaranteed).
        </p>
      </div>
    </div>
  );
}