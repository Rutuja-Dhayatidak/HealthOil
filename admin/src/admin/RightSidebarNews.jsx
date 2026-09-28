import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Search,
  GripVertical,
  ExternalLink,
  Edit2,
  Trash2,
  Eye,
  UploadCloud,
  X,
  Check,
  Megaphone,
  ShoppingBag,
  Sparkles,
  Calendar,
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  fetchNews,
  createNews,
  updateNews,
  toggleNewsStatus,
  reorderNews,
  deleteNews,
  fetchNewsResources
} from '../ApiServices/newsService';
import NewsModalPreview from './NewsModalPreview';

export default function RightSidebarNews() {
  // Data states
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [resources, setResources] = useState({ products: [], blogs: [], offers: [] });

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Form Modal state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    badgeText: '',
    linkType: 'Product',
    productId: '',
    blogId: '',
    customUrl: '',
    benefits: '',
    startDate: '',
    endDate: '',
    isActive: true
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Customer Preview Modal state
  const [previewNews, setPreviewNews] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // File input ref
  const fileInputRef = useRef(null);

  // Load resources once
  useEffect(() => {
    fetchNewsResources()
      .then((res) => {
        if (res.success) {
          setResources({
            products: res.products || [],
            blogs: res.blogs || [],
            offers: res.offers || []
          });
        }
      })
      .catch((err) => console.error('Failed to load news resources:', err));
  }, []);

  // Load news on search or status change
  const loadNews = async (page = 1) => {
    setLoading(true);
    try {
      const res = await fetchNews({
        page,
        limit: 10,
        search,
        status: statusFilter
      });
      if (res.success) {
        setNewsList(res.data || []);
        setPagination(res.pagination || { page: 1, limit: 10, total: res.data.length, totalPages: 1 });
      }
    } catch (err) {
      toast.error('Failed to load news items');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews(1);
  }, [search, statusFilter]);

  // Close form modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFormModalOpen) {
        setIsFormModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFormModalOpen]);

  // Handle Drag & Drop
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = async (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updatedList = [...newsList];
    const [movedItem] = updatedList.splice(draggedIndex, 1);
    updatedList.splice(targetIndex, 0, movedItem);

    // Optimistic UI update
    setNewsList(updatedList);
    setDraggedIndex(null);
    setDragOverIndex(null);

    try {
      const orderedIds = updatedList.map((item) => item._id);
      await reorderNews(orderedIds);
      toast.success('News order updated successfully');
    } catch (err) {
      toast.error('Failed to save new order');
      loadNews(pagination.page);
    }
  };

  // Status toggle
  const handleToggleStatus = async (item) => {
    const newStatus = !item.isActive;
    // Optimistic update
    setNewsList((prev) =>
      prev.map((n) => (n._id === item._id ? { ...n, isActive: newStatus } : n))
    );

    try {
      await toggleNewsStatus(item._id, newStatus);
      toast.success(`Status updated: ${newStatus ? 'Active' : 'Inactive'}`);
    } catch (err) {
      toast.error('Failed to update status');
      loadNews(pagination.page);
    }
  };

  // Open modal for Adding New
  const handleAddNew = () => {
    resetForm();
    setIsFormModalOpen(true);
  };

  // Populate form for Edit & open modal
  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      title: item.title || '',
      description: item.description || '',
      badgeText: item.badgeText || '',
      linkType: item.linkType || 'Product',
      productId: item.productId?._id || item.productId || '',
      blogId: item.blogId || '',
      customUrl: item.customUrl || '',
      benefits: item.benefits ? item.benefits.join('\n') : '',
      startDate: item.startDate ? item.startDate.split('T')[0] : '',
      endDate: item.endDate ? item.endDate.split('T')[0] : '',
      isActive: item.isActive ?? true
    });
    setImagePreview(item.image || '');
    setSelectedFile(null);
    setIsFormModalOpen(true);
  };

  // Reset form to clean state
  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      badgeText: '',
      linkType: 'Product',
      productId: '',
      blogId: '',
      customUrl: '',
      benefits: '',
      startDate: '',
      endDate: '',
      isActive: true
    });
    setSelectedFile(null);
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // File upload handler
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size exceeds 2 MB limit');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!editingId && !selectedFile && !imagePreview) {
      toast.error('Please upload an image banner');
      return;
    }

    setSubmitting(true);
    const formPayload = new FormData();
    formPayload.append('title', formData.title.trim());
    formPayload.append('description', formData.description.trim());
    formPayload.append('badgeText', formData.badgeText.trim());
    formPayload.append('linkType', formData.linkType);
    formPayload.append('productId', formData.productId);
    formPayload.append('blogId', formData.blogId);
    formPayload.append('customUrl', formData.customUrl);
    formPayload.append('isActive', formData.isActive);

    if (formData.startDate) formPayload.append('startDate', formData.startDate);
    if (formData.endDate) formPayload.append('endDate', formData.endDate);

    // Benefits array
    if (formData.benefits.trim()) {
      const benefitsArr = formData.benefits
        .split('\n')
        .map((b) => b.trim())
        .filter(Boolean);
      formPayload.append('benefits', JSON.stringify(benefitsArr));
    }

    if (selectedFile) {
      formPayload.append('image', selectedFile);
    } else if (imagePreview && !selectedFile) {
      formPayload.append('image', imagePreview);
    }

    try {
      if (editingId) {
        await updateNews(editingId, formPayload);
        toast.success('News item updated successfully');
      } else {
        await createNews(formPayload);
        toast.success('News banner created successfully');
      }
      resetForm();
      setIsFormModalOpen(false);
      loadNews(pagination.page);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save news banner';
      toast.error(msg);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete
  const handleDelete = async (id) => {
    try {
      await deleteNews(id);
      toast.success('News banner deleted successfully');
      setDeleteConfirmId(null);
      loadNews(pagination.page);
    } catch (err) {
      toast.error('Failed to delete news banner');
    }
  };

  // Filter active items for Live Preview
  const activeItemsForPreview = newsList.filter((item) => item.isActive);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-[#06231a] tracking-tight">
              Right Sidebar News
            </h1>
            <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-amber-400 text-amber-950 rounded-full shadow-xs">
              Live Widget
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Manage images/announcements that appear on the right side of the website (vertical widget).
          </p>
        </div>

        {/* Clicking this button opens the Add News Modal */}
        <button
          onClick={handleAddNew}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#064e3b] hover:bg-[#063f30] text-white text-sm font-semibold shadow-md shadow-emerald-900/10 transition-all active:scale-98 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New News</span>
        </button>
      </div>

      {/* Main Page Layout: Table on Left + Live Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Table Column (8-9 columns) */}
        <div className="lg:col-span-8 xl:col-span-9 bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5 flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">All News / Banners</h2>
              <p className="text-xs text-gray-500">
                Drag and drop to reorder. Only active items will be shown on the website.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-emerald-600 w-36 sm:w-48"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-1.5 px-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-emerald-600 bg-white text-gray-700"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto min-h-[300px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                <span className="text-xs">Loading news banners...</span>
              </div>
            ) : newsList.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm font-medium text-gray-600">No news banners found</p>
                <p className="text-xs text-gray-400 mt-1">Click "+ Add New News" to create one.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                    <th className="py-3 px-2 w-10 text-center">#</th>
                    <th className="py-3 px-2 w-14">Image</th>
                    <th className="py-3 px-3">Title</th>
                    <th className="py-3 px-2">Link</th>
                    <th className="py-3 px-2 text-xs">Start Date</th>
                    <th className="py-3 px-2 text-xs">End Date</th>
                    <th className="py-3 px-2 text-center">Status</th>
                    <th className="py-3 px-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {newsList.map((item, index) => {
                    const isDragging = draggedIndex === index;
                    const isOver = dragOverIndex === index;

                    return (
                      <tr
                        key={item._id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={(e) => handleDrop(e, index)}
                        className={`transition-all duration-150 hover:bg-emerald-50/30 ${
                          isDragging ? 'opacity-40 bg-emerald-100/50' : ''
                        } ${isOver ? 'border-t-2 border-emerald-500' : ''}`}
                      >
                        {/* Drag Handle & Order */}
                        <td className="py-3 px-2 text-center text-gray-400 font-mono text-xs">
                          <div className="flex items-center justify-center gap-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-emerald-700">
                            <GripVertical className="w-3.5 h-3.5" />
                            <span>{index + 1}</span>
                          </div>
                        </td>

                        {/* Thumbnail */}
                        <td className="py-3 px-2">
                          <div
                            onClick={() => {
                              setPreviewNews(item);
                              setIsModalOpen(true);
                            }}
                            className="w-12 h-12 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 shrink-0 cursor-pointer relative group shadow-2xs"
                            title="Click to preview popup"
                          >
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            {item.badgeText && (
                              <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[8px] text-white text-center font-bold truncate px-0.5">
                                {item.badgeText}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Title & Description */}
                        <td className="py-3 px-3 max-w-[200px]">
                          <div className="font-bold text-gray-900 truncate" title={item.title}>
                            {item.title}
                          </div>
                          {item.description ? (
                            <div className="text-[11px] text-gray-500 truncate" title={item.description}>
                              {item.description}
                            </div>
                          ) : (
                            <div className="text-[10px] text-gray-400 italic">No description</div>
                          )}
                        </td>

                        {/* Link Type Badge */}
                        <td className="py-3 px-2 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                            {item.linkType === 'Product'
                              ? 'Product Link'
                              : item.linkType === 'Offer'
                              ? 'Offer Page'
                              : item.linkType === 'Blog'
                              ? 'Blog Link'
                              : 'Process Page'}
                            <ExternalLink className="w-2.5 h-2.5 text-gray-400" />
                          </span>
                        </td>

                        {/* Dates */}
                        <td className="py-3 px-2 text-[11px] text-gray-600 whitespace-nowrap">
                          {item.startDate ? new Date(item.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Immediate'}
                        </td>
                        <td className="py-3 px-2 text-[11px] text-gray-600 whitespace-nowrap">
                          {item.endDate ? new Date(item.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No End Date'}
                        </td>

                        {/* Status Toggle Switch */}
                        <td className="py-3 px-2 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(item)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              item.isActive ? 'bg-emerald-600' : 'bg-gray-300'
                            }`}
                            title={item.isActive ? 'Active (click to deactivate)' : 'Inactive (click to activate)'}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                item.isActive ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </td>

                        {/* Actions: Edit, Delete, Preview */}
                        <td className="py-3 px-2 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setPreviewNews(item);
                                setIsModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                              title="Preview Modal"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                              title="Edit item"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(item._id)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                              title="Delete item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Table Footer / Pagination */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500">
            <span>
              Showing {newsList.length} of {pagination.total || newsList.length} items
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={pagination.page <= 1}
                onClick={() => loadNews(pagination.page - 1)}
                className="px-2.5 py-1 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <span className="px-2 font-bold text-gray-700">
                {pagination.page} / {pagination.totalPages || 1}
              </span>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => loadNews(pagination.page + 1)}
                className="px-2.5 py-1 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Live Preview Column (3-4 columns) */}
        <div className="lg:col-span-4 xl:col-span-3 bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5 flex flex-col items-center">
          <div className="w-full text-center border-b border-gray-100 pb-3 mb-4">
            <h3 className="text-base font-bold text-gray-900">Live Preview</h3>
            <p className="text-[11px] text-gray-500">
              How it will appear on website (right side)
            </p>
          </div>

          {/* Floating Pill Widget Simulation Container */}
          <div className="relative py-2 px-1 w-full flex justify-center">
            
            {/* The Vertical Pill Widget */}
            <div className="w-[80px] sm:w-[86px] rounded-[26px] bg-white/90 backdrop-blur-md border border-gray-200/90 shadow-xl p-2 flex flex-col items-center gap-2 transition-all">
              
              {/* Circular 'Latest News' Header Badge */}
              <div className="relative w-[50px] h-[50px] sm:w-[54px] sm:h-[54px] rounded-full bg-[#063024] text-white flex flex-col items-center justify-center shadow-md border border-emerald-400/30 group">
                <Megaphone className="w-3.5 h-3.5 text-emerald-300 animate-bounce" />
                <span className="text-[7.5px] sm:text-[8px] font-black uppercase tracking-tight text-emerald-100 leading-none mt-0.5">
                  Latest
                </span>
                <span className="text-[7.5px] sm:text-[8px] font-black uppercase tracking-tight text-white leading-none">
                  News
                </span>

                {/* Close 'x' icon simulation */}
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-white text-gray-600 shadow-md border border-gray-200 text-[9px] flex items-center justify-center font-bold">
                  ×
                </span>
              </div>

              {/* Stack of Active Thumbnails */}
              <div className="flex flex-col gap-2 w-full items-center">
                {(activeItemsForPreview.length > 0 ? activeItemsForPreview.slice(0, 5) : [
                  {
                    _id: 'mock1',
                    title: 'New Launch',
                    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200',
                    badgeText: 'New Launch'
                  }
                ]).map((item) => (
                  <div
                    key={item._id}
                    onClick={() => {
                      setPreviewNews(item);
                      setIsModalOpen(true);
                    }}
                    className="relative w-[50px] h-[50px] sm:w-[54px] sm:h-[54px] rounded-xl overflow-visible border border-emerald-100 shadow-sm cursor-pointer hover:scale-105 transition-transform group bg-gray-100"
                    title={`Click to preview: ${item.title}`}
                  >
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200'}
                      alt={item.title}
                      className="w-full h-full object-cover rounded-xl"
                    />

                    {/* Badge Pill tag overlay (similar to mockup) */}
                    <div className="absolute -right-1.5 -top-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold text-[7px] sm:text-[7.5px] px-1.5 py-0.5 rounded-full shadow-xs whitespace-nowrap uppercase tracking-wider border border-white">
                      {item.badgeText || (item.title ? item.title.slice(0, 8) : 'News')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom "Shop Now" Green Button */}
              <button
                type="button"
                onClick={() => alert('Shop Now clicked in preview!')}
                className="w-[50px] h-[50px] sm:w-[54px] sm:h-[54px] rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white flex flex-col items-center justify-center shadow-md hover:from-green-600 hover:to-emerald-700 transition-transform active:scale-95 cursor-pointer border border-white"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-white" />
                <span className="text-[7.5px] sm:text-[8px] font-black uppercase tracking-tight leading-none mt-0.5">
                  Shop
                </span>
                <span className="text-[7.5px] sm:text-[8px] font-black uppercase tracking-tight leading-none">
                  Now
                </span>
              </button>
            </div>
          </div>

          <p className="text-[10px] text-gray-400 text-center mt-3">
            Click on any preview item above to test the customer popup modal!
          </p>
        </div>

      </div>

      {/* ========================================================= */}
      {/* ADD / EDIT NEWS MODAL (Opens on "+ Add New News" or Edit) */}
      {/* ========================================================= */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          {/* Backdrop click to close */}
          <div className="fixed inset-0" onClick={() => setIsFormModalOpen(false)} />

          {/* Modal Container */}
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-emerald-100 flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-emerald-50/40 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#064e3b] text-white flex items-center justify-center">
                  <Megaphone className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    {editingId ? 'Edit News Banner' : 'Add New News Banner'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {editingId ? 'Update announcement details and destination' : 'Upload image & configure banner for website right widget'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsFormModalOpen(false)}
                className="w-9 h-9 rounded-full bg-white hover:bg-gray-100 border border-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer"
                title="Close (ESC)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Form Inputs (Left) + Interactive Live Preview (Right) */}
            <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Form Inputs (7 cols) */}
              <form id="news-modal-form" onSubmit={handleSubmit} className="md:col-span-7 space-y-3.5 text-xs">
                {/* Title */}
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter title (e.g. New Launch)"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-xs"
                    required
                  />
                </div>

                {/* Short Description */}
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Short Description</label>
                  <input
                    type="text"
                    placeholder="Enter short description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-xs"
                  />
                </div>

                {/* Badge / Chip Text */}
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Badge Pill Tag <span className="text-gray-400 font-normal">(e.g. 50% OFF, New Launch)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 50% OFF"
                    value={formData.badgeText}
                    onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-xs"
                  />
                </div>

                {/* Upload Image Drag & Drop Box */}
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Upload Image <span className="text-red-500">*</span>
                  </label>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    className="hidden"
                  />

                  {imagePreview ? (
                    <div className="relative rounded-xl border border-emerald-300 p-2.5 bg-emerald-50/40 flex items-center gap-3">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-14 h-14 object-cover rounded-xl border border-emerald-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-gray-800 truncate">
                          {selectedFile ? selectedFile.name : 'Current Image'}
                        </p>
                        <p className="text-[10px] text-emerald-700">Image loaded & ready</p>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-[10px] text-blue-600 hover:underline font-semibold mt-0.5"
                        >
                          Change image
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview('');
                          setSelectedFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="p-1 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-200 hover:border-emerald-500 rounded-xl p-4 text-center cursor-pointer transition-colors bg-gray-50/50 hover:bg-emerald-50/20"
                    >
                      <UploadCloud className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                      <p className="font-semibold text-gray-700 text-xs">Click to upload image</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">JPG, PNG, WebP (Max 2 MB)</p>
                    </div>
                  )}
                </div>

                {/* Link Type Radio Options */}
                <div>
                  <label className="block font-semibold text-gray-700 mb-1.5">Link Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Product', 'Offer', 'Blog', 'Custom URL'].map((type) => {
                      const isChecked = formData.linkType === type;
                      return (
                        <label
                          key={type}
                          className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                            isChecked
                              ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900 font-bold'
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name="linkType"
                            value={type}
                            checked={isChecked}
                            onChange={() => setFormData({ ...formData, linkType: type })}
                            className="text-emerald-600 focus:ring-emerald-500"
                          />
                          <span>{type === 'Offer' ? 'Offer Page' : type}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Dynamic Link Selector */}
                {formData.linkType === 'Product' && (
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Select Product</label>
                    <select
                      value={formData.productId}
                      onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-600 text-xs bg-white text-gray-700"
                    >
                      <option value="">Select product...</option>
                      {resources.products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} {p.price ? `(₹${p.price})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {formData.linkType === 'Offer' && (
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Select Offer / URL</label>
                    <select
                      value={formData.customUrl}
                      onChange={(e) => setFormData({ ...formData, customUrl: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-600 text-xs bg-white text-gray-700"
                    >
                      <option value="">Select promotional offer...</option>
                      {resources.offers.map((o) => (
                        <option key={o.id} value={`/offers/${o.id}`}>
                          {o.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {formData.linkType === 'Blog' && (
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Select Blog Article</label>
                    <select
                      value={formData.blogId}
                      onChange={(e) => setFormData({ ...formData, blogId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-600 text-xs bg-white text-gray-700"
                    >
                      <option value="">Select blog...</option>
                      {resources.blogs.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {formData.linkType === 'Custom URL' && (
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Custom Destination URL</label>
                    <input
                      type="text"
                      placeholder="https://... or /process"
                      value={formData.customUrl}
                      onChange={(e) => setFormData({ ...formData, customUrl: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-600 text-xs"
                    />
                  </div>
                )}

                {/* Key Benefits (for Click Popup Modal) */}
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Modal Product Benefits <span className="text-gray-400 font-normal">(1 per line)</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="100% Pure, Wood-Pressed Kolhu&#10;Zero chemical additives&#10;Rich in natural antioxidants"
                    value={formData.benefits}
                    onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-600 text-xs resize-none"
                  />
                </div>

                {/* Dates: Start & End */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-600 text-xs text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-600 text-xs text-gray-700"
                    />
                  </div>
                </div>

                {/* Active Toggle Switch */}
                <div className="flex items-center justify-between pt-1">
                  <span className="font-semibold text-gray-700">Active (Show on Website)</span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      formData.isActive ? 'bg-emerald-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                        formData.isActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </form>

              {/* Live Preview Side in Modal (5 cols) */}
              <div className="md:col-span-5 bg-emerald-50/30 rounded-2xl p-4 border border-emerald-100 flex flex-col items-center justify-center">
                <div className="text-center mb-3">
                  <h4 className="text-xs font-bold text-gray-800">Widget Live Preview</h4>
                  <p className="text-[10px] text-gray-500">Live preview of current item</p>
                </div>

                <div className="w-[80px] rounded-[26px] bg-white/95 backdrop-blur-md border border-gray-200 shadow-xl p-2 flex flex-col items-center gap-2">
                  <div className="w-[50px] h-[50px] rounded-full bg-[#063024] text-white flex flex-col items-center justify-center shadow-md border border-emerald-400/30">
                    <Megaphone className="w-3.5 h-3.5 text-emerald-300" />
                    <span className="text-[7.5px] font-black uppercase tracking-tight text-emerald-100 leading-none mt-0.5">
                      Latest
                    </span>
                    <span className="text-[7.5px] font-black uppercase tracking-tight text-white leading-none">
                      News
                    </span>
                  </div>

                  <div className="relative w-[50px] h-[50px] rounded-xl overflow-visible border-2 border-amber-400 shadow-md bg-gray-100">
                    <img
                      src={imagePreview || 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200'}
                      alt="Banner Preview"
                      className="w-full h-full object-cover rounded-xl"
                    />
                    <div className="absolute -right-1.5 -top-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold text-[7px] px-1.5 py-0.5 rounded-full shadow-xs whitespace-nowrap uppercase tracking-wider border border-white">
                      {formData.badgeText || (formData.title ? formData.title.slice(0, 8) : 'New')}
                    </div>
                  </div>

                  <div className="w-[50px] h-[50px] rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white flex flex-col items-center justify-center shadow-md">
                    <ShoppingBag className="w-3.5 h-3.5 text-white" />
                    <span className="text-[7.5px] font-black uppercase tracking-tight leading-none mt-0.5">
                      Shop
                    </span>
                    <span className="text-[7.5px] font-black uppercase tracking-tight leading-none">
                      Now
                    </span>
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <span className="text-xs font-bold text-gray-800 block truncate max-w-[180px]">
                    {formData.title || 'Banner Title'}
                  </span>
                  <span className="text-[11px] text-gray-500 block truncate max-w-[180px]">
                    {formData.description || 'Description will appear here'}
                  </span>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="news-modal-form"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-[#064e3b] hover:bg-[#063f30] text-white font-bold text-xs shadow-md shadow-emerald-900/10 transition-all active:scale-98 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{editingId ? 'Update News' : 'Save News'}</span>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-200">
            <h4 className="text-base font-bold text-gray-900 mb-2">Delete News Banner?</h4>
            <p className="text-xs text-gray-500 mb-5">
              Are you sure you want to delete this news item? It will be removed from the website widget immediately.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 cursor-pointer shadow-md shadow-red-600/20"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Popup Modal Preview */}
      <NewsModalPreview
        isOpen={isModalOpen}
        news={previewNews}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
