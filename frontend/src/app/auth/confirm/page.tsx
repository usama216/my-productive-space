// src/app/auth/confirm/page.tsx - Email confirmation handler
// src/app/auth/confirm/page.tsx - Email confirmation handler (Fixed with Suspense)
import { Suspense } from 'react'
import ConfirmClient from './ConfirmClient'

export default function ConfirmPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConfirmClient />
    </Suspense>
  )
}

