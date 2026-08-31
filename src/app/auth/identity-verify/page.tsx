'use client'

import { useState, useEffect } from 'react'
import { uploadIdentityDocument, getIdentityVerificationStatus } from '@/actions/identity.actions'
import { useSession } from 'next-auth/react'

type DocumentStatus = 'NOT_STARTED' | 'PENDING' | 'VERIFIED' | 'REJECTED'
type DocumentType = 'AADHAR' | 'PAN' | 'PASSPORT' | 'DRIVING_LICENSE'

export default function IdentityVerifyPage() {
  const { data: session } = useSession()
  const [documentType, setDocumentType] = useState<DocumentType>('AADHAR')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [status, setStatus] = useState<DocumentStatus>('NOT_STARTED')
  const [rejectionReason, setRejectionReason] = useState('')

  // Load verification status on mount
  useEffect(() => {
    const loadStatus = async () => {
      const result = await getIdentityVerificationStatus()
      setStatus(result.status)
      if (result.rejectionReason) {
        setRejectionReason(result.rejectionReason)
      }
    }
    if (session?.user?.id) {
      loadStatus()
    }
  }, [session?.user?.id])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Only JPEG, PNG, and PDF files are allowed')
        return
      }

      // Validate file size (5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB')
        return
      }

      setFile(selectedFile)
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file) {
      setError('Please select a file')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('documentType', documentType)

      const result = await uploadIdentityDocument(formData)

      if (result.success) {
        setSuccess(result.message)
        setFile(null)
        setStatus('PENDING')
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
        if (fileInput) fileInput.value = ''
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('Failed to upload document')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Identity Verification</h1>
            <p className="text-gray-600">Upload a government-issued ID to complete your verification</p>
          </div>

          {/* Status Display */}
          {status === 'VERIFIED' && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start">
                <div className="text-2xl mr-3">✅</div>
                <div>
                  <p className="font-semibold text-green-900">Identity Verified</p>
                  <p className="text-sm text-green-700 mt-1">Your identity has been verified successfully.</p>
                </div>
              </div>
            </div>
          )}

          {status === 'PENDING' && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <div className="text-2xl mr-3">⏳</div>
                <div>
                  <p className="font-semibold text-yellow-900">Verification Pending</p>
                  <p className="text-sm text-yellow-700 mt-1">Your document is under review. This usually takes 24-48 hours.</p>
                </div>
              </div>
            </div>
          )}

          {status === 'REJECTED' && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <div className="text-2xl mr-3">❌</div>
                <div>
                  <p className="font-semibold text-red-900">Verification Rejected</p>
                  <p className="text-sm text-red-700 mt-1 whitespace-pre-wrap">{rejectionReason}</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}

          {status !== 'VERIFIED' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Document Type Selection */}
              <div>
                <label htmlFor="docType" className="block text-sm font-medium text-gray-700 mb-3">
                  Document Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['AADHAR', 'PAN', 'PASSPORT', 'DRIVING_LICENSE'] as DocumentType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setDocumentType(type)}
                      className={`p-3 rounded-lg border-2 transition font-medium text-sm ${
                        documentType === type
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {type === 'AADHAR' && '🇮🇳 Aadhar'}
                      {type === 'PAN' && '💼 PAN'}
                      {type === 'PASSPORT' && '🛂 Passport'}
                      {type === 'DRIVING_LICENSE' && '🚗 Driving License'}
                    </button>
                  ))}
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-3">
                  Upload Document <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <div className="flex justify-center mb-2">
                    <svg
                      className="w-12 h-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3v-6"
                      />
                    </svg>
                  </div>
                  <input
                    id="file"
                    type="file"
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="hidden"
                    disabled={loading}
                  />
                  <label
                    htmlFor="file"
                    className="cursor-pointer"
                  >
                    <p className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                      Click to upload
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      or drag and drop (JPEG, PNG, PDF up to 5MB)
                    </p>
                  </label>
                  {file && (
                    <p className="text-sm text-green-600 mt-2 font-medium">
                      ✓ {file.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!file || loading || status === 'PENDING'}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Uploading...' : 'Submit for Verification'}
              </button>

              <p className="text-xs text-gray-500 text-center">
                Your document will be reviewed by our admin team within 24-48 hours.
                Only clear, legible photos/scans will be accepted.
              </p>
            </form>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📋 Document Requirements</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="text-indigo-600 mr-3 font-bold">•</span>
              <span>Document must be clear and readable</span>
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 mr-3 font-bold">•</span>
              <span>All four corners of the document must be visible</span>
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 mr-3 font-bold">•</span>
              <span>No glare or reflections on the document</span>
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 mr-3 font-bold">•</span>
              <span>Document should not be expired (where applicable)</span>
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 mr-3 font-bold">•</span>
              <span>Supported formats: JPEG, PNG, PDF (max 5MB)</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
