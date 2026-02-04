import { useState, useEffect, useRef } from 'react'; // ✅ Added useRef
import { Book, Plus, Trash2, Globe, Tag } from 'lucide-react';
import { useBookingStore } from '@/store/useBookingStore';
import { cn } from '@/shared/utils/cn'; // For consistent styling
import { useFetchDashboardData } from '@/hooks/useFetchDashboardData';                                                                             


export default function EbookManager() {
    useFetchDashboardData('admin'); // ✅ Add this

  const { crmEbooks, fetchCrmEbooks, addCrmEbook, deleteCrmEbook } = useBookingStore();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category_type: 'hair',
    file_url: '',
    language: 'en'
  });

  // ✅ Safety lock to prevent multiple fetches
  const hasFetched = useRef(false);
  const lastFetchTime = useRef(0);

  useEffect(() => {
    // 🛡️ Throttle: Only fetch once every 10 seconds max
    const now = Date.now();
    if (now - lastFetchTime.current < 10000) {
      console.log("⏸️ Ebook fetch throttled");
      return;
    }

    // 🛡️ Only fetch if we haven't already fetched or if data is empty
    if (!hasFetched.current || !crmEbooks || crmEbooks.length === 0) {
      console.log("📚 Fetching ebooks...");
      fetchCrmEbooks();
      hasFetched.current = true;
      lastFetchTime.current = now;
    }
  }, [fetchCrmEbooks, crmEbooks]); // ✅ Include crmEbooks as dependency

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addCrmEbook(formData);
    setFormData({ title: '', category_type: 'hair', file_url: '', language: 'en' });
    setIsAdding(false);
  };

  // ✅ Helper function to get category display name
  const getCategoryDisplay = (category: string) => {
    const categories: Record<string, string> = {
      'hair': 'Hair Care',
      'skin': 'Skin Care',
      'nails': 'Nail Care',
      'other': 'Other'
    };
    return categories[category] || category;
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">CRM Professional Library</h2>
          <p className="text-gray-500 font-medium italic">Content as a Service Dashboard</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-indigo-700 shadow-lg transition-all"
        >
          {isAdding ? 'Cancel' : <><Plus size={20}/> Add New E-book</>}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] border-4 border-indigo-50 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Title</label>
            <input 
              required
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 font-bold outline-none focus:border-indigo-500 transition-all"
              placeholder="e.g., 10 Hair Growth Secrets"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
            <select 
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 font-bold outline-none focus:border-indigo-500"
              value={formData.category_type}
              onChange={e => setFormData({...formData, category_type: e.target.value})}
            >
              <option value="hair">Hair Care</option>
              <option value="skin">Skin Care</option>
              <option value="nails">Nail Care</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">PDF URL</label>
            <input 
              required
              type="url"
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 font-bold outline-none focus:border-indigo-500"
              placeholder="https://storage.your-crm.com/book.pdf"
              value={formData.file_url}
              onChange={e => setFormData({...formData, file_url: e.target.value})}
            />
          </div>
          <div className="space-y-2 flex items-end">
            <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-indigo-100 shadow-xl hover:bg-indigo-700 transition-all">
              Save to Library
            </button>
          </div>
        </form>
      )}

      {/* ✅ Ebooks Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {crmEbooks && crmEbooks.length > 0 ? (
          crmEbooks.map(book => (
            <div key={book.id} className="bg-white p-6 rounded-[2.5rem] border-2 border-gray-50 shadow-sm group hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-6">
                <div className={cn(
                  "p-4 rounded-2xl transition-colors",
                  book.category_type === 'hair' ? "bg-indigo-50 text-indigo-600" :
                  book.category_type === 'skin' ? "bg-pink-50 text-pink-600" :
                  book.category_type === 'nails' ? "bg-purple-50 text-purple-600" :
                  "bg-gray-50 text-gray-600"
                )}>
                  <Book size={28} />
                </div>
                <button 
                  onClick={() => { 
                    if(confirm(`Are you sure you want to delete "${book.title}"?`)) 
                      deleteCrmEbook(book.id);
                  }}
                  className="text-gray-300 hover:text-red-500 transition-colors p-2"
                >
                  <Trash2 size={20} />
                </button>
              </div>
              <h4 className="font-black text-xl text-gray-900 mb-6 leading-tight">{book.title}</h4>
              <div className="flex flex-wrap gap-2">
                <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase text-gray-500 border border-gray-100">
                  <Tag size={12}/> {getCategoryDisplay(book.category_type)}
                </span>
                <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase text-gray-500 border border-gray-100">
                  <Globe size={12}/> {book.language?.toUpperCase() || 'EN'}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-12">
            <Book className="mx-auto h-16 w-16 text-gray-300" />
            <p className="mt-4 text-gray-500 font-medium">No e-books yet. Add your first one!</p>
          </div>
        )}
      </div>
    </div>
  );
}