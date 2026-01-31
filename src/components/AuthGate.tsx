import { useState, useEffect } from 'react';
import { supabase } from '@/shared/lib/supabase';
import { useBookingStore } from '@/store/useBookingStore';
import { useStore } from '@/store/useStore';

export function AuthGate() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { fetchData } = useBookingStore();

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        // Fetch user's salon data
        fetchUserSalonData(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        fetchUserSalonData(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserSalonData = async (userId: string) => {
    const { data: userProfile } = await supabase
      .from('users')
      .select('salon_id')
      .eq('id', userId)
      .single();
    
    if (userProfile?.salon_id) {
      fetchData(userProfile.salon_id);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: 'password123' // In production, get password from form
    });
    if (error) {
      alert('Login failed: ' + error.message);
    }
    setLoading(false);
  };

  // If user is logged in, show children
  if (user) {
    return null; // Or you could show user info
  }

  // Show login form if not authenticated
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Salon CRM Login</h2>
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full p-3 border rounded-lg mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        
        <div className="mt-6 text-sm text-gray-600">
          <p className="mb-2">Demo accounts:</p>
          <ul className="space-y-1">
            <li>• admin@test.com (Super Admin)</li>
            <li>• salon@test.com (Salon Manager)</li>
            <li>• staff@test.com (Staff Member)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}