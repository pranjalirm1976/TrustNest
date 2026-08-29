'use client'

import { useState } from 'react'
import { MessageSquare, ShieldCheck, Sparkles, MessageCircle } from 'lucide-react'
import ChatWithOwnerModal from './ChatWithOwnerModal'

interface TalkToOwnerCardProps {
  ownerName: string
  propertyId?: string
  propertyName?: string
}

export default function TalkToOwnerCard({ 
  ownerName,
  propertyId = '',
  propertyName = 'TrustNest PG'
}: TalkToOwnerCardProps) {
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <>
      <div className="bg-white border border-slate-205 rounded-2xl p-6 shadow-premium-sm flex flex-col gap-4">
        <div className="flex items-center gap-2 text-slate-800">
          <MessageSquare className="w-5 h-5 text-brand-primary" />
          <h3 className="text-sm font-extrabold uppercase tracking-wider">Talk to Owner</h3>
        </div>
        <p className="text-[11px] text-slate-500 font-medium">
          Get direct responses from the property owner safely inside TrustNest.
        </p>

        {/* Owner Profile small card */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-150 p-3 rounded-xl">
          <div className="w-9 h-9 bg-brand-primary rounded-full flex items-center justify-center text-white text-xs font-bold font-mono">
            {ownerName.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-extrabold text-slate-900 truncate">{ownerName}</p>
            <span className="text-[8px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded uppercase tracking-widest font-mono">
              Verified Partner
            </span>
          </div>
        </div>

        {/* Direct In-App Chat Trigger */}
        <button
          onClick={() => setIsChatOpen(true)}
          className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-xs py-3 rounded-xl shadow-premium flex items-center justify-center gap-2 cursor-pointer transition-all duration-200"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Chat with Owner</span>
        </button>

        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 justify-center">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>In-app chat • Privacy protected</span>
        </div>
      </div>

      {isChatOpen && propertyId && (
        <ChatWithOwnerModal
          propertyId={propertyId}
          propertyName={propertyName}
          ownerName={ownerName}
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </>
  )
}
