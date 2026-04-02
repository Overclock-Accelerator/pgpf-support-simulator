'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('pgpf_auth') === 'true') {
      router.push('/simulator')
    }
  }, [router])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password === 'OpsFTW') {
      localStorage.setItem('pgpf_auth', 'true')
      router.push('/simulator')
    } else {
      setError('Wrong password. The pets are disappointed in you.')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FDFAF5' }}>
      <div className="bg-white rounded-2xl shadow-lg p-10 flex flex-col items-center gap-6 max-w-sm w-full mx-4">
        <img src="/hero.png" alt="PrettyGoodPetFoods pet crew" style={{ maxWidth: '300px', width: '100%' }} />
        <h1 className="text-3xl font-bold text-amber-600 text-center">PrettyGoodPetFoods</h1>
        <p className="italic text-gray-500 text-center text-sm">"If they ate it. It must have been pretty good!"</p>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
          <label className="text-sm font-medium text-gray-700">Simulator Passcode</label>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError('') }}
            className="border border-amber-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 w-full"
            placeholder="Enter passcode..."
            autoFocus
          />
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg px-6 py-2 transition-colors"
          >
            Enter the Shelter 🐾
          </button>
        </form>
      </div>
    </main>
  )
}
