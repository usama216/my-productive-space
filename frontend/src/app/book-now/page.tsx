// src/app/book-now/page.tsx  (Server Component)
import { Suspense } from 'react'

import BookingClient from '@/app/book-now/BookingClient'

export default function Page() {
  return (
    <Suspense fallback={<div>Loading…</div>}>
      <BookingClient />
    </Suspense>
  )
}
