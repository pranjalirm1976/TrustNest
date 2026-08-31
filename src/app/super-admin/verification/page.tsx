'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { verifyIdentityDocument } from '@/actions/identity.actions'
import { prisma } from '@/lib/prisma'

interface IdentityDoc {
  id: string
  userId: string
  user: {
    name: string
    email: string
  }
  documentType: string
  documentUrl: string
  status: string
  createdAt: string
}

export default function VerificationPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [documents, setDocuments] = useState<IdentityDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDoc, setSelectedDoc] = useState<IdentityDoc | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  // Check if user is admin
  useEffect(() => {
    if (session && session.user.role !== 'SUPER_ADMIN') {
      router.push('/unauthorized')
    }
  }, [session, router])

  // Load pending documents
  useEffect(() => {
    if (session?.user.role === 'SUPER_ADMIN') {
      loadDocuments()
    }
  }, [session])

  const loadDocuments = async () => {
    try {
      // Note: In a real app, you'd fetch from an API endpoint
      // For now, this is a placeholder showing the UI structure
      setDocuments([])
      setLoading(false)
    } catch (err) {
      setError('Failed to load documents')
      setLoading(false)
    }
  }

  const handleApprove = async (doc: IdentityDoc) => {
    setProcessing(true)
    const result = await verifyIdentityDocument(doc.userId, true)
    
    if (result.success) {
      setDocuments(documents.filter(d => d.id !== doc.id))
      setSelectedDoc(null)
    } else {
      setError(result.message)
    }
    setProcessing(false)
  }

  const handleReject = async (doc: IdentityDoc) => {
    if (!rejectionReason.trim()) {
      setError('Please provide a rejection reason')
      return
    }

    setProcessing(true)
    const result = await verifyIdentityDocument(doc.userId, false, rejectionReason)
    
    if (result.success) {
      setDocuments(documents.filter(d => d.id !== doc.id))
      setSelectedDoc(null)
      setRejectionReason('')
    } else {
      setError(result.message)
    }
    setProcessing(false)
  }

  if (session?.user.role !== 'SUPER_ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Identity Verification</h1>
          <p className="text-gray-600 mt-2">Review and verify user identity documents</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Documents List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              {loading ? (
                <div className="p-8 text-center text-gray-500">Loading...</div>
              ) : documents.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p className="text-lg font-medium mb-2">No pending documents</p>
                  <p>All identity documents have been verified.</p>
                </div>
              ) : (
                <div className="divide-y">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoc(doc)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition ${
                        selectedDoc?.id === doc.id ? 'bg-indigo-50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{doc.user.name}</h3>
                          <p className="text-sm text-gray-600">{doc.user.email}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            Document: {doc.documentType}
                          </p>
                        </div>
                        <span className="text-xs font-medium px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                          Pending
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Document Preview & Actions */}
          {selectedDoc && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow sticky top-8">
                <div className="p-6 space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900">Review Document</h2>

                  {/* Document Preview */}
                  <div className="bg-gray-100 rounded-lg p-4 min-h-64">
                    {selectedDoc.documentUrl.endsWith('.pdf') ? (
                      <div className="flex items-center justify-center h-64 bg-gray-200 rounded">
                        <a
                          href={selectedDoc.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-700 font-semibold underline"
                        >
                          View PDF
                        </a>
                      </div>
                    ) : (
                      <img
                        src={selectedDoc.documentUrl}
                        alt="Document"
                        className="w-full h-auto rounded"
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">User:</span>
                      <span className="text-gray-600 ml-2">{selectedDoc.user.name}</span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Email:</span>
                      <span className="text-gray-600 ml-2">{selectedDoc.user.email}</span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Document Type:</span>
                      <span className="text-gray-600 ml-2">{selectedDoc.documentType}</span>
                    </p>
                  </div>

                  {/* Rejection Reason (if approving) */}
                  {/* Approval & Rejection Buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={() => handleApprove(selectedDoc)}
                      disabled={processing}
                      className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 transition"
                    >
                      ✓ Approve
                    </button>
                    
                    <div>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Rejection reason (visible to user)..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        rows={3}
                        disabled={processing}
                      />
                    </div>

                    <button
                      onClick={() => handleReject(selectedDoc)}
                      disabled={processing || !rejectionReason.trim()}
                      className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-400 transition"
                    >
                      ✗ Reject
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 text-center">
                    {processing ? 'Processing...' : 'Select action above'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
