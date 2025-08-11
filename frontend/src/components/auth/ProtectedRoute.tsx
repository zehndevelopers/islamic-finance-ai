import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import { AuthForm } from './AuthForm'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const [authMode, setAuthMode] = React.useState<'signin' | 'signup'>('signin')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-islamic-green-50 to-islamic-teal-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-islamic-green-500 to-islamic-teal-500 rounded-full flex items-center justify-center shadow-lg mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-islamic-green-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <AuthForm 
        mode={authMode} 
        onToggleMode={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')} 
      />
    )
  }

  return <>{children}</>
}
