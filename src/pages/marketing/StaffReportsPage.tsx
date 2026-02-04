import { useState } from 'react';
import { 
  Users, DollarSign, Calendar, Download, TrendingUp, Percent 
} from 'lucide-react';
import { useStore } from '@/store/useStore'; // ✅ Support for RTL/LTR layouts
import { useMarketingStore } from '@/store/useMarketingStore';
import { useBookingStore } from '@/store/useBookingStore';
import { cn } from '@/shared/utils/cn'; 
import { StaffCommission } from '@/types'; 
import { useFetchDashboardData } from '@/hooks/useFetchDashboardData';   

export default function StaffReportsPage() {
  // ✅ Trigger master hook handles data orchestration for marketing staff reports
  useFetchDashboardData('marketing'); 

  const { language } = useStore(); // ✅ Added for language direction support
  const { getStaffCommissions } = useMarketingStore();
  const { salonProfile, staff } = useBookingStore();
  
  const [selectedPeriod, setSelectedPeriod] = useState('May 2024'); 
  const isRTL = language === 'ar';

  // ❌ REMOVED: Redundant fetch logic or local useEffects

  const commissions = getStaffCommissions(selectedPeriod);
  
  const totalRevenue = commissions.reduce((sum: number, c: StaffCommission) => sum + (c.total_revenue || 0), 0);
  const totalCommission = commissions.reduce((sum: number, c: StaffCommission) => sum + (c.commission_earned || 0), 0);
  const totalBookings = commissions.reduce((sum: number, c: StaffCommission) => sum + (c.total_bookings || 0), 0);

  const handleExport = () => {
    const headers = ['Staff', 'Bookings', 'Revenue', 'Commission %', 'Earned'];
    const data = commissions.map((c: StaffCommission) => [
      c.staff_name,
      c.total_bookings,
      `${salonProfile?.currency || '$'} ${c.total_revenue}`,
      `${c.commission_percent}%`,
      `${salonProfile?.currency || '$'} ${c.commission_earned}`
    ]);
    
    const csv = [headers, ...data].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `staff-reports-${selectedPeriod.replace(' ', '-')}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 text-gray-900" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className={cn(isRTL && "text-right")}>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Percent className="text-rose-600" /> Staff Performance
          </h2>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Revenue & Commissions</p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className={cn(
              "rounded-xl border border-gray-100 bg-white px-4 py-2 text-xs font-black uppercase outline-none focus:ring-2 ring-rose-50",
              isRTL && "text-right"
            )}
          >
            <option value="May 2024">May 2024</option>
            <option value="April 2024">April 2024</option>
          </select>
          <button onClick={handleExport} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-black uppercase hover:bg-gray-50 transition-all">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* Summary Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-4">
        {/* Active Staff */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Users size={18}/></div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Staff</p>
          </div>
          <p className="text-2xl font-black">{staff.filter(s => s.is_active).length}</p>
        </div>

        {/* Total Bookings */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Calendar size={18}/></div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Bookings</p>
          </div>
          <p className="text-2xl font-black">{totalBookings}</p>
        </div>
        
        {/* Total Revenue */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><DollarSign size={18}/></div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Revenue</p>
          </div>
          <p className="text-2xl font-black">{salonProfile?.currency || '$'} {totalRevenue.toLocaleString()}</p>
        </div>

        {/* Total Payout */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><Percent size={18}/></div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Payout</p>
          </div>
          <p className="text-2xl font-black text-rose-600">{salonProfile?.currency || '$'} {totalCommission.toLocaleString()}</p>
        </div>
      </div>

      {/* Reports Table */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse" dir={isRTL ? 'rtl' : 'ltr'}>
          <thead className="bg-gray-50/50 text-[10px] uppercase text-gray-400 font-black tracking-widest border-b border-gray-50">
            <tr>
              <th className={cn("px-6 py-4", isRTL ? "text-right" : "text-left")}>Staff Member</th>
              <th className="px-6 py-4 text-center">Bookings</th>
              <th className={cn("px-6 py-4", isRTL ? "text-left" : "text-right")}>Commission Earned</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm">
            {commissions.map((c: StaffCommission, index: number) => (
              <tr key={c.staff_id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-5 flex items-center gap-3">
                  <span className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-lg text-[10px] font-black text-white shadow-sm",
                    index === 0 ? "bg-amber-400" : "bg-gray-200"
                  )}>
                    #{index + 1}
                  </span>
                  <span className="font-bold text-gray-900">{c.staff_name}</span>
                </td>
                <td className="px-6 py-5 text-center font-bold text-gray-500">{c.total_bookings}</td>
                <td className={cn("px-6 py-5 font-black text-green-600", isRTL ? "text-left" : "text-right")}>
                   {salonProfile?.currency || '$'} {c.commission_earned.toLocaleString()}
                   <TrendingUp size={14} className={cn("inline", isRTL ? "mr-1" : "ml-1")} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Empty State */}
      {commissions.length === 0 && (
        <div className="py-20 text-center">
          <Users className="mx-auto h-12 w-12 text-gray-200 mb-4" />
          <p className="text-gray-500 font-medium tracking-tight">No staff performance data found for this period.</p>
        </div>
      )}
    </div>
  );
}