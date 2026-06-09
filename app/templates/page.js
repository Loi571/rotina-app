'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'

export default function Templates() {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState(null)
  const [novoForm, setNovoForm] = useState(null)
  const formRef = useRef(null)

  useEffect(() => {
    carregarTemplates()
  }, [])

  useEffect(() => {
    if (novoForm && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [novoForm])

  async function carregarTemplates() {
    const { data } = await supabase
      .from('templates')
      .select('*')
      .order('hora_inicio')
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
    if (!novoForm.nome.trim()) return
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

  function abrirNovoForm() {
    setNovoForm({
      nome: '',
      categoria: '💻 Produtividade',
      hora_inicio: '09:00',
      hora_fim: '10:00',
      dias: 'Seg,Ter,Qua,Qui,Sex'
    })
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">⚡ Templates</h1>
          <div className="flex gap-2">
            <button onClick={abrirNovoForm} className="text-sm bg-indigo-600 hover:bg-indigo-500 px-3 py-1 rounded-lg transition-all">
              + Novo
            </button>
            <a href="/" className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-lg transition-all">
              ← Voltar
            </a>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-400 text-center mt-10">Carregando...</p>
        ) : (
          <div className="space-y-3">
            {templates.map(template => (
              <div key={template.id} className={`bg-gray-800 border border-gray-700 rounded-xl p-4 ${!template.ativo ? 'opacity-50' : ''}`}>
                {editando?.id === template.id ? (
                  <div className="space-y-2">
                    <input className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-sm" value={editando.nome}
                      onChange={e => setEditando({ ...editando, nome: e.target.value })} placeholder="Nome da tarefa" />
                    <input className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-sm" value={editando.categoria}
                      onChange={e => setEditando({ ...editando, categoria: e.target.value })} placeholder="Categoria" />
                    <div className="flex gap-2">
                      <input className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-sm" value={editando.hora_inicio}
                        onChange={e => setEditando({ ...editando, hora_inicio: e.target.value })} placeholder="Início" />
                      <input className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-sm" value={editando.hora_fim}
                        onChange={e => setEditando({ ...editando, hora_fim: e.target.value })} placeholder="Fim" />
                    </div>
                    <input className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-sm" value={editando.dias}
                      onChange={e => setEditando({ ...editando, dias: e.target.value })} placeholder="Dias" />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setEditando(null)} className="text-sm bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded-lg transition-all">Cancelar</button>
                      <button onClick={() => salvarEdicao(editando)} className="text-sm bg-indigo-600 hover:bg-indigo-500 px-3 py-1 rounded-lg transition-all">Salvar</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={template.ativo}
                      onChange={() => toggleAtivo(template.id, template.ativo)} className="w-4 h-4 cursor-pointer" />
                    <div className="flex-1">
                      <p className="font-medium">{template.nome}</p>
                      <p className="text-sm text-gray-400">{template.hora_inicio} – {template.hora_fim} · {template.categoria}</p>
                      <p className="text-xs text-gray-500">{template.dias}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditando(template)} className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded transition-all">✏️</button>
                      <button onClick={() => deletar(template.id)} className="text-xs bg-red-900 hover:bg-red-800 px-2 py-1 rounded transition-all">🗑️</button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {novoForm && (
              <div ref={formRef} className="bg-gray-800 border border-indigo-600 rounded-xl p-4 space-y-2">
                <p className="font-semibold text-indigo-400 mb-2">Novo Template</p>
                <input className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-sm" value={novoForm.nome}
                  onChange={e => setNovoForm({ ...novoForm, nome: e.target.value })} placeholder="Nome da tarefa" autoFocus />
                <input className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-sm" value={novoForm.categoria}
                  onChange={e => setNovoForm({ ...novoForm, categoria: e.target.value })} placeholder="Categoria" />
                <div className="flex gap-2">
                  <input className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-sm" value={novoForm.hora_inicio}
                    onChange={e => setNovoForm({ ...novoForm, hora_inicio: e.target.value })} placeholder="Início (09:00)" />
                  <input className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-sm" value={novoForm.hora_fim}
                    onChange={e => setNovoForm({ ...novoForm, hora_fim: e.target.value })} placeholder="Fim (10:00)" />
                </div>
                <input className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-sm" value={novoForm.dias}
                  onChange={e => setNovoForm({ ...novoForm, dias: e.target.value })} placeholder="Dias (Seg,Ter,Qua,Qui,Sex)" />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setNovoForm(null)} className="text-sm bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded-lg transition-all">Cancelar</button>
                  <button onClick={salvarNovo} className="text-sm bg-indigo-600 hover:bg-indigo-500 px-3 py-1 rounded-lg transition-all">Salvar</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}