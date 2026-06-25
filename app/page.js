'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function Home() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  const router = useRouter()
  const [tarefas, setTarefas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)
  const hoje = new Date().toISOString().split('T')[0]
  const [dataFiltro, setDataFiltro] = useState(hoje)

  // Verificar usuário logado
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user) router.push('/login')
      else setUser(data.user)
    })
  }, [])

  useEffect(() => {
    if (user) carregarOuGerar(dataFiltro)
  }, [dataFiltro, user])

  async function carregarOuGerar(data) {
    if (!user) return
    setLoading(true)
    setError(null)

    try {
      let { data: semana, error } = await supabase
        .from('semanas')
        .select('*')
        .lte('data_inicio', data)
        .order('data_inicio', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      let semanaCobreData = false
      if (semana) {
        const inicioSemana = new Date(semana.data_inicio + 'T12:00:00')
        const fimSemana = new Date(inicioSemana)
        fimSemana.setDate(fimSemana.getDate() + 6)
        const dataAtual = new Date(data + 'T12:00:00')
        semanaCobreData = dataAtual >= inicioSemana && dataAtual <= fimSemana
      }

      if (!semanaCobreData) {
        const dataObj = new Date(data + 'T12:00:00')
        const diaSemana = (dataObj.getDay() + 6) % 7
        const segunda = new Date(dataObj)
        segunda.setDate(dataObj.getDate() - diaSemana)
        const dataInicio = segunda.toISOString().split('T')[0]

        const res = await fetch('/api/gerar-semana', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data_inicio: dataInicio })
        })
        if (!res.ok) throw new Error('Falha ao gerar semana')

        const { data: novaSemana } = await supabase
          .from('semanas')
          .select('*')
          .eq('data_inicio', dataInicio)
          .single()
        semana = novaSemana
      }

      if (semana) {
        const { data: tarefasData, error: errTarefas } = await supabase
          .from('tarefas')
          .select('*')
          .eq('semana_id', semana.id)
          .eq('data', data)
          .order('hora_inicio')
        if (errTarefas) throw errTarefas
        setTarefas(tarefasData || [])
      } else {
        setTarefas([])
      }
    } catch (err) {
      console.error('Erro:', err)
      setError('Banco de dados em modo espera – aguarde e recarregue')
    } finally {
      setLoading(false)
    }
  }

  async function toggleTarefa(id, concluida) {
    await supabase
      .from('tarefas')
      .update({ concluida: !concluida })
      .eq('id', id)
    setTarefas(tarefas.map(t => (t.id === id ? { ...t, concluida: !concluida } : t)))
  }

  function mudarDia(offset) {
    const d = new Date(dataFiltro)
    d.setDate(d.getDate() + offset)
    setDataFiltro(d.toISOString().split('T')[0])
  }

  function formatarDia(dataStr) {
    const d = new Date(dataStr + 'T12:00:00')
    return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' })
  }

  const total = tarefas.length
  const concluidas = tarefas.filter(t => t.concluida).length
  const percentual = total > 0 ? Math.round((concluidas / total) * 100) : 0

  if (!user) return null
  if (error) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">{error}</div>

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">📅 Rotina</h1>
          <div className="flex gap-2">
            {dataFiltro !== hoje && (
              <button
                onClick={() => setDataFiltro(hoje)}
                className="text-sm bg-indigo-600 hover:bg-indigo-500 px-3 py-1 rounded-lg transition-all"
              >
                Hoje
              </button>
            )}
            <a href="/dashboard" className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-lg transition-all">
              Dashboard
            </a>
            <a href="/templates" className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-lg transition-all">
              Templates
            </a>
          </div>
        </div>

        {/* Navegação de dias */}
        <div className="flex items-center justify-between bg-gray-800 border border-gray-700 rounded-xl p-3 mb-4">
          <button onClick={() => mudarDia(-1)} className="text-xl px-3 py-1 hover:bg-gray-700 rounded-lg transition-all">‹</button>
          <div className="text-center">
            <p className="font-semibold capitalize">{formatarDia(dataFiltro)}</p>
            {dataFiltro === hoje && <span className="text-xs text-indigo-400">hoje</span>}
          </div>
          <button onClick={() => mudarDia(1)} className="text-xl px-3 py-1 hover:bg-gray-700 rounded-lg transition-all">›</button>
        </div>

        {/* Barra de progresso */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 mb-6">
          <div className="flex justify-between mb-2">
            <span>{concluidas}/{total} tarefas</span>
            <span className="font-bold">{percentual}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div className="bg-indigo-500 h-3 rounded-full transition-all" style={{ width: `${percentual}%` }} />
          </div>
        </div>

        {/* Lista de tarefas */}
        {loading ? (
          <p className="text-gray-400 text-center mt-10">Carregando...</p>
        ) : total === 0 ? (
          <p className="text-gray-400 text-center mt-10">Nenhuma tarefa para este dia.</p>
        ) : (
          <div className="space-y-3">
            {tarefas.map(tarefa => (
              <div
                key={tarefa.id}
                onClick={() => toggleTarefa(tarefa.id, tarefa.concluida)}
                className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border
                  ${tarefa.concluida
                    ? 'bg-indigo-900/40 border-indigo-500/50 opacity-80'
                    : 'bg-gray-800 border-gray-700 hover:bg-gray-700'}`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                  ${tarefa.concluida ? 'bg-indigo-500 border-indigo-500' : 'border-gray-500'}`}>
                  {tarefa.concluida && <span className="text-xs">✓</span>}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${tarefa.concluida ? 'line-through text-gray-500' : ''}`}>
                    {tarefa.nome}
                  </p>
                  <p className="text-sm text-gray-400">
                    {tarefa.hora_inicio} – {tarefa.hora_fim} · {tarefa.categoria}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}