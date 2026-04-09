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
          currentAvgPrice: 560,
          priceTrend: 'rising',
          recommendation: 'Market prices are showing steady growth. Consider harvesting soon while prices remain favorable. Monitor daily for optimal selling timing.',
          forecast: [
            { day: 'Mon', actualPrice: 560, predictedPrice: 575, demand: 19350, confidence: { priceLower: 550, priceUpper: 590 } },
            { day: 'Tue', actualPrice: null, predictedPrice: 580, demand: 19450, confidence: { priceLower: 565, priceUpper: 595 } },
            { day: 'Wed', actualPrice: null, predictedPrice: 585, demand: 19550, confidence: { priceLower: 570, priceUpper: 600 } },
            { day: 'Thu', actualPrice: null, predictedPrice: 590, demand: 19650, confidence: { priceLower: 575, priceUpper: 605 } },
            { day: 'Fri', actualPrice: null, predictedPrice: 595, demand: 19750, confidence: { priceLower: 580, priceUpper: 610 } },
            { day: 'Sat', actualPrice: null, predictedPrice: 600, demand: 19850, confidence: { priceLower: 585, priceUpper: 615 } },
            { day: 'Sun', actualPrice: null, predictedPrice: 605, demand: 19950, confidence: { priceLower: 590, priceUpper: 620 } },
          ],
          analysis: {
            trend: 'rising',
            avg_future_price: 590,
            price_change_percent: 5.4,
            confidence: 'high'
          },
          chartData: [
            { date: '2026-03-28', actualPrice: 540, actualDemand: 19200, predictedPrice: null, predictedDemand: null },
            { date: '2026-03-29', actualPrice: 550, actualDemand: 19250, predictedPrice: null, predictedDemand: null },
            { date: '2026-03-30', actualPrice: 555, actualDemand: 19300, predictedPrice: null, predictedDemand: null },
            { date: '2026-03-31', actualPrice: 560, actualDemand: 19350, predictedPrice: null, predictedDemand: null },
            { date: '2026-04-01', actualPrice: null, actualDemand: null, predictedPrice: 575, predictedDemand: 19450 },
            { date: '2026-04-02', actualPrice: null, actualDemand: null, predictedPrice: 580, predictedDemand: 19550 },
            { date: '2026-04-03', actualPrice: null, actualDemand: null, predictedPrice: 585, predictedDemand: 19650 },
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
    demand: item.demand || item.predictedDemand || 0
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
        <div className="mt-3 p-3 bg-white rounded-lg border">
          <h5 className="font-semibold text-sm mb-1">💰 Understanding KES 560 Price:</h5>
          <p className="text-xs">
            This is the <strong>current wholesale market average</strong> for miraa. Individual marketplace listings may vary based on:
          </p>
          <ul className="text-xs mt-1 space-y-1 ml-4">
            <li>• Quality grade (Kangeta, Alele, Giza, Lomboko)</li>
            <li>• Location and transportation costs</li>
            <li>• Quantity available (bulk vs small lots)</li>
            <li>• Farmer-buyer negotiations</li>
          </ul>
          <p className="text-xs mt-2 font-medium">
            Marketplace shows current offers, dashboard predicts future trends.
          </p>
        </div>
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
          <p className="text-xs text-gray-500 mt-1">per kilogram</p>
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
          <p className="text-xs text-gray-500 mt-1">per kilogram</p>
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
          <p className="text-xs text-gray-500 mt-1">per kilogram</p>
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
                  <li>• Prices are going up - good time to sell if ready</li>
                  <li>• Check marketplace for current buyer offers around KES 560/kg</li>
                  <li>• Higher grades (Giza) may get premium prices above market average</li>
                  <li>• Consider holding small amounts for next week when prices may reach KES 600</li>
                </>
              ) : aiData?.priceTrend === 'falling' ? (
                <>
                  <li>• Prices may drop - harvest and sell this week at current KES 560/kg</li>
                  <li>• Contact buyers directly through marketplace listings</li>
                  <li>• Focus on selling to regular customers who pay reliably</li>
                  <li>• Check for bulk buyers who may offer better rates</li>
                </>
              ) : (
                <>
                  <li>• Market is stable around KES 560/kg - harvest when convenient</li>
                  <li>• Compare prices across different marketplace listings</li>
                  <li>• Build relationships with good buyers for consistent sales</li>
                  <li>• Focus on quality to get better prices than market average</li>
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
          <h3 className="font-black text-gray-800 text-lg mb-2 flex items-center gap-2">
            <TrendingUp size={20} className="text-emerald-600" />
            💰 Price Trends: Past & Future Predictions
          </h3>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            <strong>Green solid line</strong> = Real prices we already saw (what actually happened)
            <br />
            <strong>Blue dashed line</strong> = AI predictions for future prices
            <br />
            <strong>Light blue shaded area</strong> = Possible price range (prices could be higher or lower)
          </p>
          
          {/* Chart Legend */}
          <div className="mb-4 flex flex-wrap gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-6 h-1 bg-emerald-600"></div>
              <span className="text-xs font-bold text-gray-700">Actual Price (Real Data)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-1 bg-blue-600" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #2563eb 0, #2563eb 5px, transparent 5px, transparent 10px)' }}></div>
              <span className="text-xs font-bold text-gray-700">Predicted Price (AI Forecast)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-3 bg-blue-200 opacity-50 rounded"></div>
              <span className="text-xs font-bold text-gray-700">Possible Range</span>
            </div>
          </div>

          <div className="h-80 border border-gray-100 rounded-lg bg-gradient-to-b from-blue-50 to-white p-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={priceChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" fontSize={11} tick={{ fill: '#6b7280' }} />
                <YAxis fontSize={11} tick={{ fill: '#6b7280' }} label={{ value: 'Price (KES/kg)', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#6b7280' } }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '2px solid #059669',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value, name) => {
                    if (value === null) return '';
                    return [
                      `KES ${value?.toLocaleString()}/kg`,
                      name === 'actual' ? '📊 Real Price' : 
                      name === 'predicted' ? '🔮 AI Prediction' : 
                      name === 'upper' ? 'Upper Range' : 'Lower Range'
                    ];
                  }}
                  labelFormatter={(date) => `Date: ${date}`}
                />
                <Legend 
                  wrapperStyle={{ fontSize: 12, fontWeight: 'bold' }}
                  iconType="line"
                />
                <Area
                  type="monotone"
                  dataKey="upper"
                  stackId="1"
                  stroke="none"
                  fill="#93c5fd"
                  fillOpacity={0.35}
                  isAnimationActive={true}
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
                  stroke="#059669"
                  strokeWidth={4}
                  dot={{ fill: '#059669', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7 }}
                  name="📊 Actual Price (Real Data)"
                  isAnimationActive={true}
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="#2563eb"
                  strokeWidth={3}
                  strokeDasharray="8 4"
                  dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                  name="🔮 Predicted Price (AI)"
                  isAnimationActive={true}
                />
                <ReferenceLine 
                  x={priceChartData.find(d => d.actual === null)?.date} 
                  stroke="#9ca3af" 
                  strokeDasharray="4 4"
                  label={{ value: 'Tomorrow ➜', position: 'top', fill: '#6b7280', fontSize: 11, fontWeight: 'bold' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <p className="text-xs font-bold text-emerald-700 mb-1">✅ Real Prices</p>
              <p className="text-xs text-emerald-600">Historical data (green dots) - prices that already happened</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs font-bold text-blue-700 mb-1">🔮 Predictions</p>
              <p className="text-xs text-blue-600">AI forecasts (blue dots) - prices that might happen</p>
            </div>
          </div>
        </div>

        {/* Demand Forecast Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="font-black text-gray-800 text-lg mb-2 flex items-center gap-2">
            <BarChart3 size={20} className="text-orange-500" />
            📊 Buyer Demand Forecast
          </h3>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            This shows how many kilograms buyers want to purchase each day. 
            <strong className="block mt-2">Higher demand = More buyers ready to buy your miraa!</strong>
            Look for days with tall bars - those are your best opportunities to sell.
          </p>

          {/* Demand Info Cards */}
          <div className="mb-4 grid grid-cols-2 gap-2">
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-xs font-bold text-orange-700">Peak Demand</p>
              <p className="text-lg font-black text-orange-600">
                {Math.max(...(demandChartData?.map(d => d.demand) || [0]))?.toLocaleString()} kg
              </p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-xs font-bold text-amber-700">Best Day</p>
              <p className="text-lg font-black text-amber-600">
                {demandChartData?.reduce((max, item) => item.demand > max.demand ? item : max, demandChartData[0])?.day || 'N/A'}
              </p>
            </div>
          </div>

          <div className="h-80 border border-gray-100 rounded-lg bg-gradient-to-b from-orange-50 to-white p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demandChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" fontSize={11} tick={{ fill: '#6b7280' }} />
                <YAxis fontSize={11} tick={{ fill: '#6b7280' }} label={{ value: 'Demand (kg)', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#6b7280' } }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '2px solid #ea580c',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value, name) => [
                    `${value?.toLocaleString()} kg of miraa`,
                    '👥 Buyers Looking to Purchase'
                  ]}
                  labelFormatter={(day) => `📅 ${day}`}
                />
                <Legend 
                  wrapperStyle={{ fontSize: 12, fontWeight: 'bold' }}
                  formatter={() => '📈 Market Demand'}
                />
                <Bar 
                  dataKey="demand" 
                  fill="#f97316"
                  radius={[8, 8, 0, 0]}
                  name="👥 Market Demand"
                  isAnimationActive={true}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs font-bold text-blue-700 mb-2">✅ How to Use This Chart:</p>
            <ul className="text-xs text-blue-600 space-y-1">
              <li>• <strong>Tall bars</strong> = More buyers want to buy that day (great for selling!)</li>
              <li>• <strong>Short bars</strong> = Fewer buyers interested (might take longer to sell)</li>
              <li>• <strong>Combine with price chart:</strong> Look for days with HIGH demand AND price going UP 📈</li>
              <li className="font-bold text-blue-700 mt-2">🎯 Sweet Spot: High demand + Rising prices = Perfect selling day!</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Forecast Table */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="font-black text-gray-800 text-lg mb-4">📅 Miraa Price Predictions for Next Week</h3>
        <p className="text-sm text-gray-600 mb-4">
          <strong>All prices are per kilogram (per kg)</strong>. This table shows what you might get paid for your miraa each day. Higher prices = more money for you!
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b-2 border-gray-100 text-gray-400 uppercase tracking-wider text-xs">
                <th className="pb-4 font-bold">Day</th>
                <th className="pb-4 font-bold">Price per kg</th>
                <th className="pb-4 font-bold">Buyers Want (kg)</th>
                <th className="pb-4 font-bold">Possible Price Range</th>
                <th className="pb-4 font-bold">Compared to Today</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {aiData?.forecast?.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 font-bold text-gray-800">{item.day}</td>
                  <td className="py-4 text-gray-800 font-bold">
                    KES {item.predictedPrice?.toLocaleString()}/kg
                    {item.actualPrice && <span className="text-emerald-600 ml-2 block text-xs">(This is today's real price)</span>}
                  </td>
                  <td className="py-4 text-gray-600">
                    {item.demand?.toLocaleString()} kg
                    <span className="block text-xs text-gray-500">available to buy</span>
                  </td>
                  <td className="py-4 text-gray-600">
                    {item.confidence ?
                      `KES ${item.confidence.priceLower?.toLocaleString()} - ${item.confidence.priceUpper?.toLocaleString()}/kg` :
                      'N/A'
                    }
                    <span className="block text-xs text-gray-500">most likely range</span>
                  </td>
                  <td className="py-4">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-black ${
                      item.predictedPrice > aiData.currentAvgPrice ? 'bg-emerald-100 text-emerald-700' :
                      item.predictedPrice < aiData.currentAvgPrice ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {item.predictedPrice > aiData.currentAvgPrice ? '📈 Higher price' :
                       item.predictedPrice < aiData.currentAvgPrice ? '📉 Lower price' : '➡️ Same price'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-bold text-blue-800 mb-2">💡 How to Read This Table:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>Price per kg:</strong> How much money you get for each kilogram of miraa</li>
            <li>• <strong>Buyers Want:</strong> Total kilograms buyers are looking to purchase that day</li>
            <li>• <strong>Possible Range:</strong> Prices might be between these numbers (not exact)</li>
            <li>• <strong>Compared to Today:</strong> Is this day better or worse than selling today?</li>
          </ul>
          <p className="text-xs text-blue-600 mt-2 font-medium">
            🎯 <strong>Farmer Tip:</strong> Look for days with high demand (big numbers) and "Higher price" arrows. These are your best selling days!
          </p>
        </div>
      </div>
    </div>
  );
}