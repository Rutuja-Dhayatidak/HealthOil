import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, ArrowLeft } from 'lucide-react'
import { forgotPassword } from '../../ApiServices/vendorAuthService'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await forgotPassword(email)
      setSuccess(true)
    } catch (error) {
      toast.error(error.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F2E7] flex flex-col justify-center items-center p-6 text-[#15251F]">
      <div className="max-w-md w-full bg-white border border-[#D4AF37]/25 rounded-3xl p-8 shadow-xl text-left">
        
        <Link to="/vendor/login" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#002F24] font-bold mb-6">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Login
        </Link>

        <h2 className="text-lg font-serif font-bold text-[#002F24] mb-3">Reset Password</h2>
        <p className="text-xs text-gray-500 mb-6 leading-relaxed">
          Provide your registered vendor email below, and we will send instructions to configure a new credentials key.
        </p>

        {success ? (
          <div className="bg-emerald-50 border border-[#16A34A]/25 text-[#16A34A] text-xs rounded-xl p-4 text-center font-semibold">
            Password reset link has been dispatched to {email}. Please check your inbox.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Registered Email</label>
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

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#002F24] text-[#F8F2E7] hover:bg-[#014D3A] rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center cursor-pointer shadow-md shadow-[#002F24]/10 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Send Recovery Dispatch'}
            </button>
          </form>
        )}

      </div>
    </div>
  )
}
