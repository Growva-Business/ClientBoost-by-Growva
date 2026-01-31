import { useState, useEffect } from 'react';
import { 
  Plus, Search, Globe, Phone, X 
} from 'lucide-react'; 
import { useStore } from '@/store/useStore';
import { getTranslation } from '@/localization/translations';
import { countries, getCountryByCode } from '@/data/countries';
import { cn } from '@/shared/utils/cn';
import { 
  Language, PackageType, BillingStatus, WhatsAppProvider 
} from '@/types'; 

interface SalonFormData {
  name: string;
  email: string;
  phone: string;
  country_code: string;
  currency: string;
  language: Language;
  package: PackageType;
  status: BillingStatus;
  timezone: string;
  whatsapp_provider: WhatsAppProvider;
}

const initialFormData: SalonFormData = {
  name: '',
  email: '',
  phone: '',
  country_code: 'SA',
  currency: 'SAR',
  language: 'ar',
  package: 'basic',
  status: 'active',
  timezone: 'Asia/Riyadh',
  whatsapp_provider: 'manual'
};

export function Salons() {
  const { 
    language, 
    salons, 
    loading,
    fetchSalons, 
    addSalon, 
    updateSalonStatus 
  } = useStore();
  
  const t = (key: string) => getTranslation(language, key);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [packageFilter, setPackageFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<SalonFormData>(initialFormData);

  useEffect(() => {
    fetchSalons();
  }, [fetchSalons]);

  // 🔍 Logic to filter the salons based on user input
  const filteredSalons = salons.filter((salon) => {
    const matchesSearch = 
      salon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      salon.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || salon.status === statusFilter;
    const matchesPackage = packageFilter === 'all' || salon.package === packageFilter;
    
    return matchesSearch && matchesStatus && matchesPackage;
  });

  const handleCountryChange = (code: string) => {
    const country = getCountryByCode(code);
    setFormData({
      ...formData,
      country_code: code,
      currency: country?.currency || 'USD',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addSalon(formData);
      setIsModalOpen(false);
      setFormData(initialFormData);
    } catch (error) {
      console.error("Failed to create salon:", error);
    }
  };

  const getPackageColor = (pkg: PackageType) => {
    if (pkg === 'pro') return 'bg-purple-100 text-purple-700';
    if (pkg === 'advanced') return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-700';
  };

  const getStatusColor = (status: BillingStatus) => {
    if (status === 'active') return 'bg-green-100 text-green-700';
    if (status === 'suspended') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('salons')}</h2>
          <p className="text-gray-500">View and manage all live salon accounts</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-all shadow-md"
        >
          <Plus className="h-4 w-4" />
          {t('createSalon')}
        </button>
      </div>

      {/* ✨ UPDATED: Connected Search & Filter Bar */}
      <div className="flex flex-col gap-4 rounded-xl border bg-white p-4 sm:flex-row sm:items-center shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>
        
        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none bg-white hover:border-indigo-300 transition-colors"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
          
          <select
            value={packageFilter}
            onChange={(e) => setPackageFilter(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none bg-white hover:border-indigo-300 transition-colors"
          >
            <option value="all">All Packages</option>
            <option value="basic">Basic</option>
            <option value="advanced">Advanced</option>
            <option value="pro">Pro</option>
          </select>
        </div>
      </div>

      {/* --- TABLE SECTION --- */}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-gray-500">Loading your salon kingdom... 🏰</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Salon Details</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Package</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSalons.map((salon) => (
                  <tr key={salon.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 font-bold uppercase">
                          {salon.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{salon.name}</p>
                          <p className="text-xs text-gray-500">{salon.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1"><Globe className="h-3 w-3 text-gray-400"/> {salon.country_code}</div>
                        <div className="flex items-center gap-1"><Phone className="h-3 w-3 text-gray-400"/> {salon.phone}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", getPackageColor(salon.package))}>
                        {salon.package}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", getStatusColor(salon.status))}>
                        {salon.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                       <button 
                        onClick={() => updateSalonStatus(salon.id, salon.status === 'active' ? 'suspended' : 'active')}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                       >
                         {salon.status === 'active' ? 'Suspend' : 'Activate'}
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- MODAL SECTION --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl overflow-hidden">
            <div className="bg-indigo-600 p-4 text-white flex justify-between items-center shadow-lg">
              <h3 className="font-bold">Build a New Salon Shop 🧱</h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:rotate-90 transition-transform"><X className="h-5 w-5"/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Salon Name</label>
                  <input
                    required
                    className="w-full border-b-2 border-gray-100 py-2 outline-none focus:border-indigo-500 transition-colors"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">Timezone</label>
                  <select 
                    className="w-full border-b-2 py-2 bg-transparent outline-none focus:border-indigo-500 transition-colors"
                    value={formData.timezone}
                    onChange={(e) => setFormData({...formData, timezone: e.target.value})}
                  >
                    <option value="Asia/Riyadh">Riyadh (GMT+3)</option>
                    <option value="Asia/Dubai">Dubai (GMT+4)</option>
                    <option value="UTC">UTC (London)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">WhatsApp API</label>
                  <select 
                    className="w-full border-b-2 py-2 bg-transparent outline-none focus:border-indigo-500 transition-colors"
                    value={formData.whatsapp_provider}
                    onChange={(e) => setFormData({...formData, whatsapp_provider: e.target.value as WhatsAppProvider})}
                  >
                    <option value="manual">Manual (Own Number)</option>
                    <option value="meta_cloud">Meta Cloud (Official)</option>
                    <option value="twilio">Twilio API</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
                  <input
                    type="email"
                    required
                    className="w-full border-b-2 border-gray-100 py-2 outline-none focus:border-indigo-500 transition-colors"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Phone Number</label>
                  <input
                    required
                    className="w-full border-b-2 border-gray-100 py-2 outline-none focus:border-indigo-500 transition-colors"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Country</label>
                  <select 
                    className="w-full border-b-2 border-gray-100 py-2 bg-transparent outline-none focus:border-indigo-500 transition-colors"
                    value={formData.country_code}
                    onChange={(e) => handleCountryChange(e.target.value)}
                  >
                    {countries.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Package Plan</label>
                  <select 
                    className="w-full border-b-2 border-gray-100 py-2 bg-transparent outline-none focus:border-indigo-500 transition-colors"
                    value={formData.package}
                    onChange={(e) => setFormData({...formData, package: e.target.value as PackageType})}
                  >
                    <option value="basic">Basic ($19)</option>
                    <option value="advanced">Advanced ($39)</option>
                    <option value="pro">Pro ($145)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-lg border py-3 font-bold text-gray-400 hover:bg-gray-50 transition-colors"
                >
                  Go Back
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-indigo-600 py-3 font-bold text-white shadow-lg hover:bg-indigo-700 transition-all"
                >
                  Create Now! ✨
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}