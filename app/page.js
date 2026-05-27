'use client'

import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

export default function Home() {
  const [tarefas, setTarefas] = useState([])
  const [loading, setLoading] = useState(true)
  const hoje = new Date().toISOString().split('T')[0]
  const [dataFiltro, setDataFiltro] = useState(hoje)

  useEffect(() => {
    carregarOuGerar(dataFiltro)
  }, [dataFiltro])

  async function carregarOuGerar(data) {
    setLoading(true)

    // 1. Tenta encontrar a semana que contém a data escolhida
    let { data: semana, error } = await supabase
      .from('semanas')
      .select('*')
      .lte('data_inicio', data)
      .order('data_inicio', { ascending: false })
      .limit(1)
      .single()

    // 2. Verifica se a semana encontrada realmente cobre a data
    let semanaCobreData = false
    if (semana) {
      const inicioSemana = new Date(semana.data_inicio + 'T12:00:00')
      const fimSemana = new Date(inicioSemana)
      fimSemana.setDate(fimSemana.getDate() + 6) // Domingo
      const dataAtual = new Date(data + 'T12:00:00')
      semanaCobreData = dataAtual >= inicioSemana && dataAtual <= fimSemana
    }

    // 3. Se não encontrou ou a semana não cobre, cria uma nova
    if (!semanaCobreData) {
      const dataObj = new Date(data + 'T12:00:00')
      const diaSemana = (dataObj.getDay() + 6) % 7 // 0=Seg, 1=Ter, ..., 6=Dom
      const segunda = new Date(dataObj)
      segunda.setDate(dataObj.getDate() - diaSemana)
      const dataInicio = segunda.toISOString().split('T')[0]

      // Pede para a rota /api/gerar-semana criar tudo
      await fetch('/api/gerar-semana', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data_inicio: dataInicio })
      })

      // Busca a semana que acabou de ser criada
      const { data: novaSemana } = await supabase
        .from('semanas')
        .select('*')
        .eq('data_inicio', dataInicio)
        .single()
      semana = novaSemana
    }

    // 4. Busca as tarefas do dia específico
    if (semana) {
      const { data: tarefasData } = await supabase
        .from('tarefas')
        .select('*')
        .eq('semana_id', semana.id)
        .eq('data', data)
        .order('hora_inicio')
      setTarefas(tarefasData || [])
    } else {
      setTarefas([])
    }
    setLoading(false)
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

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-2xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">📅 Rotina</h1>
          <div className="flex gap-2">
            {dataFiltro !== hoje && (
              <button
                onClick={() => setDataFiltro(hoje)}
                className="text-sm bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded-lg transition-all"
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
        <div className="flex items-center justify-between bg-gray-800 rounded-xl p-3 mb-4">
          <button onClick={() => mudarDia(-1)} className="text-xl px-3 py-1 hover:bg-gray-700 rounded-lg">‹</button>
          <div className="text-center">
            <p className="font-semibold capitalize">{formatarDia(dataFiltro)}</p>
            {dataFiltro === hoje && <span className="text-xs text-green-400">hoje</span>}
          </div>
          <button onClick={() => mudarDia(1)} className="text-xl px-3 py-1 hover:bg-gray-700 rounded-lg">›</button>
        </div>

        {/* Barra de progresso */}
        <div className="bg-gray-800 rounded-xl p-4 mb-6">
          <div className="flex justify-between mb-2">
            <span>{concluidas}/{total} tarefas</span>
            <span className="font-bold">{percentual}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div className="bg-green-500 h-3 rounded-full transition-all" style={{ width: `${percentual}%` }} />
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
                className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all ${
                  tarefa.concluida ? 'bg-green-900/40 opacity-70' : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  tarefa.concluida ? 'bg-green-500 border-green-500' : 'border-gray-500'
                }`}>
                  {tarefa.concluida && <span className="text-xs">✓</span>}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${tarefa.concluida ? 'line-through text-gray-400' : ''}`}>
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