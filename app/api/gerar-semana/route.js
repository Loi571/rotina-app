import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(request) {
  const { data_inicio } = await request.json()

  // Cria a semana se não existir
  const { data: semana, error: errInsert } = await supabase
    .from('semanas')
    .insert({ data_inicio })
    .select()
    .single()

  if (errInsert) {
    console.error('Erro ao criar semana:', errInsert)
    return Response.json({ ok: false, error: errInsert.message }, { status: 500 })
  }

  // Chama a função SQL que gera as tarefas
  const { error: errRpc } = await supabase.rpc('gerar_tarefas_semana', {
    p_semana_id: semana.id,
    p_data_inicio: data_inicio
  })

  if (errRpc) {
    console.error('Erro ao gerar tarefas:', errRpc)
    return Response.json({ ok: false, error: errRpc.message }, { status: 500 })
  }

  return Response.json({ ok: true, semana_id: semana.id })
}