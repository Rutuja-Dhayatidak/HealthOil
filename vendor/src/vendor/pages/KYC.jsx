import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ShieldAlert, Hourglass, CheckCircle2, ArrowRight } from 'lucide-react'

export default function KYC() {
  const navigate = useNavigate()
  const location = useLocation()
  const initialStatus = location.state?.status || 'Under Verification'
  const [status, setStatus] = useState(initialStatus)

  const steps = [
    { name: 'Document Dispatch', date: '05 Aug 2026', done: true },
    { name: 'FSSAI Licence Audit', date: 'Processing', done: false },
    { name: 'Bank Payout Verification', date: 'Pending', done: false },
    { name: 'Admin Activation', date: 'Pending', done: false },
  ]

  return (
    <div className="min-h-screen bg-[#F8F2E7] flex flex-col justify-center items-center p-6 text-[#15251F]">
      <div className="max-w-md w-full bg-white border border-[#D4AF37]/25 rounded-3xl p-8 shadow-xl text-left">
        
        <h2 className="text-lg font-serif font-bold text-[#002F24] mb-2">KYC verification</h2>
        <p className="text-xs text-gray-500 mb-6">Track your vendor credentials audit status.</p>

        {/* Current status banner */}
        <div className="flex items-center gap-3 bg-[#FAF4E8] border border-[#D4AF37]/20 p-4 rounded-2xl mb-6">
          {status === 'Under Verification' && (
            <>
              <Hourglass className="w-6 h-6 text-amber-500 animate-spin shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-amber-600 uppercase">Under Verification</h4>
                <p className="text-[10px] text-gray-500 mt-0.5">Admin is auditing your FSSAI and business licences.</p>
              </div>
            </>
          )}

          {status === 'Approved' && (
            <>
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-emerald-600 uppercase">KYC Approved</h4>
                <p className="text-[10px] text-gray-500 mt-0.5">Your store has been approved for dispatching orders.</p>
              </div>
            </>
          )}

          {status === 'Rejected' && (
            <>
              <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-rose-600 uppercase">KYC Rejected</h4>
                <p className="text-[10px] text-gray-500 mt-0.5">Documents verification failed. Please check details.</p>
              </div>
            </>
          )}
        </div>

        {/* Verification audit list */}
        <div className="space-y-4 mb-8">
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Verification Steps</h4>
          {steps.map((step, idx) => (
            <div key={idx} className="flex justify-between items-center bg-[#F8F2E7]/25 border border-gray-150/40 p-3.5 rounded-xl text-xs">
              <span className="font-bold text-gray-700">{step.name}</span>
              <span className={`text-[10px] font-bold ${step.done ? 'text-emerald-600' : 'text-amber-500'}`}>
                {step.date}
              </span>
            </div>
          ))}
        </div>

        {/* Demo control triggers */}
        <div className="flex gap-2 mb-6 border-t border-gray-100 pt-4">
          <button 
            onClick={() => setStatus('Approved')}
            className="flex-1 py-2 border border-emerald-500/20 text-emerald-600 bg-emerald-50/20 hover:bg-emerald-50 text-[10px] font-bold rounded-xl cursor-pointer"
          >
            Simulate Approve
          </button>
          <button 
            onClick={() => setStatus('Rejected')}
            className="flex-1 py-2 border border-rose-500/20 text-rose-600 bg-rose-50/20 hover:bg-rose-50 text-[10px] font-bold rounded-xl cursor-pointer"
          >
            Simulate Reject
          </button>
        </div>

        {status === 'Approved' ? (
          <button 
            onClick={() => navigate('/vendor/dashboard')}
            className="w-full py-3 bg-[#002F24] hover:bg-[#014D3A] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-[#002F24]/10"
          >
            Go to Shop Dashboard
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button 
            onClick={() => navigate('/vendor/login')}
            className="w-full py-3 border border-[#002F24] text-[#002F24] rounded-xl text-xs font-bold hover:bg-[#F8F2E7]/50 cursor-pointer text-center"
          >
            Return to Login
          </button>
        )}

      </div>
    </div>
  )
}
