import React from 'react'

interface SectionProps {
  title: string
  children: React.ReactNode
  className?: string
}

export const Section: React.FC<SectionProps> = ({ title, children, className = '' }) => {
  return (
    <section className={`py-8 ${className}`}>
      <h2 className="mb-6 text-2xl font-bold text-gray-900">{title}</h2>
      {children}
    </section>
  )
}
