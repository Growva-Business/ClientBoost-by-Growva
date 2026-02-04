// src/pages/admin/Billing.tsx
import { useStore } from '@/store/useStore';
import { useFetchDashboardData } from '@/hooks/useFetchDashboardData';

export default function Billing() {
  useFetchDashboardData('admin'); // ✅ Master hook handles fetching
  
  const { 
    invoices, 
    salons, 
    loading 
  } = useStore(); // ❌ Remove fetchSalons and fetchInvoices
  
  // ❌ REMOVE THIS ENTIRE SECTION:
  // 🛡️ SAFETY LOCK: Prevent multiple fetches
  // const hasFetched = useRef(false);
  //
  // useEffect(() => {
  //   // Only fetch once when component mounts
  //   if (!hasFetched.current) {
  //     console.log("🎯 Billing: Initial fetch");
  //     hasFetched.current = true;
  //     fetchSalons();
  //     fetchInvoices();
  //   }
  // }, [fetchSalons, fetchInvoices]); // ✅ Add dependencies

  if (loading && (!salons || salons.length === 0)) {
    return <p className="p-6">Loading Billing Data...</p>;
  }

  return (
    <div className="space-y-8 p-6">
      <h2 className="text-3xl font-black uppercase">🏢 Salons Management</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Salons Section */}
        <div>
          <h3 className="text-xl font-bold mb-4">Active Salons ({salons.length})</h3>
          <div className="space-y-4">
            {salons.map((salon) => (
              <div key={salon.id} className="p-4 bg-white border-2 border-gray-100 rounded-2xl shadow-sm flex justify-between">
                <div>
                  <p className="font-bold text-lg">{salon.name}</p>
                  <p className="text-sm text-gray-500">{salon.email}</p>
                  <p className="text-xs text-gray-400">{salon.package}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold self-center ${
                  salon.status === 'active' 
                    ? 'bg-green-100 text-green-700' 
                    : salon.status === 'suspended'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {salon.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Invoices Section */}
        <div>
          <h3 className="text-xl font-bold mb-4">Invoices ({invoices.length})</h3>
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="p-4 bg-white border-2 border-gray-100 rounded-2xl shadow-sm">
                <div className="flex justify-between mb-2">
                  <p className="font-bold">{invoice.invoice_number}</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    invoice.status === 'paid' 
                      ? 'bg-green-100 text-green-700' 
                      : invoice.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {invoice.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Amount: {invoice.currency} {invoice.amount}</p>
                <p className="text-xs text-gray-500">Due: {new Date(invoice.due_date).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}