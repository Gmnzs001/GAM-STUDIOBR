'use client'

import { useState } from 'react'
import LoadingScreen from '@/components/LoadingScreen'

export default function Home() {
  const [loaded, setLoaded] = useState(false)

  return (
    <>
      {!loaded && <LoadingScreen onComplete={() => setLoaded(true)} />}
      {loaded && (
        <main className="flex min-h-screen items-center justify-center">
          <h1 className="text-4xl font-black text-white">Site carregado</h1>
        </main>
      )}
    </>
  )
}
