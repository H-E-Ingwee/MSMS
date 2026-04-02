import React, { useEffect, useState } from 'react';
import { Leaf, Video } from 'lucide-react';
import SectionHeading from '../components/atoms/SectionHeading';
import { getTrainingModules } from '../services/api';

export default function TrainingPage() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTrainingModules().then(data => {
      setModules(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <SectionHeading title="Training & Sustainability" subtitle="Learn modern, sustainable Miraa farming techniques." />
      {loading ? (
        <p>Loading training modules...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {modules.map(mod => (
            <div key={mod.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow">
              <div className="h-40 bg-gray-200 relative flex items-center justify-center">
                <img src={`https://api.dicebear.com/7.x/shapes/svg?seed=${mod.id}&backgroundColor=10b981`} alt="Thumbnail" className="w-full h-full object-cover opacity-80" />
                {mod.type === 'Video' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <Video className="text-green-600 ml-1" size={24} />
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${mod.type === 'Video' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                    {mod.type}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">{mod.duration}</span>
                </div>
                <h3 className="font-bold text-gray-800 text-sm">{mod.title}</h3>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-start gap-4">
        <div className="p-3 bg-green-200 text-green-700 rounded-full">
          <Leaf size={24} />
        </div>
        <div>
          <h4 className="font-bold text-green-800">Tip of the Day</h4>
          <p className="text-sm text-green-700 mt-1">Applying organic mulch around the base of your Miraa trees helps retain soil moisture during dry spells, reducing the need for excessive watering and improving long-term yield.</p>
        </div>
      </div>
    </div>
  );
}
