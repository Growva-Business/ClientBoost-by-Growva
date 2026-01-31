import { useState } from 'react';
import { 
  Megaphone, Plus, Play, Pause, CheckCircle, Trash2, 
  Edit2, X, Users, Send, Clock, Target 
} from 'lucide-react';
import { useMarketingStore } from '@/store/useMarketingStore';
import { useBookingStore } from '@/store/useBookingStore';
import { cn } from '@/shared/utils/cn';
import { format } from 'date-fns'; // 🧸 Now used below
import { Campaign, CampaignStatus } from '@/types';

export function CampaignsPage() {
  const { 
    campaigns, clients, getSafeClients, createCampaign,
    updateCampaign, deleteCampaign 
  } = useMarketingStore();
  const { salonProfile } = useBookingStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const safeClients = getSafeClients();
  const filteredCampaigns = campaigns.filter(c => 
    statusFilter === 'all' || c.status === statusFilter
  );

  const handleStatusChange = (id: string, newStatus: CampaignStatus) => {
    updateCampaign(id, { 
      status: newStatus,
      started_at: newStatus === 'active' ? new Date().toISOString() : undefined 
    });
  };

  const openEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Megaphone className="text-rose-600" /> {salonProfile?.name} Campaigns
          </h2>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Targeting {clients.length} total clients
          </p>
        </div>
        <button
          onClick={() => { setEditingCampaign(null); setIsModalOpen(true); }}
          className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-black text-white hover:bg-black transition-all shadow-lg shadow-gray-200"
        >
          <Plus size={18} /> Create Campaign
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
        {['all', 'active', 'draft', 'completed'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-black uppercase transition-all",
              statusFilter === status ? "bg-white text-rose-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
            )}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Campaigns Cards */}
      <div className="grid gap-4">
        {filteredCampaigns.map((campaign) => (
          <div key={campaign.id} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100 group-hover:bg-rose-600 group-hover:text-white transition-all">
                  <Target size={24} />
                </div>
                <div>
                  <h3 className="font-black text-lg text-gray-900">{campaign.name}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs font-bold text-gray-400">
                    <span className="flex items-center gap-1"><Users size={12} /> {campaign.target_clients?.length || 0} Targets</span>
                    {/* 🧸 Using Clock icon here */}
                    <span className="flex items-center gap-1"><Clock size={12} /> {campaign.started_at ? format(new Date(campaign.started_at), 'MMM d') : 'Unstarted'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => openEdit(campaign)} className="p-2.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                  <Edit2 size={18} />
                </button>
                {campaign.status === 'active' ? (
                  /* 🧸 Using Pause icon here */
                  <button onClick={() => handleStatusChange(campaign.id, 'paused')} className="p-2.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors">
                    <Pause size={18}/>
                  </button>
                ) : (
                  <button onClick={() => handleStatusChange(campaign.id, 'active')} className="p-2.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
                    <Play size={18}/>
                  </button>
                )}
                <button onClick={() => deleteCampaign(campaign.id)} className="p-2.5 bg-gray-50 text-gray-400 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors">
                  <Trash2 size={18}/>
                </button>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-50 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sent</p>
                <p className="text-lg font-black text-gray-900 flex items-center gap-2"><Send size={14} className="text-blue-500"/> {campaign.messages_sent || 0}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Delivered</p>
                <p className="text-lg font-black text-gray-900 flex items-center gap-2"><CheckCircle size={14} className="text-green-500"/> {campaign.messages_delivered || 0}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-gray-900">
                {editingCampaign ? `Edit ${editingCampaign.name}` : 'Create New Campaign'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}><X className="text-gray-400 hover:text-black"/></button>
            </div>
            
            <div className="space-y-4">
              <button 
                onClick={() => {
                  if (!editingCampaign) {
                    createCampaign({
                      salon_id: salonProfile?.id || '',
                      name: "Summer Campaign",
                      message_template: "Hi {name}!",
                      target_clients: safeClients.map(c => c.id),
                      status: 'draft',
                      promotion_days: 20,
                      follow_up_days: 3,
                      auto_send: false,
                      // 🧸 Added missing properties here to fix the "Argument of type" error
                      messages_sent: 0,
                      messages_delivered: 0,
                      messages_clicked: 0
                    });
                  }
                  setIsModalOpen(false);
                }}
                className="w-full bg-rose-600 text-white font-black py-4 rounded-xl shadow-lg hover:bg-rose-700 transition-all shadow-rose-100"
              >
                {editingCampaign ? 'Update Campaign' : 'Initialize Campaign Draft'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}