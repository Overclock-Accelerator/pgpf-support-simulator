'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function HomePage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('pgpf_auth') === 'true') {
      router.push('/simulator')
    }
  }, [router])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      if (password === 'Overclock') {
        localStorage.setItem('pgpf_auth', 'true')
        router.push('/simulator')
      } else {
        setError('Wrong password. The pets are disappointed in you.')
        setLoading(false)
      }
    }, 300)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#f5f0e8] p-6">
      <div className="w-full max-w-sm flex flex-col items-center">

        {/* Logo lockup */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-36 h-36">
            <Image
              src="/pgpf-logo.png"
              alt="Pretty Good Pet Food logo"
              width={144}
              height={144}
              priority
              style={{ mixBlendMode: 'multiply' }}
            />
          </div>
          <h1 className="text-2xl font-black text-swiss-ink uppercase tracking-[0.1em] text-center leading-tight -mt-12">
            Pretty Good Pet Food
          </h1>
          <p className="text-xs text-neutral-500 italic mt-1 text-center leading-snug">
            &ldquo;Look, if your pet ate it&hellip; then it must have been Pretty Good!&rdquo;
          </p>
        </div>

        {/* Login card */}
        <div className="w-full bg-white border border-neutral-200 rounded shadow-sm overflow-hidden">
          <div className="bg-swiss-blue px-5 py-3">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/90">Employee Portal</p>
          </div>

          <div className="px-5 py-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.15em] text-neutral-500 mb-1.5">
                  Access Code
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError('') }}
                  className="w-full border border-neutral-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-swiss-orange focus:ring-2 focus:ring-swiss-orange/20 transition-all placeholder:text-neutral-400"
                  placeholder="Enter access code"
                  autoFocus
                />
              </div>

              {error && (
                <p className="text-xs text-swiss-crimson font-medium">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || !password}
                className="w-full bg-swiss-orange hover:bg-[#cf5204] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold uppercase tracking-[0.15em] text-xs py-3 rounded transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in&hellip;
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-neutral-400 mt-6">
          &copy; Overclock Accelerator 2026
        </p>
      </div>
    </main>
  )
}
