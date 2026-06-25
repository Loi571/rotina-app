// scripts/test-semana.js
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const USER_ID = '657d44a1-7a5e-4d7a-8aed-4f75f149fd7c'
const DATA_INICIO = '2026-07-06' // ou qualquer data que já exista

async function main() {
  console.log('🔧 Iniciando teste de geração de semana...\n')

  // 1. Obter ou criar a semana
  let { data: semana } = await supabase
    .from('semanas')
    .select('*')
    .eq('data_inicio', DATA_INICIO)
    .eq('user_id', USER_ID)
    .single()

  if (!semana) {
    const { data: novaSemana, error: errSem } = await supabase
      .from('semanas')
      .insert({ data_inicio: DATA_INICIO, user_id: USER_ID })
      .select()
      .single()
    if (errSem) {
      console.error('❌ Erro ao criar semana:', errSem.message)
      return
    }
    semana = novaSemana
  }
  console.log(`📅 Semana: ${semana.data_inicio} (ID ${semana.id})\n`)

  // 2. Contar tarefas antes da geração
  const { count: antes } = await supabase
    .from('tarefas')
    .select('*', { count: 'exact', head: true })
    .eq('semana_id', semana.id)
  console.log(`📊 Tarefas antes: ${antes}`)

  // 3. Chamar a função de geração
  console.log('🔄 Chamando gerar_tarefas_semana...')
  const { error: errRpc } = await supabase.rpc('gerar_tarefas_semana', {
    p_semana_id: semana.id,
    p_data_inicio: DATA_INICIO,
    p_user_id: USER_ID
  })
  if (errRpc) {
    console.error('❌ Erro ao gerar tarefas:', errRpc.message)
    return
  }

  // 4. Contar tarefas depois
  const { count: depois } = await supabase
    .from('tarefas')
    .select('*', { count: 'exact', head: true })
    .eq('semana_id', semana.id)
  console.log(`📊 Tarefas depois: ${depois}`)

  if (depois > antes) {
    console.log(`✅ Geração bem‑sucedida! (+${depois - antes} tarefas)`)
  } else {
    console.log('ℹ️ Nenhuma nova tarefa gerada (ON CONFLICT funcionou)')
  }
}

main()