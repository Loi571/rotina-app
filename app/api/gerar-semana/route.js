import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  const { data_inicio } = await request.json()

  // 1. Verifica se a semana já existe
  let { data: semana, error: errSelect } = await supabase
    .from('semanas')
    .select('*')
    .eq('data_inicio', data_inicio)
    .single()

  // 2. Se não existir, cria
  if (!semana || errSelect) {
    const { data: novaSemana, error: errInsert } = await supabaseAdmin
      .from('semanas')
      .insert({ data_inicio })
      .select()
      .single()

    if (errInsert) {
      console.error('Erro ao criar semana:', errInsert)
      return Response.json({ ok: false, error: errInsert.message }, { status: 500 })
    }
    semana = novaSemana
  }

  // 3. Verifica se as tarefas já foram geradas para essa semana
  const { count: tarefasExistentes } = await supabase
    .from('tarefas')
    .select('*', { count: 'exact', head: true })
    .eq('semana_id', semana.id)

  // 4. Só gera se não houver tarefas (evita duplicação)
  if (tarefasExistentes === 0) {
    const { error: errRpc } = await supabaseAdmin.rpc('gerar_tarefas_semana', {
      p_semana_id: semana.id,
      p_data_inicio: data_inicio
    })

    if (errRpc) {
      console.error('Erro ao gerar tarefas:', errRpc)
      return Response.json({ ok: false, error: errRpc.message }, { status: 500 })
    }
  }

  return Response.json({ ok: true, semana_id: semana.id, ja_tinha_tarefas: tarefasExistentes > 0 })
} 