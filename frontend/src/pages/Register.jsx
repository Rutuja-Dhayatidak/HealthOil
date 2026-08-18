import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, UserPlus, CheckCircle, Loader2 } from 'lucide-react'
import { userService } from '../ApiServices/userService'

export default function Register() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const inputRefs = useRef([])

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleContinue = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      // API call to send OTP
      await userService.sendOtp({ email: formData.email })
      setStep(2)
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const otpCode = otp.join('')
      if (otpCode.length !== 6) {
        throw new Error("Please enter all 6 digits of the OTP")
      }
      
      const payload = { ...formData, otp: otpCode }
      const response = await userService.registerUser(payload)
      
      // Store token (if applicable)
      if (response.token) {
        localStorage.setItem('token', response.token)
        
        // Merge guest cart
        try {
          const guestCartStr = localStorage.getItem('guestCart');
          if (guestCartStr) {
            const guestItems = JSON.parse(guestCartStr);
            if (guestItems && guestItems.length > 0) {
              const { mergeCartAPI } = await import('../ApiServices/cartService');
              await mergeCartAPI(guestItems);
              localStorage.removeItem('guestCart'); // Clear guest cart after merge
            }
          }
        } catch (mergeErr) {
          console.error('Failed to merge cart', mergeErr);
        }
      }
      
      // Navigate to profile on success
      window.location.href = '/profile';
    } catch (err) {
      setError(err.message || 'Registration failed. Please check the OTP and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index, value) => {
    if (value && isNaN(value)) return
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value !== '' && index < 5) {
      inputRefs.current[index + 1].focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus()
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF4E8] text-[#15251F] font-sans flex flex-col items-center justify-center p-4">
      <button 
        onClick={() => {
          if (step === 2) setStep(1)
          else navigate('/')
        }}
        className="absolute top-6 left-6 inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#002F24] transition-colors cursor-pointer group bg-transparent border-none"
        disabled={loading}
      >
        <ArrowLeft className="w-4 h-4 text-[#D4AF37] group-hover:-translate-x-0.5 transition-transform" />
        {step === 2 ? 'Back to Details' : 'Back to Home'}
      </button>

      <div className="bg-white border border-[#D4AF37]/15 rounded-2xl p-8 shadow-lg max-w-md w-full text-center">
        <div className="w-16 h-16 bg-[#FAF6EC] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          {step === 1 ? <UserPlus className="w-8 h-8 text-[#D4AF37]" /> : <CheckCircle className="w-8 h-8 text-[#D4AF37]" />}
        </div>
        <h2 className="text-2xl font-serif font-bold text-[#002F24] mb-2">
          {step === 1 ? 'Create Account' : 'Verify OTP'}
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          {step === 1 
            ? 'Join HealthOil for premium organic oils delivered to you.' 
            : `Enter the 6-digit verification code sent to ${formData.email}.`}
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold p-3 rounded-xl mb-6 text-left">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form className="space-y-4 text-left" onSubmit={handleContinue}>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1.5 tracking-wider">Full Name</label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full bg-[#FAF6EC] border border-gray-200 outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-xl py-3 px-4 text-sm font-bold text-[#002F24] transition-all" 
                placeholder="e.g. Aarav Sharma" 
                required 
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1.5 tracking-wider">Email Address</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full bg-[#FAF6EC] border border-gray-200 outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-xl py-3 px-4 text-sm font-bold text-[#002F24] transition-all" 
                placeholder="e.g. aarav@example.com" 
                required 
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1.5 tracking-wider">Phone Number</label>
              <input 
                type="tel" 
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full bg-[#FAF6EC] border border-gray-200 outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-xl py-3 px-4 text-sm font-bold text-[#002F24] transition-all" 
                placeholder="e.g. +91 98765 43210" 
                required 
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1.5 tracking-wider">Password</label>
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full bg-[#FAF6EC] border border-gray-200 outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-xl py-3 px-4 text-sm font-bold text-[#002F24] transition-all" 
                placeholder="••••••••" 
                required 
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-4 bg-[#002F24] hover:bg-[#014D3A] text-white text-sm font-bold rounded-xl transition-all shadow-md cursor-pointer border-none flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue'}
            </button>
          </form>
        ) : (
          <form className="space-y-6" onSubmit={handleRegister}>
            <div className="flex justify-between gap-2 px-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  value={digit}
                  ref={(el) => (inputRefs.current[index] = el)}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 bg-[#FAF6EC] border border-gray-200 outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-xl text-center text-xl font-bold text-[#002F24] transition-all"
                  required
                />
              ))}
            </div>
            
            <p className="text-xs text-gray-500 mt-4">
              Didn't receive the code? <button type="button" onClick={handleContinue} className="text-[#D4AF37] font-bold hover:underline bg-transparent border-none cursor-pointer">Resend OTP</button>
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 bg-[#002F24] hover:bg-[#014D3A] text-white text-sm font-bold rounded-xl transition-all shadow-md cursor-pointer border-none flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Register'}
            </button>
          </form>
        )}

        {step === 1 && (
          <p className="mt-8 text-xs text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[#002F24] hover:text-[#D4AF37] transition-colors">
              Sign In here
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
