'use client'

import { useEffect, useState } from 'react'

export default function SupabaseErrorBoundary({ children }) {
  const [error, setError] = useState(null)

  useEffect(() => {
    const handleRejection = (event) => {
      // Verifica se é um erro de conexão com o Supabase
      const reason = event.reason
      if (reason?.message?.includes('fetch') || reason?.message?.includes('Failed to fetch')) {
        setError('Banco de dados em modo espera – aguarde um momento e recarregue.')
        event.preventDefault()
      }
    }

    window.addEventListener('unhandledrejection', handleRejection)
    return () => window.removeEventListener('unhandledrejection', handleRejection)
  }, [])

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
        <div className="text-center bg-gray-800 border border-gray-700 rounded-xl p-8 max-w-md">
          <p className="text-2xl mb-4">⏳</p>
          <p className="text-lg font-semibold mb-2">Banco de dados pausado</p>
          <p className="text-gray-400">{error}</p>
          <button
            onClick={() => {
              setError(null)
              window.location.reload()
            }}
            className="mt-4 bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg transition-all"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  return children
}