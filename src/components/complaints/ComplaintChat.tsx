'use client'

import { useState } from 'react'
import { addComplaintComment } from '@/actions/complaint.actions'
import { MessageSquare, Send, Loader2, User } from 'lucide-react'

type CommentUser = {
  name: string
  role: string
}

type Comment = {
  id: string
  comment: string
  createdAt: Date
  author: CommentUser
}

type Complaint = {
  id: string
  title: string
  description: string
  status: string
  category: string
  severity: string
  createdAt: Date
  comments: Comment[]
}

interface ComplaintChatProps {
  complaint: Complaint
  onCommentAdded: () => void
}

export default function ComplaintChat({
  complaint,
  onCommentAdded,
}: ComplaintChatProps) {
  const [text, setText] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return

    setIsLoading(true)
    try {
      await addComplaintComment(complaint.id, text.trim())
      setText('')
      onCommentAdded()
    } catch (err) {
      console.error(err)
      alert('Failed to send comment. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-premium-sm flex flex-col gap-6 h-full max-h-[500px]">
      
      {/* Header Info */}
      <div className="flex flex-col gap-1.5 pb-3 border-b border-slate-100">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">
          Ticket #{complaint.id.slice(-6).toUpperCase()}
        </span>
        <h3 className="text-base font-extrabold text-slate-900 leading-tight">{complaint.title}</h3>
        <p className="text-xs text-slate-500 font-semibold mt-1">
          Description: <span className="font-normal text-slate-650 italic">"{complaint.description}"</span>
        </p>
      </div>

      {/* Comment Thread Timeline (Professional Activity Log style) */}
      <div className="flex-1 overflow-y-auto scrollbar-thin pr-1 flex flex-col gap-4 min-h-[180px]">
        {complaint.comments.length === 0 ? (
          <div className="text-center py-6 text-slate-400 italic text-xs flex flex-col items-center justify-center gap-1.5 mt-auto mb-auto">
            <MessageSquare className="w-8 h-8 text-slate-300" />
            <span>No messages in discussion thread yet.</span>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {complaint.comments.map((comment) => (
              <div 
                key={comment.id}
                className="bg-slate-50 border border-slate-200/60 p-3.5 rounded-xl flex items-start gap-3.5"
              >
                <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-white shrink-0 text-xs">
                  {comment.author.role === 'OWNER' ? 'OP' : 'RE'}
                </div>
                
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-900">
                      {comment.author.name} 
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono ml-1.5">
                        ({comment.author.role})
                      </span>
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 font-mono">
                      {new Date(comment.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {comment.comment}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input box */}
      {complaint.status !== 'RESOLVED' && complaint.status !== 'REJECTED' && (
        <form onSubmit={handleSubmit} className="flex gap-2 pt-3 border-t border-slate-100 mt-auto">
          <input
            type="text"
            placeholder="Type comment message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isLoading}
            required
            className="flex-1 bg-[#fbfbfb] border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-primary/50 focus:ring-2 focus:ring-indigo-50 transition-all font-semibold"
          />
          <button
            type="submit"
            disabled={isLoading || !text.trim()}
            className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white p-3 rounded-xl shadow-premium-sm transition-all cursor-pointer flex items-center justify-center shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      )}

    </div>
  )
}
