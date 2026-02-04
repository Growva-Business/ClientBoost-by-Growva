import { useState } from 'react';
import { 
  Plus, Search, User, Phone, Mail, Star, ExternalLink 
} from 'lucide-react';
import { useBookingStore } from '@/store/useBookingStore';
import { cn } from '@/shared/utils/cn';
import { useFetchDashboardData } from '@/hooks/useFetchDashboardData';

export default function ClientsPage() {
  const { loading } = useFetchDashboardData('booking'); // ✅ Master hook handles all fetching
  
  const { salonProfile, clients } = useBookingStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClients = clients.filter((c: any) => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.phone.includes(searchQuery)
  );

  // ✅ Use loading from master hook
  if (loading || !salonProfile) return <div className="p-10 text-center">Loading Clients... 👥</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Client Directory</h2>
          <p className="text-gray-500">Manage your customer relationships and loyalty</p>
        </div>
        <button 
          className="px-4 py-2.5 rounded-lg text-white font-bold shadow-lg" 
          style={{ backgroundColor: salonProfile.brand_color }}
        >
          <Plus size={18} className="inline mr-2" /> New Client
        </button>
      </div>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text"
          placeholder="Search by name or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(
            "w-full pl-10 pr-4 py-2 border rounded-xl outline-none transition-all",
            "focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          )}
        />
      </div>
      <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Client</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Contact</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Loyalty Points</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredClients.map((client: any) => (
              <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{client.name}</p>
                      <p className="text-xs text-gray-500">Joined {new Date(client.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  <div className="flex flex-col">
                    <span className="flex items-center gap-1"><Phone size={12}/> {client.phone}</span>
                    <span className="flex items-center gap-1 text-gray-400"><Mail size={12}/> {client.email || 'No email'}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Star size={14} className="text-yellow-400" fill="currentColor"/>
                    <span className="font-bold text-gray-900">{client.loyalty_points || 0}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-gray-400 hover:text-indigo-600"><ExternalLink size={18}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}