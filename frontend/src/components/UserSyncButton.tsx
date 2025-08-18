"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { Loader2, RefreshCw } from 'lucide-react'

export function UserSyncButton() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [syncing, setSyncing] = useState(false)

  const handleSync = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "No user logged in",
        variant: "destructive",
      })
      return
    }

    setSyncing(true)
    try {
      const response = await fetch('/api/sync-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      })

      const result = await response.json()
      
      if (response.ok) {
        // Show the SQL command in console
        console.log('🔧 Manual User Sync Required')
        console.log('User ID:', user.id)
        console.log('')
        console.log('📋 Run this SQL in your Supabase database:')
        console.log('')
        console.log(result.sqlCommand)
        console.log('')
        console.log('📍 Go to: Supabase Dashboard → SQL Editor → Run this command')
        console.log('')
        
        toast({
          title: "Sync Instructions",
          description: "Check console for SQL command to run in Supabase",
          variant: "default",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to get sync instructions",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error getting sync instructions:', error)
      toast({
        title: "Error",
        description: "Failed to get sync instructions. Check console for details.",
        variant: "destructive",
      })
    } finally {
      setSyncing(false)
    }
  }

  if (!user) return null

  return (
    <Button
      onClick={handleSync}
      disabled={syncing}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      {syncing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <RefreshCw className="h-4 w-4" />
      )}
      {syncing ? "Getting Instructions..." : "Get Sync Instructions"}
    </Button>
  )
}
