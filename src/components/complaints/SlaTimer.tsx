'use client'

import { useEffect, useState } from 'react'
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react'

interface SlaTimerProps {
  createdAt: Date | string
  slaDeadline: Date | string
  resolvedAt: Date | string | null
  status: string
}

export default function SlaTimer({
  createdAt,
  slaDeadline,
  resolvedAt,
  status,
}: SlaTimerProps) {
  const [timeLeft, setTimeLeft] = useState('')
  const [isBreached, setIsBreached] = useState(false)

  useEffect(() => {
    // If ticket is resolved, check if resolved date complied with SLA
    if (status === 'RESOLVED') {
      const isMet = resolvedAt ? new Date(resolvedAt) <= new Date(slaDeadline) : true
      setTimeLeft(isMet ? 'Resolved within SLA' : 'Resolved after SLA')
      setIsBreached(!isMet)
      return
    }

    if (status === 'REJECTED') {
      setTimeLeft('Ticket Closed')
      setIsBreached(false)
      return
    }

    // Live update function for active tickets
    const calculateTime = () => {
      const now = new Date().getTime()
      const deadline = new Date(slaDeadline).getTime()
      const difference = deadline - now

      if (difference <= 0) {
        setTimeLeft('SLA BREACHED')
        setIsBreached(true)
        return
      }

      const hours = Math.floor(difference / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      
      setTimeLeft(`${hours}h ${minutes}m left`)
      setIsBreached(false)
    }

    calculateTime()
    const timer = setInterval(calculateTime, 60000) // update every minute

    return () => clearInterval(timer)
  }, [slaDeadline, resolvedAt, status])

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      {status === 'RESOLVED' && !isBreached ? (
        <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg text-[10px] font-bold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>SLA Met</span>
        </div>
      ) : isBreached ? (
        <div className="flex items-center gap-1 text-brand-danger bg-brand-danger-light border border-brand-danger/25 px-2 py-1 rounded-xl text-[10px] font-extrabold uppercase tracking-wider animate-pulse">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{timeLeft}</span>
        </div>
      ) : (
        <div className="flex items-center gap-1 text-slate-700 bg-slate-50 border border-slate-205 px-2 py-1 rounded-xl text-[10px] font-bold font-mono">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{timeLeft}</span>
        </div>
      )}
    </div>
  )
}
