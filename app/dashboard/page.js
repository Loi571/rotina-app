'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const [semanas, setSemanas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    const { data: semanasData } = await supabase
      .from('semanas')
      .select('*')
      .order('data_inicio', { ascending: false })

    const resultado = []

    for (const semana of semanasData) {
      const { data: tarefas } = await supabase
        .from('tarefas')
        .select('concluida')
        .eq('semana_id', semana.id)

      const total = tarefas.length
      const concluidas = tarefas.filter(t => t.concluida).length
      const percentual = total > 0 ? Math.round((concluidas / total) * 100) : 0

      resultado.push({ ...semana, total, concluidas, percentual })
    }

    setSemanas(resultado)
    setLoading(false)
  }

  function formatarData(dataStr) {
    const d = new Date(dataStr + 'T12:00:00')
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  function corBarra(percentual) {
    if (percentual >= 80) return 'bg-green-500'
    if (percentual >= 50) return 'bg-yellow-500'
    if (percentual >= 20) return 'bg-orange-500'
    return 'bg-red-500'
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">📊 Dashboard</h1>
          <a href="/" className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-lg">
            ← Voltar
          </a>
        </div>

        {loading ? (
          <p className="text-gray-400 text-center mt-10">Carregando...</p>
        ) : (
          <div className="space-y-4">
            {semanas.map(semana => (
              <div key={semana.id} className="bg-gray-800 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Semana de {formatarData(semana.data_inicio)}</span>
                  <span className={`font-bold text-lg ${semana.percentual >= 80 ? 'text-green-400' : semana.percentual >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {semana.percentual}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                  <div
                    className={`h-3 rounded-full transition-all ${corBarra(semana.percentual)}`}
                    style={{ width: `${semana.percentual}%` }}
                  />
                </div>
                <p className="text-sm text-gray-400">{semana.concluidas}/{semana.total} tarefas concluídas</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}