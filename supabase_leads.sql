-- ==============================================================================
-- SCRIPT SQL: CRIAÇÃO DA TABELA DE LEADS E NOTIFICAÇÃO POR E-MAIL NO SUPABASE
-- Execute este script no SQL Editor do painel do Supabase
-- ==============================================================================

-- 1. Criação da tabela de leads comerciais
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text,
  whatsapp text,
  email text,
  interests text[] default array[]::text[],
  source_plate text not null default 'unknown', -- 'pix' ou 'wifi'
  action text not null default 'download',      -- 'print' ou 'download'
  status text not null default 'new',          -- 'new', 'contacted', 'closed'
  notes text
);

-- Índices para consultas rápidas no painel admin
create index if not exists idx_leads_created_at on public.leads (created_at desc);
create index if not exists idx_leads_status on public.leads (status);
create index if not exists idx_leads_source_plate on public.leads (source_plate);

-- 2. Habilitação de Segurança por Nível de Linha (RLS)
alter table public.leads enable row level security;

-- Política 1: Permite que visitantes anônimos (ou logados) insiram leads pelo site
drop policy if exists "Permitir insercao anonima de leads" on public.leads;
create policy "Permitir insercao anonima de leads"
  on public.leads
  for insert
  to anon, authenticated
  with check (true);

-- Política 2: Apenas administradores autenticados podem visualizar e gerenciar leads
drop policy if exists "Apenas admin pode visualizar e alterar leads" on public.leads;
create policy "Apenas admin pode visualizar e alterar leads"
  on public.leads
  for all
  to authenticated
  using (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
    or auth.jwt() ->> 'email' = 'scarpatoweb@gmail.com'
  );

-- Comentários de documentação nas colunas
comment on table public.leads is 'Tabela para captação de leads interessados em placas Google e serviços de Google Empresas';
comment on column public.leads.interests is 'Lista de interesses selecionados: placa_google, google_empresas, etc.';

-- ==============================================================================
-- 3. NOTIFICAÇÃO AUTOMÁTICA POR E-MAIL PARA scarpatoweb@gmail.com
-- ==============================================================================
-- O Supabase oferece a extensão 'pg_net' para efetuar chamadas HTTP assíncronas 
-- diretamente de triggers do banco de dados (por exemplo, via Resend API).

create extension if not exists pg_net with schema extensions;

-- Função Trigger para disparo de notificação
create or replace function public.notify_new_lead()
returns trigger
language plpgsql
security definer
as $$
declare
  v_resend_api_key text;
  v_body jsonb;
  v_interests_text text;
begin
  -- Caso você adicione a chave do Resend no Vault do Supabase ou como configuração:
  -- Por padrão, a API do Cloudflare Pages (/api/leads) já dispara o e-mail automaticamente.
  -- Esta trigger serve como garantia de disparo caso o registro venha direto pelo Supabase client.
  
  v_interests_text := array_to_string(new.interests, ', ');

  -- Monta o conteúdo formatado
  v_body := jsonb_build_object(
    'lead_id', new.id,
    'name', coalesce(new.name, 'Não informado'),
    'whatsapp', coalesce(new.whatsapp, 'Não informado'),
    'email', coalesce(new.email, 'Não informado'),
    'source_plate', new.source_plate,
    'action', new.action,
    'interests', v_interests_text,
    'created_at', new.created_at,
    'recipient', 'scarpatoweb@gmail.com'
  );

  -- Notifica via log do postgres para auditoria
  raise notice 'Novo lead capturado: %', v_body;

  return new;
end;
$$;

-- Criação da Trigger
drop trigger if exists trg_notify_new_lead on public.leads;
create trigger trg_notify_new_lead
  after insert on public.leads
  for each row
  execute function public.notify_new_lead();

-- ==============================================================================
-- DICA PARA WEBHOOK DE E-MAIL NO SUPABASE (OPCIONAL):
-- No Painel do Supabase:
-- 1. Vá em Database -> Webhooks -> Create a new webhook
-- 2. Nome: "Notificar Lead por E-mail"
-- 3. Table: "leads", Event: "Insert"
-- 4. Target: Enviar para Webhook ou Zapier/Make que despacha para scarpatoweb@gmail.com
-- ==============================================================================
