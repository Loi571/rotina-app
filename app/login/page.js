'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Login() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 space-y-4 w-full max-w-md">
        <h1 className="text-2xl font-bold">Entrar</h1>
        <input type="email" placeholder="Email" className="w-full p-2 rounded bg-gray-700 border border-gray-600" value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Senha" className="w-full p-2 rounded bg-gray-700 border border-gray-600" value={password} onChange={e => setPassword(e.target.value)} />
        <button onClick={handleLogin} className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded w-full transition-all">Entrar</button>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <p className="text-sm text-gray-400">Ainda não tem conta? <a href="/signup" className="text-indigo-400">Cadastre-se</a></p>
      </div>
    </div>
  )
}