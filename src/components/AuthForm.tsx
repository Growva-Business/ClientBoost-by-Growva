import { useState } from 'react';
import { supabase } from '../shared/lib/supabase';
import { useAuth } from '../shared/lib/auth-context'; // Import your existing auth context

export function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use your existing auth context - even though it doesn't have setSession,
  // the onAuthStateChange in AuthProvider will handle it
  const { session } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (signInError) {
        setError(signInError.message);
        return;
      }
      
      console.log('✅ Login successful');
      // The auth context will automatically update via onAuthStateChange
      
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-xl">
        <div className="text-center">
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter">
            GROWVA CRM
          </h2>
          <p className="mt-2 text-gray-500">Salon Management System</p>
        </div>
        
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 font-medium">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Email Address
            </label>
            <input 
              type="email" 
              placeholder="admin@example.com" 
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Password
            </label>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-indigo-600 hover:bg-indigo-700 py-3.5 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : 'Sign In'}
          </button>
        </form>
        
        <div className="pt-4 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">
            Demo Credentials: <span className="font-mono text-gray-700">demo@growva.com</span> / <span className="font-mono text-gray-700">demo123</span>
          </p>
        </div>
      </div>
    </div>
  );
}