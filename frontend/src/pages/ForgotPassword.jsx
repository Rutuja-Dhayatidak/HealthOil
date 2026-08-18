import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, KeyRound, Mail, CheckCircle, Loader2 } from 'lucide-react'
import { userService } from '../ApiServices/userService'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const inputRefs = useRef([])
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSendOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await userService.sendForgotPasswordOtp({ email })
      setStep(2)
    } catch (err) {
      setError(err.message || 'Failed to send OTP. User might not exist.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = (e) => {
    e.preventDefault()
    // Move to step 3 to enter the new password
    // We will verify the OTP along with the new password in step 3
    setStep(3)
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    const otpCode = otp.join('')
    if (otpCode.length !== 6) {
      setError('Please enter the full 6-digit OTP')
      setLoading(false)
      return
    }

    try {
      await userService.resetPassword({
        email,
        otp: otpCode,
        newPassword
      })
      navigate('/login')
    } catch (err) {
      setError(err.message || 'Failed to reset password. Invalid OTP.')
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

  const getIcon = () => {
    if (step === 1) return <Mail className="w-8 h-8 text-[#D4AF37]" />
    if (step === 2) return <KeyRound className="w-8 h-8 text-[#D4AF37]" />
    return <CheckCircle className="w-8 h-8 text-[#D4AF37]" />
  }

  const getTitle = () => {
    if (step === 1) return 'Forgot Password'
    if (step === 2) return 'Verify OTP'
    return 'Create New Password'
  }

  const getSubtitle = () => {
    if (step === 1) return 'Enter your email address to receive a password reset code.'
    if (step === 2) return `Enter the 6-digit code sent to ${email || 'your email'}.`
    return 'Please enter and confirm your new password below.'
  }

  return (
    <div className="min-h-screen bg-[#FAF4E8] text-[#15251F] font-sans flex flex-col items-center justify-center p-4">
      <button 
        onClick={() => {
          if (step > 1) setStep(step - 1)
          else navigate('/login')
        }}
        disabled={loading}
        className="absolute top-6 left-6 inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#002F24] transition-colors cursor-pointer group bg-transparent border-none disabled:opacity-50"
      >
        <ArrowLeft className="w-4 h-4 text-[#D4AF37] group-hover:-translate-x-0.5 transition-transform" />
        {step > 1 ? 'Back' : 'Back to Login'}
      </button>

      <div className="bg-white border border-[#D4AF37]/15 rounded-2xl p-8 shadow-lg max-w-md w-full text-center">
        <div className="w-16 h-16 bg-[#FAF6EC] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          {getIcon()}
        </div>
        <h2 className="text-2xl font-serif font-bold text-[#002F24] mb-2">{getTitle()}</h2>
        <p className="text-sm text-gray-500 mb-6">{getSubtitle()}</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold p-3 rounded-xl mb-6 text-left">
            {error}
          </div>
        )}

        {step === 1 && (
          <form className="space-y-4 text-left" onSubmit={handleSendOtp}>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-4 bg-[#002F24] hover:bg-[#014D3A] text-white text-sm font-bold rounded-xl transition-all shadow-md cursor-pointer border-none flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form className="space-y-6" onSubmit={handleVerifyOtp}>
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
              Didn't receive the code? <button type="button" onClick={handleSendOtp} className="text-[#D4AF37] font-bold hover:underline bg-transparent border-none cursor-pointer">Resend OTP</button>
            </p>

            <button
              type="submit"
              className="w-full py-3.5 mt-2 bg-[#002F24] hover:bg-[#014D3A] text-white text-sm font-bold rounded-xl transition-all shadow-md cursor-pointer border-none"
            >
              Verify OTP
            </button>
          </form>
        )}

        {step === 3 && (
          <form className="space-y-4 text-left" onSubmit={handleResetPassword}>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1.5 tracking-wider">New Password</label>
              <input 
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#FAF6EC] border border-gray-200 outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-xl py-3 px-4 text-sm font-bold text-[#002F24] transition-all" 
                placeholder="••••••••" 
                required 
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1.5 tracking-wider">Confirm New Password</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save New Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
