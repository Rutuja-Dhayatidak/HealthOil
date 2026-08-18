import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { loginVendor } from '../../ApiServices/vendorAuthService'
import toast from 'react-hot-toast'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await loginVendor(email, password);
      toast.success("Login successful!");
      
      // Check onboarding status
      if (response.data.onboardingStatus !== 'APPROVED') {
        navigate('/vendor/kyc');
      } else {
        navigate('/vendor/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F2E7] flex flex-col justify-center items-center p-6 text-[#15251F]">
      <div className="max-w-md w-full bg-white border border-[#D4AF37]/25 rounded-3xl p-8 shadow-xl text-left">

        {/* Brand */}
        <div className="flex items-center gap-2.5 mb-6 justify-center">
          <div className="w-9 h-9 rounded-full bg-[#002F24] border border-[#D4AF37]/35 flex items-center justify-center text-[#D4AF37]">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold font-serif tracking-wide leading-none text-[#002F24]">HealthOil</h1>
            <span className="text-[9px] text-[#D4AF37] font-semibold tracking-wider uppercase">Vendor Login</span>
          </div>
        </div>

        <h2 className="text-lg font-serif font-bold text-[#002F24] text-center mb-6">Welcome Back Partner</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl p-3 mb-4 text-center font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
            <div className="flex items-center gap-2.5 bg-[#F8F2E7]/40 border border-[#D4AF37]/20 rounded-xl px-3.5 py-2.5 focus-within:border-[#002F24] transition-colors">
              <Mail className="w-4 h-4 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vendor@healthoil.com"
                className="bg-transparent text-xs outline-none w-full text-[#15251F] placeholder-gray-400"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Password</label>
              <Link to="/vendor/forgot-password" className="text-[10px] font-bold text-[#D4AF37] hover:underline">Forgot?</Link>
            </div>
            <div className="flex items-center gap-2.5 bg-[#F8F2E7]/40 border border-[#D4AF37]/20 rounded-xl px-3.5 py-2.5 focus-within:border-[#002F24] transition-colors">
              <Lock className="w-4 h-4 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-transparent text-xs outline-none w-full text-[#15251F] placeholder-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input type="checkbox" id="remember" className="rounded border-gray-300 text-[#002F24] focus:ring-[#002F24]" />
            <label htmlFor="remember" className="text-[11px] text-gray-500 font-bold cursor-pointer">Remember my shop session</label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#002F24] text-[#F8F2E7] hover:bg-[#014D3A] rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center cursor-pointer shadow-md shadow-[#002F24]/10 disabled:opacity-50 mt-4"
          >
            {loading ? 'Signing In...' : 'Verify & Enter Shop'}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-[#D4AF37]/10 pt-4 text-xs text-gray-500">
          New vendor? <Link to="/vendor/register" className="font-bold text-[#D4AF37] hover:underline">Apply to Sell Oils</Link>
        </div>

      </div>
    </div>
  )
}
