'use client'

import { useState, useEffect } from 'react'

export default function DetailTabs() {
  const [activeSection, setActiveSection] = useState('overview')

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'rooms', name: 'Rooms & Layout' },
    { id: 'food', name: 'Daily Food' },
    { id: 'performance', name: 'SLA Performance' },
    { id: 'reviews', name: 'Reviews' },
    { id: 'nearby', name: 'Nearby Services' },
  ]

  // Smooth scroll handler
  const handleScroll = (id: string) => {
    setActiveSection(id)
    const element = document.getElementById(id)
    if (element) {
      const offset = 90 // sticky navbar + tabs header height offset
      const bodyRect = document.body.getBoundingClientRect().top
      const elementRect = element.getBoundingClientRect().top
      const elementPosition = elementRect - bodyRect
      const offsetPosition = elementPosition - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
    }
  }

  // Update active tab on scroll
  useEffect(() => {
    const handleScrollUpdate = () => {
      const scrollPos = window.scrollY + 120

      for (const tab of tabs) {
        const element = document.getElementById(tab.id)
        if (element) {
          const top = element.offsetTop
          const height = element.offsetHeight
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(tab.id)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScrollUpdate)
    return () => window.removeEventListener('scroll', handleScrollUpdate)
  }, [])

  return (
    <div className="sticky top-16 z-30 bg-white/95 backdrop-blur border-b border-slate-200/80 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 shadow-sm">
      <div className="max-w-7xl mx-auto flex space-x-6 overflow-x-auto py-4 scrollbar-thin">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleScroll(tab.id)}
            className={`text-sm font-bold tracking-tight pb-1 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSection === tab.id
                ? 'border-brand-primary text-brand-primary font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>
    </div>
  )
}
