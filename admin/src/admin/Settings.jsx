import { Settings as SettingsIcon, Save, Lock, Bell, Shield } from 'lucide-react'

function Settings() {
  return (
    <div className="space-y-8 text-left">
      <div>
        <h2 className="text-xl font-serif font-bold text-[#031d13] tracking-tight">Portal Settings</h2>
        <p className="text-xs text-gray-500 mt-1">Configure service parameters, commissions, notifications, and security protocols.</p>
      </div>

      <div className="bg-white border border-[#b89547]/20 rounded-2xl p-6 max-w-2xl text-left shadow-sm">
        <h3 className="font-serif font-bold text-[#031d13] text-base mb-6 border-b border-[#b89547]/15 pb-3">Marketplace Configuration</h3>
        
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Delivery Radius Limit (KM)</label>
            <input 
              type="number" 
              defaultValue={15}
              className="w-full bg-white border border-[#b89547]/25 rounded-xl px-4 py-2.5 text-xs outline-none text-[#031d13] focus:border-[#031d13]/50 transition-colors shadow-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Platform Service Fee (%)</label>
            <input 
              type="number" 
              defaultValue={8}
              className="w-full bg-white border border-[#b89547]/25 rounded-xl px-4 py-2.5 text-xs outline-none text-[#031d13] focus:border-[#031d13]/50 transition-colors shadow-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Support Helpline Number</label>
            <input 
              type="text" 
              defaultValue="+91 12345 67890"
              className="w-full bg-white border border-[#b89547]/25 rounded-xl px-4 py-2.5 text-xs outline-none text-[#031d13] focus:border-[#031d13]/50 transition-colors shadow-sm"
            />
          </div>

          <div className="pt-4 flex gap-4">
            <button className="bg-[#031d13] hover:bg-[#b89547] text-[#FAF4E8] hover:text-[#031d13] font-bold text-xs px-5 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-sm">
              <Save className="w-4 h-4" />
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
