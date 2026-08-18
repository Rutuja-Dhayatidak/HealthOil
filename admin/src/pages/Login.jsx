import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, Loader2, ShieldCheck } from 'lucide-react';
import { loginAdmin } from '../ApiServices/adminService';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await loginAdmin(email, password);
      if (response.success) {
        const origin = location.state?.from?.pathname || '/admin/dashboard';
        navigate(origin, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-[#b89547]/5 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-[#031d13]/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#b89547]/10 relative z-10">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-[#031d13] rounded-2xl flex items-center justify-center shadow-lg shadow-[#031d13]/20 border border-[#b89547]/20">
            <ShieldCheck className="w-8 h-8 text-[#D4AF37]" />
          </div>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-serif font-bold text-[#031d13] mb-2 tracking-tight">Admin Portal</h1>
          <p className="text-sm text-gray-500 font-medium">Enter your credentials to access the dashboard</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold text-center mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#031d13] uppercase tracking-wider ml-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 bg-[#FAF8F5] border border-gray-100 text-[#031d13] text-sm rounded-xl focus:ring-2 focus:ring-[#b89547]/30 focus:border-[#b89547] focus:bg-white transition-all outline-none"
                placeholder="admin@worknai.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[#031d13] uppercase tracking-wider ml-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 bg-[#FAF8F5] border border-gray-100 text-[#031d13] text-sm rounded-xl focus:ring-2 focus:ring-[#b89547]/30 focus:border-[#b89547] focus:bg-white transition-all outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#031d13] hover:bg-[#0a291c] text-[#FAF4E8] py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#031d13]/20 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                Authenticating...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
