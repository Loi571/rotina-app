import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Cliente admin (service_role) para operações que precisam ignorar RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  // 1. Obter cookies da requisição e criar cliente de servidor
  const cookieStore = request.cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
        set(name, value, options) { /* não necessário na rota */ },
        remove(name, options) { /* não necessário */ }
      }
    }
  )

  // 2. Verificar sessão
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (sessionError || !session) {
    return NextResponse.json({ ok: false, error: 'Não autenticado' }, { status: 401 })
  }
  const userId = session.user.id

  let data_inicio
  try {
    const body = await request.json()
    data_inicio = body.data_inicio
  } catch {
    return NextResponse.json({ ok: false, error: 'Body inválido' }, { status: 400 })
  }

  // 3. Verificar ou criar a semana (usando admin para evitar problemas de RLS)
  let { data: semana, error: errSelect } = await supabaseAdmin
    .from('semanas')
    .select('*')
    .eq('data_inicio', data_inicio)
    .eq('user_id', userId)
    .single()

  if (errSelect && errSelect.code !== 'PGRST116') { // PGRST116 = not found
    console.error('Erro ao buscar semana:', errSelect)
    return NextResponse.json({ ok: false, error: errSelect.message }, { status: 500 })
  }

  if (!semana) {
    const { data: novaSemana, error: errInsert } = await supabaseAdmin
      .from('semanas')
      .insert({ data_inicio, user_id: userId })
      .select()
      .single()

    if (errInsert) {
      console.error('Erro ao criar semana:', errInsert)
      return NextResponse.json({ ok: false, error: errInsert.message }, { status: 500 })
    }
    semana = novaSemana
  }

  // 4. Verificar se a semana já possui tarefas (evita duplicação)
  const { count: tarefasExistentes, error: errCount } = await supabaseAdmin
    .from('tarefas')
    .select('*', { count: 'exact', head: true })
    .eq('semana_id', semana.id)
    .eq('user_id', userId)

  if (errCount) {
    console.error('Erro ao contar tarefas:', errCount)
    return NextResponse.json({ ok: false, error: errCount.message }, { status: 500 })
  }

  // 5. Gerar tarefas apenas se não houver nenhuma
  if (tarefasExistentes === 0) {
    const { error: errRpc } = await supabaseAdmin.rpc('gerar_tarefas_semana', {
      p_semana_id: semana.id,
      p_data_inicio: data_inicio,
      p_user_id: userId
    })

    if (errRpc) {
      console.error('Erro ao chamar gerar_tarefas_semana:', errRpc)
      return NextResponse.json({ ok: false, error: errRpc.message }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true, semana_id: semana.id })
}