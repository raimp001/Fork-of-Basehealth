import React from 'react'

export function Badge({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${className}`}>
      {children}
    </span>
  )
}

export default Badge
