import { Suspense } from 'react'
import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { LoginForm } from './LoginForm'
import { Shield, Building2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Admin Login | TrustNest',
  description: 'Secure admin portal for TrustNest PG Management System'
}

export default async function AdminLoginPage() {
  const session = await getServerSession(authOptions)
  if (session?.user) {
    if (session.user.role === 'SUPER_ADMIN' || session.user.role === 'INSPECTOR') {
      redirect('/super-admin')
    } else {
      redirect('/admin/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
        }}
      ></div>
      
      {/* Login Card */}
      <div className="glass-dark rounded-2xl p-8 w-full max-w-md relative overflow-hidden">
        {/* Header */}
        <div className="text-center mb-8">
          {/* Logo */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                  <Shield className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Trust<span className="text-emerald-400">Nest</span>
                </h1>
                <p className="text-xs text-gray-400 font-medium">Admin Portal</p>
              </div>
            </div>
          </div>

          {/* Welcome Text */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-white">
              Welcome Back
            </h2>
            <p className="text-gray-400 text-sm">
              Sign in to access the TrustNest management dashboard
            </p>
          </div>
        </div>

        {/* Login Form */}
        <Suspense fallback={
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-700 rounded-lg"></div>
            <div className="h-12 bg-gray-700 rounded-lg"></div>
            <div className="h-12 bg-emerald-600 rounded-lg"></div>
          </div>
        }>
          <LoginForm />
        </Suspense>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <p className="text-center text-xs text-gray-500">
            Secured by TrustNest Authentication
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-amber-500/10 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
      </div>

      {/* Additional Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-emerald-400 rounded-full opacity-60 animate-pulse"></div>
      <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-amber-400 rounded-full opacity-40 animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-emerald-300 rounded-full opacity-50 animate-pulse" style={{ animationDelay: '2s' }}></div>
    </div>
  )
}