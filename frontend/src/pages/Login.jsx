import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShieldAlert, Loader2 } from 'lucide-react'
import { userService } from '../ApiServices/userService'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await userService.loginUser({ email, password })
      if (response.token) {
        localStorage.setItem('token', response.token)
      }
      navigate('/profile')
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF4E8] text-[#15251F] font-sans flex flex-col items-center justify-center p-4">
      <button 
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#002F24] transition-colors cursor-pointer group bg-transparent border-none"
      >
        <ArrowLeft className="w-4 h-4 text-[#D4AF37] group-hover:-translate-x-0.5 transition-transform" />
        Back to Home
      </button>

      <div className="bg-white border border-[#D4AF37]/15 rounded-2xl p-8 shadow-lg max-w-md w-full text-center">
        <div className="w-16 h-16 bg-[#FAF6EC] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <ShieldAlert className="w-8 h-8 text-[#D4AF37]" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-[#002F24] mb-2">Welcome Back</h2>
        <p className="text-sm text-gray-500 mb-6">Please enter your details to sign in to HealthOil.</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold p-3 rounded-xl mb-6 text-left">
            {error}
          </div>
        )}

        <form className="space-y-5 text-left" onSubmit={handleLogin}>
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1.5 tracking-wider">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#FAF6EC] border border-gray-200 outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-xl py-3 px-4 text-sm font-bold text-[#002F24] transition-all" 
              placeholder="e.g. aarav@example.com" 
              required 
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1.5 tracking-wider">Password</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full bg-[#FAF6EC] border border-gray-200 outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-xl py-3 px-4 text-sm font-bold text-[#002F24] transition-all" 
              placeholder="••••••••" 
              required 
            />
          </div>
          
          <div className="flex justify-between items-center mt-2 mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#002F24] focus:ring-[#002F24]" />
              <span className="text-xs text-gray-500">Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-xs font-bold text-[#D4AF37] hover:underline">Forgot Password?</Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#002F24] hover:bg-[#014D3A] text-white text-sm font-bold rounded-xl transition-all shadow-md cursor-pointer border-none flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
          </button>
        </form>

        <p className="mt-8 text-xs text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-[#002F24] hover:text-[#D4AF37] transition-colors">
            Register here
          </Link>
        </p>
      </div>
    </div>
  )
}
