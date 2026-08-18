import React from 'react'

export function Table({ children, className = '' }) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full text-left border-collapse ${className}`}>
        {children}
      </table>
    </div>
  )
}

export function Pill({ children, colorClass = 'bg-gray-100 text-gray-700 border-gray-200' }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${colorClass}`}>
      {children}
    </span>
  )
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
      <h3 className="text-sm font-bold text-gray-800 mb-1">{title}</h3>
      <p className="text-xs text-gray-500 mb-4">{description}</p>
      {action}
    </div>
  )
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50 rounded-xl">
      <h3 className="text-sm font-bold text-red-800 mb-2">Something went wrong</h3>
      <p className="text-xs text-red-600 mb-4">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700">
          Retry
        </button>
      )}
    </div>
  )
}

export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
}
