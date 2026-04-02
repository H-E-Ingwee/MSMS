import React, { useEffect, useState } from 'react';
import { mapPin, phone, checkCircle2 } from 'lucide-react';
import SectionHeading from '../components/atoms/SectionHeading';
import { getMarketListings } from '../services/api';
import { MapPin, Phone, CheckCircle2, PlusCircle } from 'lucide-react';

export default function MarketplacePage() {
  const [listings, setListings] = useState([]);
  const [gradeFilter, setGradeFilter] = useState('All Grades');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMarketListings().then(data => {
      setListings(data);
      setLoading(false);
    });
  }, []);

  const grades = ['All Grades', 'Kangeta', 'Alele', 'Giza', 'Lomboko'];
  const filtered = gradeFilter === 'All Grades' ? listings : listings.filter(item => item.grade === gradeFilter);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <SectionHeading title="Marketplace" subtitle="Direct buyer-seller matching." />
        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2">
          <PlusCircle size={18} /> List Produce
        </button>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {grades.map(grade => (
          <button
            key={grade}
            onClick={() => setGradeFilter(grade)}
            className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap font-medium border ${
              grade === gradeFilter ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {grade}
          </button>
        ))}
      </div>

      {loading ? (
        <div>Loading Marketplace...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(item => (
            <div key={item.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{item.grade}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin size={14} /> {item.location}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-xl text-green-700">KES {item.price}</p>
                  <p className="text-xs text-gray-500">per kg</p>
                </div>
              </div>

              <div className="py-3 border-y border-gray-50 my-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm">
                    {item.farmer.charAt(0)}
                  </div>
                  <p className="text-sm font-medium text-gray-800 flex items-center gap-1">
                    {item.farmer} {item.verified && <CheckCircle2 size={14} className="text-blue-500" />}
                  </p>
                </div>
                <div className="bg-gray-100 px-3 py-1 rounded-lg text-sm font-medium text-gray-700">{item.qty} kg</div>
              </div>

              <div className="flex gap-2 mt-4">
                <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl text-sm font-medium">Buy Now</button>
                <button className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl"><Phone size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
