'use client'

import { Phone, MessageSquare, ShieldCheck, Mail } from 'lucide-react'

interface TalkToOwnerCardProps {
  ownerName: string
}

export default function TalkToOwnerCard({ ownerName }: TalkToOwnerCardProps) {
  return (
    <div className="bg-white border border-slate-205 rounded-2xl p-6 shadow-premium-sm flex flex-col gap-4">
      <div className="flex items-center gap-2 text-slate-800">
        <MessageSquare className="w-5 h-5 text-brand-primary" />
        <h3 className="text-sm font-extrabold uppercase tracking-wider">Talk to Owner</h3>
      </div>
      <p className="text-[11px] text-slate-500 font-medium">
        Get faster response directly from the property owner.
      </p>

      {/* Owner Profile small card */}
      <div className="flex items-center gap-3 bg-slate-50 border border-slate-150 p-3 rounded-xl">
        <div className="w-9 h-9 bg-brand-primary rounded-full flex items-center justify-center text-white text-xs font-bold font-mono">
          {ownerName.substring(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-extrabold text-slate-900 truncate">{ownerName}</p>
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest font-mono">
            PG Owner
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={() => alert('Initiating call to property owner...')}
          className="w-full border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs py-2.5 rounded-xl shadow-premium-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <Phone className="w-3.5 h-3.5 text-slate-400" />
          <span>Call</span>
        </button>
        <button
          onClick={() => alert('Opening WhatsApp chat...')}
          className="w-full border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs py-2.5 rounded-xl shadow-premium-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <Mail className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600/10" />
          <span>WhatsApp</span>
        </button>
        <button
          onClick={() => alert('Opening inbox chat thread...')}
          className="w-full border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs py-2.5 rounded-xl shadow-premium-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
          <span>Message</span>
        </button>
      </div>
    </div>
  )
}
