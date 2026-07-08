# 🗓️ Rotina App

Aplicativo web progressivo para gestão de rotina diária. Migrado de uma planilha do Google Sheets, hoje é uma plataforma completa, segura e multi‑usuário.

[![Vercel](https://img.shields.io/badge/Vercel-Deploy-black?logo=vercel)](https://rotina-app-beta.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16.x-000000?logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com/)

---

## ✨ Funcionalidades

- 🔐 **Autenticação completa** via Supabase Auth (e‑mail/senha), com confirmação de e‑mail.
- 🧩 **Geração automática de semanas** a partir de templates personalizáveis.
- 🛡️ **Row Level Security (RLS) estrito**: cada usuário vê apenas os seus dados.
- 📅 **Versionamento de templates** — alterações nos horários só afetam semanas futuras (coluna `valid_from`).
- 📊 **Dashboard de progresso** semanal com barra de progresso dinâmica.
- ⚡ **Checkboxes com salvamento instantâneo** no banco de dados.
- 🔄 **Navegação entre dias** (passado, presente e futuro).
- 🧪 **Script de teste** para validar geração de tarefas sem duplicação.
- ⏳ **Tratamento de erro amigável** quando o banco de dados está em espera (pausa por inatividade).
- 🚀 **Deploy automático** na Vercel.

---

## 🧰 Tecnologias

| Camada         | Tecnologia                                      |
| -------------- | ----------------------------------------------- |
| Frontend       | Next.js (App Router), React, Tailwind CSS       |
| Backend        | API Routes (Next.js), Supabase (PostgreSQL)    |
| Segurança      | Row Level Security (RLS), `SECURITY DEFINER`   |
| Infraestrutura | Vercel, Supabase (Free Tier, sa‑east‑1)        |

---

## 🚀 Como executar localmente

1. Clone o repositório
   ```bash
   git clone https://github.com/Loi571/rotina-app.git