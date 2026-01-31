import { useState } from 'react';
import { X, Plus, Trash2, Tag } from 'lucide-react';
import { useBookingStore } from '@/store/useBookingStore';

interface CategoryManagerProps {
  onClose: () => void;
}

export function CategoryManager({ onClose }: CategoryManagerProps) {
  const { categories, addCategory, deleteCategory, salonProfile } = useBookingStore();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    
    setIsSubmitting(true);
    await addCategory(newCategoryName.trim());
    setNewCategoryName('');
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="font-bold text-gray-900">Manage Categories</h3>
            <p className="text-xs text-gray-500">Organize your service menu</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Add New Form */}
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              required
              placeholder="e.g. Haircuts, Coloring..."
              className="flex-1 border-b py-2 outline-none focus:border-indigo-500 text-sm"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="p-2 rounded-lg text-white shadow-md transition-transform active:scale-95 disabled:opacity-50"
              style={{ backgroundColor: salonProfile?.brand_color || '#4f46e5' }}
            >
              <Plus size={20} />
            </button>
          </form>

          {/* Category List */}
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {categories.length === 0 ? (
              <p className="text-center py-10 text-gray-400 text-sm italic">No categories created yet.</p>
            ) : (
              categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl group transition-colors hover:bg-gray-100">
                  <div className="flex items-center gap-3">
                    <Tag size={16} className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                  </div>
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}