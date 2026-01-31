import React, { useEffect } from 'react';
import { useStore } from '../admin/Billing'; // Using your existing store

export default function MobileDashboard() {
  const { salons, fetchSalons, loading } = useStore();
  const testSalonId = '00000000-0000-0000-0000-000000000001'; //
  const currentSalon = salons.find(s => s.id === testSalonId);

  useEffect(() => {
    fetchSalons();
  }, [fetchSalons]);

  const stats = [
    { label: 'Confirmations', used: 12, limit: 50, color: 'bg-blue-500' },
    { label: 'Reminders', used: 45, limit: 50, color: 'bg-green-500' },
    { label: 'Promotions', used: 5, limit: 50, color: 'bg-purple-500' },
    { label: 'Campaigns', used: 50, limit: 50, color: 'bg-red-500' }, // Limit hit!
  ];

  if (loading) return <div className="p-10 font-bold">GROWVA LOADING...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-20">
      <header className="mb-6">
        <h1 className="text-2xl font-black uppercase italic text-indigo-600">Growva Mobile</h1>
        <p className="text-gray-500 font-bold">{currentSalon?.name || 'Salon Dashboard'}</p>
      </header>

      <div className="grid gap-4">
        <h2 className="font-black uppercase text-sm text-gray-400">WhatsApp 50/50 Limits</h2>
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-4 rounded-3xl shadow-sm border-2 border-gray-100">
            <div className="flex justify-between mb-2">
              <span className="font-bold text-gray-700">{stat.label}</span>
              <span className="font-black text-gray-900">{stat.used}/50</span>
            </div>
            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
              <div 
                className={`h-full ${stat.color} transition-all duration-500`} 
                style={{ width: `${(stat.used / stat.limit) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <button className="fixed bottom-6 left-4 right-4 bg-indigo-600 text-white font-black py-4 rounded-3xl shadow-xl active:scale-95 transition-transform">
        + NEW BOOKING
      </button>
    </div>
  );
}