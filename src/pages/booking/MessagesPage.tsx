import { useState } from 'react';
import { 
  MessageSquare, Send, Clock, CheckCircle, 
  XCircle, AlertCircle, Filter 
} from 'lucide-react';
import { useBookingStore } from '@/store/useBookingStore';
import { cn } from '@/shared/utils/cn';

export function MessagesPage() {
  const { dailyLimits, bookings } = useBookingStore();
  const [filterType, setFilterType] = useState<string>('all');
  
  if (!dailyLimits) {
    return <div className="p-10 text-center">Loading message metrics... 💬</div>;
  }

  // 🧸 Using nested .client object and correct snake_case from your Booking type
  const messageHistory = bookings.flatMap(booking => {
    const messages = [];
    
    // Check if client data exists to prevent crashes
    if (!booking.client) return [];

    if (booking.confirmation_sent) { 
      messages.push({
        id: `${booking.id}-conf`,
        type: 'confirmation',
        clientName: booking.client.name, // 🧸 Fixed: booking.client.name
        clientPhone: booking.client.phone, // 🧸 Fixed: booking.client.phone
        content: `Your appointment is scheduled for ${booking.date} at ${booking.start_time}. Reply OK to confirm.`,
        status: 'delivered',
        sentAt: booking.created_at,
      });
    }
    
    if (booking.reminder_sent) { 
      messages.push({
        id: `${booking.id}-rem`,
        type: 'reminder',
        clientName: booking.client.name,
        clientPhone: booking.client.phone,
        content: `Reminder: Your appointment is in 4 hours at ${booking.start_time}. See you soon!`,
        status: 'delivered',
        sentAt: booking.date, 
      });
    }
    return messages;
  });

  const filteredMessages = filterType === 'all' 
    ? messageHistory 
    : messageHistory.filter(m => m.type === filterType);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'confirmation': return 'bg-green-100 text-green-700';
      case 'reminder': return 'bg-blue-100 text-blue-700';
      case 'promotion': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'sent': return <Send className="h-4 w-4 text-blue-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-amber-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const usagePercentage = (dailyLimits.used_total / dailyLimits.total) * 100;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">WhatsApp Messages</h2>
        <p className="text-gray-500">Monitor message usage and delivery status</p>
      </div>

      {/* Usage Warning */}
      {usagePercentage >= 80 && (
        <div className={cn(
          "flex items-center gap-3 rounded-xl border p-4",
          usagePercentage >= 100 ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"
        )}>
          <AlertCircle className={cn("h-5 w-5", usagePercentage >= 100 ? "text-red-600" : "text-amber-600")} />
          <div>
            <p className={cn("font-medium", usagePercentage >= 100 ? "text-red-800" : "text-amber-800")}>
              {usagePercentage >= 100 ? 'Daily Limit Reached' : 'Approaching Daily Limit'}
            </p>
            <p className={cn("text-sm", usagePercentage >= 100 ? "text-red-700" : "text-amber-700")}>
              {usagePercentage >= 100 
                ? 'New messages will be sent via Twilio/Meta Cloud API' 
                : `${dailyLimits.used_total} of ${dailyLimits.total} messages used today`}
            </p>
          </div>
        </div>
      )}

      {/* Usage Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Total Today</p>
            <MessageSquare className="h-5 w-5 text-gray-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {dailyLimits.used_total}/{dailyLimits.total}
          </p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
            <div 
              className={cn(
                "h-full rounded-full transition-all",
                usagePercentage >= 90 ? "bg-red-500" : usagePercentage >= 70 ? "bg-amber-500" : "bg-green-500"
              )}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Confirmations</p>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {dailyLimits.used_confirmation}/{dailyLimits.confirmation}
          </p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
            <div 
              className="h-full bg-green-500 rounded-full"
              style={{ width: `${(dailyLimits.used_confirmation / dailyLimits.confirmation) * 100}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Reminders</p>
            <Clock className="h-5 w-5 text-blue-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {dailyLimits.used_reminder}/{dailyLimits.reminder}
          </p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
            <div 
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${(dailyLimits.used_reminder / dailyLimits.reminder) * 100}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Promotions</p>
            <Send className="h-5 w-5 text-purple-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {dailyLimits.used_promotion}/{dailyLimits.promotion}
          </p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
            <div 
              className="h-full bg-purple-500 rounded-full"
              style={{ width: `${(dailyLimits.used_promotion / dailyLimits.promotion) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Message History */}
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="font-semibold text-gray-900">Recent Messages</h3>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="confirmation">Confirmations</option>
              <option value="reminder">Reminders</option>
              <option value="promotion">Promotions</option>
            </select>
          </div>
        </div>
        
        <div className="divide-y max-h-[400px] overflow-y-auto">
          {filteredMessages.length === 0 ? (
            <div className="py-12 text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2 text-gray-500">No messages yet</p>
            </div>
          ) : (
            filteredMessages.map((message) => (
              <div key={message.id} className="flex items-start gap-4 px-5 py-4">
                <div className="mt-1">
                  {getStatusIcon(message.status)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", getTypeColor(message.type))}>
                      {message.type}
                    </span>
                    <span className="text-sm text-gray-900 font-bold">{message.clientName}</span>
                    <span className="text-xs text-gray-400">{message.clientPhone}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{message.content}</p>
                </div>
                <div className="text-right text-xs text-gray-400">
                  {message.sentAt ? new Date(message.sentAt).toLocaleString() : 'Pending'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}