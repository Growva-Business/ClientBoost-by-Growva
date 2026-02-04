import { useState } from 'react';
import { 
  Users, Search, Filter, Download, Mail, Phone, Star, 
  Calendar, DollarSign, Save, RotateCcw, Shield, ShieldOff 
} from 'lucide-react';
import { useStore } from '@/store/useStore'; // ✅ Added for language/RTL support
import { useMarketingStore } from '@/store/useMarketingStore';
import { useBookingStore } from '@/store/useBookingStore';
import { cn } from '@/shared/utils/cn';
import { format } from 'date-fns';
import { ClientType } from '@/types';
import { useFetchDashboardData } from '@/hooks/useFetchDashboardData';   

export default function ClientsPage() {
  // ✅ Master hook handles all data orchestration for marketing/clients
  useFetchDashboardData('marketing'); 

  const { language } = useStore(); // ✅ Support for RTL/LTR layouts
  const { 
    clients, savedFilters, currentFilter, setCurrentFilter, 
    resetFilter, saveFilter, getFilteredClients, updateClientOptIn 
  } = useMarketingStore();
  const { salonProfile, services, staff } = useBookingStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [saveFilterModal, setSaveFilterModal] = useState(false);
  const [filterName, setFilterName] = useState('');

  const isRTL = language === 'ar';

  // ❌ REMOVED: Any manual useEffect hooks for fetching data

  const filteredClients = getFilteredClients().filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone.includes(searchQuery)
  );

  const handleSaveFilter = () => {
    if (filterName.trim()) {
      saveFilter(filterName);
      setSaveFilterModal(false);
      setFilterName('');
    }
  };

  const handleApplySavedFilter = (filter: any) => {
    setCurrentFilter({
      date_range: filter.date_range,
      gender: filter.gender,
      age_group: filter.age_group,
      service_id: filter.service_id, 
      staff_id: filter.staff_id,     
      min_spend: filter.min_spend,   
      max_spend: filter.max_spend,   
      client_type: filter.client_type,
      safe_only: filter.safe_only,
    });
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Type', 'Total Spent', 'Visits', 'Last Visit', 'Opt-In'];
    const data = filteredClients.map(c => [
      c.name,
      c.email,
      c.phone,
      c.client_type,
      c.total_spent || 0,
      c.total_visits || 0,
      c.last_visit ? format(new Date(c.last_visit), 'yyyy-MM-dd') : 'Never',
      c.opt_in ? 'Yes' : 'No'
    ]);
    
    const csvContent = [headers, ...data].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.setAttribute('download', `salon-clients-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getClientTypeColor = (type: ClientType) => {
    switch (type) {
      case 'vip': return 'bg-purple-100 text-purple-700';
      case 'premium': return 'bg-blue-100 text-blue-700';
      case 'regular': return 'bg-green-100 text-green-700';
      case 'new': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-rose-600" /> Client Manager
          </h2>
          <p className="text-gray-500">{filteredClients.length} of {clients.length} clients</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExportCSV} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50">
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button onClick={() => setShowFilters(!showFilters)} className={cn("inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all", showFilters ? "bg-rose-600 text-white shadow-md shadow-rose-100" : "border hover:bg-gray-50")}>
            <Filter className="h-4 w-4" /> Filters
          </button>
        </div>
      </div>

      {/* Saved Filters Chips */}
      {savedFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {savedFilters.map((f) => (
            <button key={f.id} onClick={() => handleApplySavedFilter(f)} className="px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold hover:bg-rose-100 transition-colors">
              {f.name}
            </button>
          ))}
        </div>
      )}

      {/* Search Bar - RTL Supportive */}
      <div className="relative group">
        <Search className={cn(
          "absolute top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-focus-within:text-rose-500 transition-colors",
          isRTL ? "right-3" : "left-3"
        )} />
        <input 
          type="text" 
          placeholder="Search name, email, or phone..." 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(
            "w-full rounded-xl border-gray-200 py-3 text-sm focus:border-rose-500 focus:ring-rose-200 transition-all outline-none border shadow-sm",
            isRTL ? "pr-10 pl-4 text-right" : "pl-10 pr-4"
          )} 
        />
      </div>

      {showFilters && (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-6 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Client Tier</label>
              <select 
                value={currentFilter.client_type || ''}
                onChange={(e) => setCurrentFilter({ client_type: e.target.value as any })}
                className="w-full rounded-lg border-gray-100 bg-gray-50 p-2 text-sm outline-none focus:ring-2 ring-rose-50"
              >
                <option value="">All Tiers</option>
                <option value="new">New</option>
                <option value="regular">Regular</option>
                <option value="premium">Premium</option>
                <option value="vip">VIP</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-2 block text-center">Opt-In Only</label>
              <div className="flex justify-center pt-1">
                <button 
                  onClick={() => setCurrentFilter({ safe_only: !currentFilter.safe_only })}
                  className={cn("p-2 rounded-lg transition-colors", currentFilter.safe_only ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-300")}
                >
                  {currentFilter.safe_only ? <Shield size={20}/> : <ShieldOff size={20}/>}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-2 block text-center">Preferences</label>
              <p className="text-[10px] text-gray-400 text-center">Filter across {services.length} services & {staff.length} staff</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-gray-50">
            <button onClick={resetFilter} className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-rose-500 transition-colors">
              <RotateCcw size={14}/> Reset Filters
            </button>
            <button onClick={() => setSaveFilterModal(true)} className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-black transition-all shadow-lg shadow-gray-200">
              <Save size={14}/> Save Filter View
            </button>
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-left border-collapse" dir={isRTL ? 'rtl' : 'ltr'}>
          <thead className="bg-gray-50/50 text-[10px] uppercase text-gray-400 font-black tracking-widest border-b border-gray-50">
            <tr>
              <th className={cn("px-6 py-4", isRTL ? "text-right" : "text-left")}>Client Information</th>
              <th className={cn("px-6 py-4", isRTL ? "text-right" : "text-left")}>Status</th>
              <th className="px-6 py-4 text-center">Activity</th>
              <th className={cn("px-6 py-4", isRTL ? "text-left" : "text-right")}>Revenue ({salonProfile?.currency || '$'})</th>
              <th className="px-6 py-4 text-center">Safety</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm">
            {filteredClients.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center font-black text-lg border border-rose-100">
                      {client.name[0]}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 group-hover:text-rose-600 transition-colors">
                        {client.name}
                      </div>
                      <div className="text-xs text-gray-400 flex flex-col gap-0.5">
                        <span className="flex items-center gap-1">
                          <Mail size={10} /> {client.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone size={10} /> {client.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-5">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center gap-1 w-fit", 
                    getClientTypeColor(client.client_type)
                  )}>
                    {client.client_type} 
                    {client.client_type === 'vip' && <Star size={10} className="fill-current" />}
                  </span>
                </td>

                <td className="px-6 py-5 text-center">
                  <div className="text-xs font-bold text-gray-900 flex flex-col gap-1 items-center">
                    <span className="flex items-center gap-1 text-gray-400">
                      <Calendar size={12} /> Last Visit
                    </span>
                    {client.last_visit ? format(new Date(client.last_visit), 'MMM d, yyyy') : 'No History'}
                  </div>
                </td>

                <td className={cn("px-6 py-5 font-black text-gray-900", isRTL ? "text-left" : "text-right")}>
                  <DollarSign size={14} className="inline mr-0.5 text-gray-300" />
                  {client.total_spent?.toLocaleString()}
                </td>

                <td className="px-6 py-5 text-center">
                  <button 
                    onClick={() => updateClientOptIn(client.id, !client.opt_in)}
                    className={cn(
                      "p-2 rounded-lg transition-all hover:scale-110",
                      client.opt_in ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-300"
                    )}
                  >
                    {client.opt_in ? <Shield size={18} /> : <ShieldOff size={18} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredClients.length === 0 && (
        <div className="py-20 text-center">
          <Users className="mx-auto h-12 w-12 text-gray-200 mb-4" />
          <p className="text-gray-500 font-medium">No clients found matching your search.</p>
        </div>
      )}

      {/* Save Filter Modal */}
      {saveFilterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-gray-900">Save Filter</h3>
            <p className="mt-2 text-sm text-gray-400 font-medium">Quickly access this client segment later.</p>
            <input
              type="text" value={filterName} onChange={(e) => setFilterName(e.target.value)}
              placeholder="e.g., VIP Summer Segment"
              className={cn(
                "mt-6 w-full rounded-xl border-gray-100 bg-gray-50 px-4 py-3 text-sm focus:ring-2 ring-rose-100 outline-none border transition-all",
                isRTL && "text-right"
              )}
            />
            <div className="mt-8 flex gap-3">
              <button onClick={() => setSaveFilterModal(false)} className="flex-1 rounded-xl py-3 text-sm font-bold text-gray-400 hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleSaveFilter} disabled={!filterName.trim()} className="flex-1 rounded-xl bg-rose-600 py-3 text-sm font-bold text-white hover:bg-rose-700 shadow-lg shadow-rose-200 disabled:opacity-50 transition-all">Save Filter</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}