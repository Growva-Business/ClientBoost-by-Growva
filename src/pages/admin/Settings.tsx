import { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Database,
  Mail,
  MessageCircle,
  Save,
  Check
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { getTranslation } from '@/localization/translations';
import { cn } from '@/shared/utils/cn';
import { Language } from '@/types';
import { useFetchDashboardData } from '@/hooks/useFetchDashboardData';                                                                             
export default function Settings() {
    useFetchDashboardData('admin'); // ✅ Add this

  const { language, setLanguage } = useStore();
  const t = (key: string) => getTranslation(language, key);

  const [activeTab, setActiveTab] = useState('general');
  const [saved, setSaved] = useState(false);

  const [settings, setSettings] = useState<{
    defaultLanguage: Language;
    timezone: string;
    dateFormat: string;
    emailNotifications: boolean;
    smsNotifications: boolean;
    billingAlerts: boolean;
    usageAlerts: boolean;
    twoFactorAuth: boolean;
    sessionTimeout: number;
    ipWhitelist: string;
    defaultProvider: string;
    twilioAccountSid: string;
    twilioAuthToken: string;
    metaApiKey: string;
    metaPhoneNumberId: string;
  }>({
    // General
    defaultLanguage: language,
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    
    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    billingAlerts: true,
    usageAlerts: true,
    
    // Security
    twoFactorAuth: false,
    sessionTimeout: 30,
    ipWhitelist: '',
    
    // WhatsApp defaults
    defaultProvider: 'manual',
    twilioAccountSid: '',
    twilioAuthToken: '',
    metaApiKey: '',
    metaPhoneNumberId: '',
  });

  const handleSave = () => {
    setLanguage(settings.defaultLanguage as Language);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs = [
    { key: 'general', label: 'General', icon: SettingsIcon },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'security', label: 'Security', icon: Shield },
    { key: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
    { key: 'database', label: 'Database', icon: Database },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('settings')}</h2>
          <p className="text-gray-500">Configure system preferences and integrations</p>
        </div>
        <button
          onClick={handleSave}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors",
            saved ? "bg-green-600" : "bg-indigo-600 hover:bg-indigo-700"
          )}
        >
          {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? 'Saved!' : t('save')}
        </button>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar tabs */}
        <div className="w-full lg:w-64">
          <div className="rounded-xl border bg-white p-2 shadow-sm">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                    activeTab === tab.key
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Settings content */}
        <div className="flex-1 rounded-xl border bg-white p-6 shadow-sm">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>
              
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Default Language
                  </label>
                  <select
                    value={settings.defaultLanguage}
                    onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value as Language })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="en">English</option>
                    <option value="ar">العربية (Arabic)</option>
                    <option value="fr">Français (French)</option>
                  </select>
                </div>
                
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Timezone
                  </label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="UTC">UTC</option>
                    <option value="Asia/Riyadh">Asia/Riyadh (GMT+3)</option>
                    <option value="Asia/Dubai">Asia/Dubai (GMT+4)</option>
                    <option value="Europe/Paris">Europe/Paris (GMT+1)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                  </select>
                </div>
                
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Date Format
                  </label>
                  <select
                    value={settings.dateFormat}
                    onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
              
              <div className="space-y-4">
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive important updates via email', icon: Mail },
                  { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Receive critical alerts via SMS', icon: MessageCircle },
                  { key: 'billingAlerts', label: 'Billing Alerts', desc: 'Get notified about payment issues', icon: Bell },
                  { key: 'usageAlerts', label: 'Usage Alerts', desc: 'Alert when salons reach usage limits', icon: Bell },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.key} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-gray-100 p-2">
                          <Icon className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.label}</p>
                          <p className="text-sm text-gray-500">{item.desc}</p>
                        </div>
                      </div>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          checked={settings[item.key as keyof typeof settings] as boolean}
                          onChange={(e) => setSettings({ ...settings, [item.key]: e.target.checked })}
                          className="peer sr-only"
                        />
                        <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-indigo-600 peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-gray-100 p-2">
                      <Shield className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-500">Add an extra layer of security</p>
                    </div>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={settings.twoFactorAuth}
                      onChange={(e) => setSettings({ ...settings, twoFactorAuth: e.target.checked })}
                      className="peer sr-only"
                    />
                    <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-indigo-600 peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                  </label>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Session Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    IP Whitelist (comma separated)
                  </label>
                  <textarea
                    value={settings.ipWhitelist}
                    onChange={(e) => setSettings({ ...settings, ipWhitelist: e.target.value })}
                    placeholder="192.168.1.1, 10.0.0.1"
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">Leave empty to allow all IPs</p>
                </div>
              </div>
            </div>
          )}

          {/* WhatsApp Settings */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">WhatsApp Provider Configuration</h3>
              <p className="text-sm text-gray-500">Configure default WhatsApp provider settings for salons</p>
              
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Default Provider
                </label>
                <select
                  value={settings.defaultProvider}
                  onChange={(e) => setSettings({ ...settings, defaultProvider: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="manual">Manual (Salon's own number)</option>
                  <option value="twilio">Twilio</option>
                  <option value="meta_cloud">Meta Cloud API</option>
                </select>
              </div>

              <div className="rounded-lg border p-4">
                <h4 className="mb-4 font-medium text-gray-900">Twilio Configuration</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Account SID
                    </label>
                    <input
                      type="text"
                      value={settings.twilioAccountSid}
                      onChange={(e) => setSettings({ ...settings, twilioAccountSid: e.target.value })}
                      placeholder="ACxxxxxxxxxxxxxxxxx"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Auth Token
                    </label>
                    <input
                      type="password"
                      value={settings.twilioAuthToken}
                      onChange={(e) => setSettings({ ...settings, twilioAuthToken: e.target.value })}
                      placeholder="••••••••••••••••"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h4 className="mb-4 font-medium text-gray-900">Meta Cloud API Configuration</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      API Key
                    </label>
                    <input
                      type="password"
                      value={settings.metaApiKey}
                      onChange={(e) => setSettings({ ...settings, metaApiKey: e.target.value })}
                      placeholder="••••••••••••••••"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Phone Number ID
                    </label>
                    <input
                      type="text"
                      value={settings.metaPhoneNumberId}
                      onChange={(e) => setSettings({ ...settings, metaPhoneNumberId: e.target.value })}
                      placeholder="1234567890"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Database Settings */}
          {activeTab === 'database' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Database & Backup</h3>
              
              <div className="rounded-lg border p-4">
                <h4 className="font-medium text-gray-900">Supabase Connection</h4>
                <p className="mt-1 text-sm text-gray-500">Database connection status and information</p>
                
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-green-50 p-3">
                    <p className="text-xs text-green-600">Status</p>
                    <p className="font-medium text-green-700">Connected</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs text-gray-500">Region</p>
                    <p className="font-medium text-gray-700">eu-west-1</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h4 className="font-medium text-gray-900">Backup & Export</h4>
                <p className="mt-1 text-sm text-gray-500">Download or backup your data</p>
                
                <div className="mt-4 flex flex-wrap gap-3">
                  <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Export All Data (JSON)
                  </button>
                  <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Export Salons (CSV)
                  </button>
                  <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Create Backup
                  </button>
                </div>
              </div>

              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <h4 className="font-medium text-red-900">Danger Zone</h4>
                <p className="mt-1 text-sm text-red-700">These actions are irreversible</p>
                
                <div className="mt-4 flex flex-wrap gap-3">
                  <button className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
                    Clear All Logs
                  </button>
                  <button className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                    Reset Demo Data
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
