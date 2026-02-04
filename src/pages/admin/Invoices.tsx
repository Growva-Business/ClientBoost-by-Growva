import { useState, useEffect, useRef } from 'react'; // ✅ Added useRef
import { 
   Download, Search, CheckCircle, Clock, AlertCircle, Eye, X, Printer
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { getTranslation } from '@/localization/translations';
import { cn } from '@/shared/utils/cn';
import { format } from 'date-fns';
import { Invoice } from '@/types';
import { useFetchDashboardData } from '@/hooks/useFetchDashboardData';                                                                             

export default function Invoices() {
    useFetchDashboardData('admin'); // ✅ Add this

  const { language, invoices, fetchInvoices, markInvoiceAsPaid } = useStore();
  const t = (key: string) => getTranslation(language, key);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  
  // ✅ Added safety lock to prevent multiple fetches
  const hasFetched = useRef(false);

  // 🚀 Get fresh invoices when we open the page WITH SAFETY LOCK
  useEffect(() => {
    // ✅ Only fetch if we haven't fetched already in this session
    if (!hasFetched.current) {
      console.log("📄 Invoices: Fetching invoices...");
      fetchInvoices();
      hasFetched.current = true;
    }
    
    // Optional: Add a cleanup function to reset on unmount
    return () => {
      // If you want to refetch when component mounts again, keep this commented
      // hasFetched.current = false;
    };
  }, [fetchInvoices]);

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch = 
      invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (invoice.salon_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'overdue': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // 📝 Improved Download Method
  const handleDownloadPdf = (invoice: Invoice) => {
    const content = `
    ======================================
               SALON CRM INVOICE
    ======================================
    Invoice #: ${invoice.invoice_number}
    Created:   ${format(new Date(invoice.created_at), 'PPP')}
    Due Date:  ${format(new Date(invoice.due_date), 'PPP')}
    Status:    ${invoice.status.toUpperCase()}
    --------------------------------------
    BILL TO:   ${invoice.salon_id}
    TOTAL:     ${invoice.currency} ${invoice.amount}
    --------------------------------------
    Thank you for using ClientBoost!
    ======================================
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice_${invoice.invoice_number}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('invoices')}</h2>
          <p className="text-gray-500">Track and manage salon payments 🧾</p>
        </div>
      </div>

      {/* 📊 Tiny Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-4 shadow-sm flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-lg"><CheckCircle className="text-green-600"/></div>
          <div><p className="text-xl font-bold">{invoices.filter(i => i.status === 'paid').length}</p><p className="text-xs text-gray-500">Paid</p></div>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm flex items-center gap-4">
          <div className="bg-amber-100 p-3 rounded-lg"><Clock className="text-amber-600"/></div>
          <div><p className="text-xl font-bold">{invoices.filter(i => i.status === 'pending').length}</p><p className="text-xs text-gray-500">Pending</p></div>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm flex items-center gap-4">
          <div className="bg-red-100 p-3 rounded-lg"><AlertCircle className="text-red-600"/></div>
          <div><p className="text-xl font-bold">{invoices.filter(i => i.status === 'overdue').length}</p><p className="text-xs text-gray-500">Overdue</p></div>
        </div>
      </div>

      {/* 🔍 Filter Bar */}
      <div className="flex gap-4 bg-white p-4 rounded-xl border sm:flex-row flex-col">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" 
            placeholder="Search invoice number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select 
          className="border rounded-lg px-4 py-2 outline-none bg-white"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {/* 🧾 Invoices Table */}
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Invoice</th>
              <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Due Date</th>
              <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredInvoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-bold text-gray-900">{inv.invoice_number}</p>
                  <p className="text-xs text-gray-400">{format(new Date(inv.created_at), 'MMM d, yyyy')}</p>
                </td>
                <td className="px-6 py-4 font-bold text-gray-700">{inv.currency} {inv.amount}</td>
                <td className="px-6 py-4 text-sm">{format(new Date(inv.due_date), 'MMM d, yyyy')}</td>
                <td className="px-6 py-4">
                  <span className={cn("px-2 py-1 rounded-full text-[10px] font-bold uppercase", getStatusColor(inv.status))}>
                    {inv.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button onClick={() => setViewInvoice(inv)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"><Eye size={18}/></button>
                  <button onClick={() => handleDownloadPdf(inv)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"><Download size={18}/></button>
                  {inv.status !== 'paid' && (
                    <button 
                      onClick={() => markInvoiceAsPaid(inv.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-bold"
                    >
                      Pay
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🖼️ Invoice View Modal */}
      {viewInvoice && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-indigo-600 text-white">
              <h3 className="font-bold">Invoice Details</h3>
              <button onClick={() => setViewInvoice(null)}><X/></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex justify-between">
                <div>
                  <p className="text-xs text-gray-400 uppercase font-bold">From</p>
                  <p className="font-bold text-indigo-600">CLIENTBOOST CRM</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 uppercase font-bold">Invoice #</p>
                  <p className="font-bold">{viewInvoice.invoice_number}</p>
                </div>
              </div>
              <div className="border-t border-b py-4 flex justify-between items-center">
                <p className="text-gray-600 font-bold">Total Amount Due:</p>
                <p className="text-2xl font-black text-gray-900">{viewInvoice.currency} {viewInvoice.amount}</p>
              </div>
              <div className="flex justify-between text-sm">
                <p className="text-gray-400">Due Date:</p>
                <p className="font-bold">{format(new Date(viewInvoice.due_date), 'MMMM d, yyyy')}</p>
              </div>
              <button 
                onClick={() => { window.print(); }}
                className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <Printer size={18}/> Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}