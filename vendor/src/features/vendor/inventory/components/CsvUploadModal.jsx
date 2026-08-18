import React, { useState, useEffect } from 'react'
import { X, UploadCloud, Loader2, FileDown, AlertTriangle } from 'lucide-react'
import { useImportCsv, useCsvJobStatus } from '../../../../api/hooks/useCsvJob'
import toast from 'react-hot-toast'

export default function CsvUploadModal({ isOpen, onClose }) {
  const [file, setFile] = useState(null)
  const [jobId, setJobId] = useState(null)
  const importMutation = useImportCsv()
  
  // Start polling if we have a jobId
  const { data: jobStatus, isFetching: isPolling } = useCsvJobStatus(jobId)

  // Clear state when closed
  useEffect(() => {
    if (!isOpen) {
      setFile(null)
      setJobId(null)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleDrop = (e) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = () => {
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    
    importMutation.mutate(formData, {
      onSuccess: (data) => {
        // Assume data returns { jobId: '...' }
        setJobId(data.jobId || data._meta?.jobId || 'demo-job-id')
      },
      onError: (err) => {
        toast.error(err.message || 'Failed to upload CSV')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D4AF37]/20 bg-[#F8F2E7]/30 rounded-t-2xl">
          <h2 className="font-serif font-bold text-[#002F24] text-lg">Bulk Import Inventory</h2>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-gray-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {/* Default Upload State */}
          {!jobId && (
            <>
              <div className="mb-6 flex justify-between items-start text-xs text-gray-600 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <div>
                  <h4 className="font-bold text-blue-800 mb-1">Expected Columns</h4>
                  <ul className="list-disc pl-4 space-y-0.5 text-blue-700/80 font-mono text-[10px]">
                    <li>sku_code (required)</li>
                    <li>physical_stock (required, number)</li>
                    <li>low_stock_threshold (optional)</li>
                  </ul>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-blue-200 text-blue-700 rounded shadow-sm hover:bg-blue-50 font-bold">
                  <FileDown className="w-3.5 h-3.5" /> Sample CSV
                </button>
              </div>

              <div 
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  file ? 'border-[#002F24] bg-[#F8F2E7]/20' : 'border-gray-300 hover:border-[#D4AF37] hover:bg-[#F8F2E7]/10'
                }`}
                onDragOver={e => e.preventDefault()}
                onDrop={handleDrop}
              >
                {!file ? (
                  <>
                    <div className="w-12 h-12 rounded-full bg-[#F8F2E7]/50 flex items-center justify-center mx-auto mb-3">
                      <UploadCloud className="w-6 h-6 text-[#002F24]" />
                    </div>
                    <p className="text-sm font-bold text-gray-700 mb-1">Click or drag file to this area to upload</p>
                    <p className="text-xs text-gray-400 mb-4">Support for a single or bulk upload. Strictly CSV.</p>
                    <input type="file" accept=".csv" className="hidden" id="csv-upload" onChange={handleFileChange} />
                    <label htmlFor="csv-upload" className="px-4 py-2 bg-[#F8F2E7] border border-[#D4AF37]/30 text-[#002F24] rounded-lg text-xs font-bold cursor-pointer hover:bg-[#F8F2E7]/80">
                      Select CSV File
                    </label>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3 border border-green-100">
                      <FileDown className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="text-sm font-bold text-gray-800 mb-1">{file.name}</p>
                    <p className="text-xs text-gray-400 mb-4">{(file.size / 1024).toFixed(1)} KB</p>
                    <button onClick={() => setFile(null)} className="text-[10px] font-bold text-red-500 hover:underline">Remove file</button>
                  </>
                )}
              </div>
            </>
          )}

          {/* Processing / Polling State */}
          {jobId && jobStatus?.status !== 'COMPLETED' && jobStatus?.status !== 'FAILED' && (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-10 h-10 text-[#002F24] animate-spin mb-4" />
              <h3 className="font-bold text-gray-800 text-lg mb-2">Processing CSV</h3>
              <p className="text-xs text-gray-500">Please wait while we update your inventory...</p>
              
              <div className="w-full max-w-xs mt-6 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className="bg-[#D4AF37] h-full rounded-full animate-pulse w-full"></div>
              </div>
            </div>
          )}

          {/* Completed State */}
          {jobId && jobStatus?.status === 'COMPLETED' && (
            <div className="py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4 border border-green-200">
                <span className="text-3xl text-green-500 font-bold">✓</span>
              </div>
              <h3 className="font-bold text-gray-800 text-lg mb-2">Upload Completed</h3>
              
              <div className="flex justify-center gap-6 mt-6 mb-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-800">{jobStatus.totalRows || 0}</p>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Rows</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{jobStatus.successRows || 0}</p>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Updated</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-500">{jobStatus.failedRows || 0}</p>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Failed</p>
                </div>
              </div>

              {jobStatus.failedRows > 0 && jobStatus.errorReportUrl && (
                <div className="bg-red-50 p-4 rounded-xl flex items-start gap-3 text-left border border-red-100">
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                  <div>
                    <h4 className="font-bold text-red-800 text-sm mb-1">Some rows failed to import</h4>
                    <p className="text-xs text-red-600/80 mb-2">We skipped {jobStatus.failedRows} rows because they contained invalid data or SKUs were not found.</p>
                    <a href={jobStatus.errorReportUrl} className="text-xs font-bold text-red-600 underline">Download Error Report</a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
          {(!jobId || jobStatus?.status === 'COMPLETED' || jobStatus?.status === 'FAILED') && (
            <button 
              onClick={onClose} 
              className="px-4 py-2 border border-gray-200 hover:bg-white rounded-xl text-xs font-bold text-gray-600 transition-colors"
            >
              Close
            </button>
          )}
          {!jobId && (
            <button 
              onClick={handleUpload}
              disabled={!file || importMutation.isPending}
              className="px-4 py-2 bg-[#002F24] hover:bg-[#014D3A] text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {importMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Start Import'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
