import { useState, useEffect } from 'react'
import { Search, Mail, Smartphone, Globe, Users as UsersIcon, Loader2, Trash2, Ban, CheckCircle } from 'lucide-react'
import { getAllUsers, deleteUserApi, toggleUserStatusApi } from '../ApiServices/adminService'

function Users() {
  const [userTypeTab, setUserTypeTab] = useState('mobile')
  const [mobileUsers, setMobileUsers] = useState([])
  const [websiteUsers, setWebsiteUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllUsers()
        if (data.success) {
          setMobileUsers(data.mobileUsers)
          setWebsiteUsers(data.websiteUsers)
        }
      } catch (error) {
        console.error("Error fetching users:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  const currentUsers = userTypeTab === 'mobile' ? mobileUsers : websiteUsers
  const totalCustomers = mobileUsers.length + websiteUsers.length

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await deleteUserApi(id, userTypeTab)
        if (response.success) {
          if (userTypeTab === 'mobile') {
            setMobileUsers(prev => prev.filter(u => u.id !== id))
          } else {
            setWebsiteUsers(prev => prev.filter(u => u.id !== id))
          }
        }
      } catch (error) {
        alert("Error deleting user")
      }
    }
  }

  const handleToggleSuspend = async (id) => {
    try {
      const response = await toggleUserStatusApi(id, userTypeTab)
      if (response.success) {
        const updateUsers = (users) => users.map(u => u.id === id ? { ...u, status: response.status } : u)
        if (userTypeTab === 'mobile') {
          setMobileUsers(prev => updateUsers(prev))
        } else {
          setWebsiteUsers(prev => updateUsers(prev))
        }
      }
    } catch (error) {
      alert("Error updating user status")
    }
  }

  return (
    <div className="space-y-8 text-left">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#b89547]/15 pb-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#031d13] tracking-tight">Customer Database</h2>
          <p className="text-xs text-gray-500 mt-1">Review active customers, order volumes, and individual shopping histories.</p>
        </div>
        <div className="bg-white border border-[#b89547]/30 px-4 py-2 rounded-xl flex items-center gap-3 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-[#FAF4E8] flex items-center justify-center text-[#D4AF37]">
            <UsersIcon className="w-4 h-4 text-[#b89547]" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Customers</p>
            <p className="text-lg font-bold text-[#031d13] leading-none mt-0.5">{totalCustomers}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#b89547]/20 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 border-b border-gray-100 pb-6">
          
          {/* Tabs */}
          <div className="flex items-center gap-2 bg-[#FAF4E8]/50 p-1 rounded-xl w-full md:w-auto">
            <button
              onClick={() => setUserTypeTab('mobile')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer border-none ${
                userTypeTab === 'mobile' 
                  ? 'bg-white text-[#031d13] shadow-sm ring-1 ring-gray-200/50' 
                  : 'bg-transparent text-gray-500 hover:text-[#031d13]'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              Mobile Users
              <span className="ml-1 bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full text-[9px]">{mobileUsers.length}</span>
            </button>
            <button
              onClick={() => setUserTypeTab('website')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer border-none ${
                userTypeTab === 'website' 
                  ? 'bg-white text-[#031d13] shadow-sm ring-1 ring-gray-200/50' 
                  : 'bg-transparent text-gray-500 hover:text-[#031d13]'
              }`}
            >
              <Globe className="w-4 h-4" />
              Website Users
              <span className="ml-1 bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full text-[9px]">{websiteUsers.length}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 bg-white border border-[#b89547]/25 rounded-xl px-3 py-2 w-full md:w-72 shadow-sm focus-within:border-[#031d13] transition-colors">
            <Search className="w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder={`Search ${userTypeTab} customers...`} 
              className="bg-transparent text-xs outline-none w-full text-[#031d13] placeholder-gray-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#b89547]/20 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-3 pl-2">Customer Name</th>
                <th className="pb-3">Contact Details</th>
                <th className="pb-3">Join Date</th>
                <th className="pb-3 text-center">Total Orders</th>
                <th className="pb-3">Total Spent</th>
                <th className="pb-3 text-right pr-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center">
                    <Loader2 className="w-6 h-6 text-[#D4AF37] animate-spin mx-auto" />
                  </td>
                </tr>
              ) : currentUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-400">
                    No {userTypeTab} customers found.
                  </td>
                </tr>
              ) : (
                currentUsers.map((user, idx) => (
                  <tr key={idx} className={`text-gray-600 transition-colors duration-150 ${user.status === 'suspended' ? 'bg-red-50/50 opacity-60' : 'hover:bg-[#FAF4E8]/30'}`}>
                    <td className="py-4 pl-2 font-bold text-[#031d13] flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#FAF4E8] border border-[#b89547]/30 flex items-center justify-center text-[#031d13] font-bold text-sm shrink-0 shadow-sm">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        {user.name}
                        {user.status === 'suspended' && (
                          <span className="ml-2 bg-red-100 text-red-600 text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase">Suspended</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="text-[#031d13] font-semibold">{user.phone}</div>
                      <div className="text-[10px] text-gray-500">{user.email}</div>
                    </td>
                    <td className="py-4 text-gray-500 font-medium">{user.date}</td>
                    <td className="py-4 text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-50 font-bold text-[#031d13] border border-gray-100">
                        {user.orders}
                      </span>
                    </td>
                    <td className="py-4 font-semibold text-[#b89547]">{user.spent}</td>
                    <td className="py-4 text-right pr-2">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleToggleSuspend(user.id)}
                          title={user.status === 'suspended' ? "Activate User" : "Suspend User"}
                          className={`p-2 bg-white border rounded-xl transition-all duration-200 cursor-pointer shadow-sm ${
                            user.status === 'suspended' 
                              ? 'border-green-200 text-green-500 hover:bg-green-50' 
                              : 'border-orange-200 text-orange-500 hover:bg-orange-50'
                          }`}
                        >
                          {user.status === 'suspended' ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                        </button>
                        
                        <button 
                          onClick={() => handleDelete(user.id)}
                          title="Delete User"
                          className="p-2 bg-white border border-red-200 rounded-xl text-red-500 hover:bg-red-50 transition-all duration-200 cursor-pointer shadow-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Users
