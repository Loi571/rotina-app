# Rotina App

Aplicativo web para gestão de rotina diária, migrado de uma planilha Google Sheets.

## Tecnologias
- **Frontend:** Next.js (App Router), React, Tailwind CSS
- **Backend:** API Routes (Next.js), Supabase (PostgreSQL)
- **Segurança:** Row Level Security (RLS), funções PL/pgSQL com privilégios restritos

## Funcionalidades
- Criação automática de semanas e tarefas a partir de templates
- Dashboard de progresso semanal
- CRUD de templates de tarefas
- Checkboxes com salvamento instantâneo no banco
- Navegação entre dias (passado e futuro)

## Como executar localmente
1. Clone o repositório
2. Instale as dependências: `npm install`
3. Configure as variáveis de ambiente em `.env.local`
4. Execute: `npm run dev`
5. Acesse: `http://localhost:3000`
