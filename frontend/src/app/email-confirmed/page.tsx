// src/app/email-confirmed/page.tsx
"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, Mail, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

export default function EmailConfirmedPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleEmailAction = async () => {
      try {
        // Get the token and type from URL parameters
        const token = searchParams.get('token')
        const type = searchParams.get('type')

        if (!token) {
          setError('No confirmation token found')
          setLoading(false)
          return
        }

        // Handle different types of email actions
        if (type === 'recovery') {
          // Password reset confirmation
          const { error: resetError } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'recovery'
          })
          
          if (resetError) {
            console.error('Password reset error:', resetError)
            setError('Failed to reset password: ' + resetError.message)
            setLoading(false)
            return
          }
          
          // Password reset successful
          setLoading(false)
          return
        }

        // Email confirmation (default case)
        const { error: confirmError } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'signup'
        })
        
        if (confirmError) {
          console.error('Email confirmation error:', confirmError)
          setError('Failed to confirm email: ' + confirmError.message)
          setLoading(false)
          return
        }
        
        // Email confirmed successfully
        setLoading(false)
      } catch (err) {
        setError('Failed to process email action')
        setLoading(false)
      }
    }

    handleEmailAction()
  }, [searchParams])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-xl text-red-600">Email Confirmation Failed</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">{error}</p>
            <div className="space-y-3">
              <Button asChild className="w-full bg-orange-500 hover:bg-orange-600">
                <Link href="/login">
                  Go to Login
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/sign-up">Try Signing Up Again</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-xl text-green-600">Account Successfully Created!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Your email has been confirmed and your account is now active. 
            Please login to continue.
          </p>
          <div className="space-y-3">
            <Button asChild className="w-full bg-orange-500 hover:bg-orange-600">
              <Link href="/login">
                Login to Continue
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <p className="text-xs text-gray-500">
              You will be redirected to the login page in a few seconds...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
