import React, { useState } from 'react'
import { 
  HelpCircle, 
  Search, 
  BookOpen, 
  Headphones, 
  Mail, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Send, 
  Shield, 
  Store, 
  Package, 
  ShoppingBag, 
  MapPin, 
  CreditCard,
  MessageSquare,
  Server
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function Support() {
  const [searchQuery, setSearchQuery] = useState('')
  const [openFaq, setOpenFaq] = useState(0)
  const [ticketForm, setTicketForm] = useState({ subject: '', category: 'General Inquiry', message: '' })
  const [submitting, setSubmitting] = useState(false)

  const faqs = [
    {
      question: 'How do I review and approve a pending Vendor application?',
      answer: 'Navigate to "Vendor Verification" from the sidebar menu. Click on any vendor row to open their full verification drawer, inspect uploaded documents (PAN, GST, FSSAI), and click "Approve Vendor" or "Reject Vendor" with a mandatory reason.'
    },
    {
      question: 'How does Product Listing Approval work?',
      answer: 'Vendors submit product listings from their Vendor Portal. They appear in "Product Approval" with status PENDING. Review product images, pricing, unit quantities, and description before approving or rejecting.'
    },
    {
      question: 'How do I add a new City or Area locality for delivery?',
      answer: 'Go to "Manage Cities" in the navigation. Click "+ Add New City" to define a city and state, then click "Manage Areas" on any city card to add specific sub-cities and pincodes where vendor deliveries are supported.'
    },
    {
      question: 'What happens when a customer requests a return or refund?',
      answer: 'Return requests appear under "Returns & Refunds". Review the customer reason and vendor comments. Approving the return initiates automated refund processing to the customer account.'
    },
    {
      question: 'Where can I configure admin credentials or system settings?',
      answer: 'Visit the "Settings" page to update Super Administrator profile information, notification preferences, security tokens, and backup configurations.'
    }
  ]

  const categories = [
    { title: 'Vendor Onboarding', icon: Store, color: 'text-amber-600 bg-amber-50', count: '5 Guides' },
    { title: 'Product Catalog', icon: Package, color: 'text-blue-600 bg-blue-50', count: '8 Guides' },
    { title: 'Orders & Shipping', icon: ShoppingBag, color: 'text-emerald-600 bg-emerald-50', count: '6 Guides' },
    { title: 'Cities & Localities', icon: MapPin, color: 'text-purple-600 bg-purple-50', count: '4 Guides' },
    { title: 'Payouts & Banking', icon: CreditCard, color: 'text-teal-600 bg-teal-50', count: '7 Guides' },
    { title: 'Security & Access', icon: Shield, color: 'text-rose-600 bg-rose-50', count: '3 Guides' },
  ]

  const handleTicketSubmit = (e) => {
    e.preventDefault()
    if (!ticketForm.subject.trim() || !ticketForm.message.trim()) {
      return toast.error('Please enter a subject and message.')
    }
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      toast.success('Support ticket submitted successfully! Reference ID: #TK-' + Math.floor(1000 + Math.random() * 9000))
      setTicketForm({ subject: '', category: 'General Inquiry', message: '' })
    }, 600)
  }

  const filteredFaqs = faqs.filter(f => 
    f.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-8 text-left max-w-6xl mx-auto pb-12">
      
      {/* Banner / Header */}
      <div className="bg-gradient-to-r from-[#0b3b84] to-[#1e50a2] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-6 -bottom-6 opacity-10 text-9xl">❓</div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-blue-100 mb-3 border border-white/15">
            <HelpCircle className="w-3.5 h-3.5 text-yellow-300" />
            <span>HealthOil Admin Help Desk</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">How can we help you today?</h1>
          <p className="text-blue-100 text-sm mb-6 leading-relaxed">
            Search our knowledge base for admin portal workflows, vendor guidelines, and system operations.
          </p>

          {/* Search Input */}
          <div className="relative bg-white rounded-2xl p-1.5 shadow-lg flex items-center gap-2 text-gray-800">
            <Search className="w-5 h-5 text-gray-400 ml-3 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search help topics (e.g. vendor verification, product approval, pincode setup)..."
              className="w-full bg-transparent border-none text-sm outline-none px-2 py-2 text-gray-800 placeholder-gray-400 font-medium"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-xs font-bold text-gray-400 hover:text-gray-600 px-3 py-1 bg-gray-100 rounded-xl"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Cards */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          Browse Documentation Topics
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, idx) => {
            const Icon = cat.icon
            return (
              <div 
                key={idx} 
                className="bg-white border border-gray-200/80 rounded-2xl p-5 hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer flex items-center gap-4 group"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${cat.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{cat.title}</h4>
                  <span className="text-xs text-gray-400 font-medium">{cat.count}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Main Grid: FAQ Accordion & Contact Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* FAQs Section (Left 2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            Frequently Asked Questions
          </h3>

          <div className="space-y-3">
            {filteredFaqs.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center text-gray-500">
                <p className="text-sm font-semibold">No help topics matched "{searchQuery}"</p>
                <p className="text-xs text-gray-400 mt-1">Try searching with different keywords or contact technical support.</p>
              </div>
            ) : (
              filteredFaqs.map((faq, idx) => (
                <div 
                  key={idx}
                  className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-sm text-gray-800 hover:bg-gray-50/80 cursor-pointer transition-colors"
                  >
                    <span>{faq.question}</span>
                    {openFaq === idx ? (
                      <ChevronUp className="w-4 h-4 text-blue-600 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                    )}
                  </button>

                  {openFaq === idx && (
                    <div className="px-5 pb-5 pt-1 text-xs text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/40">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Support Form & Contact Info */}
        <div className="space-y-6">
          
          {/* Quick Contact Box */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
              <Headphones className="w-4 h-4 text-blue-600" />
              Direct Support Contacts
            </h4>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Technical Desk</span>
                  <a href="mailto:admin-support@healthoil.com" className="font-bold text-gray-800 hover:text-blue-600">
                    admin-support@healthoil.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                <Server className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">System Health</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> All Services Operational
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Support Ticket Form */}
          <form onSubmit={handleTicketSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              Submit Admin Support Inquiry
            </h4>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Inquiry Category</label>
              <select
                value={ticketForm.category}
                onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500 font-medium text-gray-700"
              >
                <option>General Inquiry</option>
                <option>Vendor Verification Issue</option>
                <option>Product Approval Query</option>
                <option>Payment/Payout Discrepancy</option>
                <option>System Bug Report</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Subject</label>
              <input
                type="text"
                value={ticketForm.subject}
                onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                placeholder="Brief summary of issue"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500 font-medium text-gray-700"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Description</label>
              <textarea
                rows={3}
                value={ticketForm.message}
                onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                placeholder="Provide detailed description or error logs..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500 font-medium text-gray-700 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#0b3b84] hover:bg-blue-800 text-white font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {submitting ? 'Submitting...' : 'Send Inquiry'}
            </button>
          </form>

        </div>

      </div>
    </div>
  )
}
