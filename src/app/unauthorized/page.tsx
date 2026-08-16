import Link from 'next/link'
import { Shield, ArrowLeft } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Access Denied | TrustNest',
  description: 'You do not have permission to access this resource'
}

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-red-900 flex items-center justify-center p-4">
      <div className="glass-dark rounded-2xl p-8 w-full max-w-md text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-red-400" />
          </div>
        </div>

        {/* Content */}
        <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
        <p className="text-gray-300 mb-6">
          You don't have permission to access this resource. Please contact your administrator if you believe this is an error.
        </p>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href="/admin/login"
            className="w-full inline-flex items-center justify-center py-3 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors"
          >
            Try Different Account
          </Link>
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center py-2 px-4 rounded-lg text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}