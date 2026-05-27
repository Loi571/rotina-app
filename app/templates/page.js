'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'

const CATEGORIAS = [
  '🌅 Início do dia',
  '🏋️‍♂️ Saúde',
  '🎓 Desenvolvimento',
  '☕ Descompressão',
  '💻 Produtividade',
  '🎮 Lazer',
  '🌙 Relax',
  '😴 Sono',
]

const DIAS_OPCOES = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

function validarHora(hora) {
  return /^\d{2}:\d{2}$/.test(hora)
}

function FormTemplate({ valores, onChange, onSalvar, onCancelar, titulo }) {
  const dias = valores.dias ? valores.dias.split(',').map(d => d.trim()) : []

  function toggleDia(dia) {
    const novos = dias.includes(dia)
      ? dias.filter(d => d !== dia)
      : [...dias, dia]
    // Mantém ordem correta
    const ordenados = DIAS_OPCOES.filter(d => novos.includes(d))
    onChange({ ...valores, dias: ordenados.join(',') })
  }

  function podesSalvar() {
    return (
      valores.nome.trim() !== '' &&
      validarHora(valores.hora_inicio) &&
      validarHora(valores.hora_fim) &&
      dias.length > 0
    )
  }

  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-blue-600 space-y-3">
      <p className="font-semibold text-blue-400">{titulo}</p>

      <div>
        <label className="text-xs text-gray-400 mb-1 block">Nome da tarefa *</label>
        <input
          className="w-full bg-gray-700 rounded-lg p-2 text-sm"
          value={valores.nome}
          onChange={e => onChange({ ...valores, nome: e.target.value })}
          placeholder="Ex: Bloco de estudo"
          autoFocus
        />
      </div>

      <div>
        <label className="text-xs text-gray-400 mb-1 block">Categoria *</label>
        <select
          className="w-full bg-gray-700 rounded-lg p-2 text-sm"
          value={valores.categoria}
          onChange={e => onChange({ ...valores, categoria: e.target.value })}
        >
          {CATEGORIAS.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-xs text-gray-400 mb-1 block">Início * (HH:MM)</label>
          <input
            className={`w-full bg-gray-700 rounded-lg p-2 text-sm ${valores.hora_inicio && !validarHora(valores.hora_inicio) ? 'border border-red-500' : ''}`}
            value={valores.hora_inicio}
            onChange={e => onChange({ ...valores, hora_inicio: e.target.value })}
            placeholder="09:00"
            maxLength={5}
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-400 mb-1 block">Fim * (HH:MM)</label>
          <input
            className={`w-full bg-gray-700 rounded-lg p-2 text-sm ${valores.hora_fim && !validarHora(valores.hora_fim) ? 'border border-red-500' : ''}`}
            value={valores.hora_fim}
            onChange={e => onChange({ ...valores, hora_fim: e.target.value })}
            placeholder="10:00"
            maxLength={5}
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-400 mb-2 block">Dias da semana *</label>
        <div className="flex gap-2 flex-wrap">
          {DIAS_OPCOES.map(dia => (
            <button
              key={dia}
              onClick={() => toggleDia(dia)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all
                ${dias.includes(dia) ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
            >
              {dia}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-1">
        <button onClick={onCancelar} className="text-sm bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded-lg">
          Cancelar
        </button>
        <button
          onClick={onSalvar}
          disabled={!podesSalvar()}
          className={`text-sm px-3 py-1 rounded-lg transition-all
            ${podesSalvar() ? 'bg-green-600 hover:bg-green-500' : 'bg-gray-600 opacity-50 cursor-not-allowed'}`}
        >
          Salvar
        </button>
      </div>
    </div>
  )
}

export default function Templates() {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState(null)
  const [novoForm, setNovoForm] = useState(null)
  const formRef = useRef(null)

  useEffect(() => { carregarTemplates() }, [])

  useEffect(() => {
    if (novoForm && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [novoForm])

  async function carregarTemplates() {
    const { data } = await supabase.from('templates').select('*').order('hora_inicio')
    setTemplates(data || [])
    setLoading(false)
  }

  async function toggleAtivo(id, ativo) {
    await supabase.from('templates').update({ ativo: !ativo }).eq('id', id)
    setTemplates(templates.map(t => t.id === id ? { ...t, ativo: !ativo } : t))
  }

  async function salvarEdicao(template) {
    await supabase.from('templates').update({
      nome: template.nome,
      categoria: template.categoria,
      hora_inicio: template.hora_inicio,
      hora_fim: template.hora_fim,
      dias: template.dias
    }).eq('id', template.id)
    setEditando(null)
    carregarTemplates()
  }

  async function salvarNovo() {
    await supabase.from('templates').insert({
      nome: novoForm.nome,
      categoria: novoForm.categoria,
      hora_inicio: novoForm.hora_inicio,
      hora_fim: novoForm.hora_fim,
      dias: novoForm.dias,
      ativo: true
    })
    setNovoForm(null)
    carregarTemplates()
  }

  async function deletar(id) {
    if (!confirm('Deletar este template?')) return
    await supabase.from('templates').delete().eq('id', id)
    setTemplates(templates.filter(t => t.id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">⚡ Templates</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setNovoForm({ nome: '', categoria: '🌅 Início do dia', hora_inicio: '', hora_fim: '', dias: 'Seg,Ter,Qua,Qui,Sex' })}
              className="text-sm bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded-lg"
            >
              + Novo
            </button>
            <a href="/" className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-lg">← Voltar</a>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-400 text-center mt-10">Carregando...</p>
        ) : (
          <div className="space-y-3">
            {templates.map(template => (
              <div key={template.id} className={`bg-gray-800 rounded-xl p-4 ${!template.ativo ? 'opacity-50' : ''}`}>
                {editando?.id === template.id ? (
                  <FormTemplate
                    titulo="Editar Template"
                    valores={editando}
                    onChange={setEditando}
                    onSalvar={() => salvarEdicao(editando)}
                    onCancelar={() => setEditando(null)}
                  />
                ) : (
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={template.ativo}
                      onChange={() => toggleAtivo(template.id, template.ativo)}
                      className="w-4 h-4 cursor-pointer"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{template.nome}</p>
                      <p className="text-sm text-gray-400">{template.hora_inicio} – {template.hora_fim} · {template.categoria}</p>
                      <p className="text-xs text-gray-500">{template.dias}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditando({ ...template })} className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded">✏️</button>
                      <button onClick={() => deletar(template.id)} className="text-xs bg-red-900 hover:bg-red-800 px-2 py-1 rounded">🗑️</button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {novoForm && (
              <div ref={formRef}>
                <FormTemplate
                  titulo="Novo Template"
                  valores={novoForm}
                  onChange={setNovoForm}
                  onSalvar={salvarNovo}
                  onCancelar={() => setNovoForm(null)}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
