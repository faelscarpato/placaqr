-- ============================================================================
-- PLACA QR — SCHEMA COMPLETO DO SUPABASE (FASE 2)
-- Execute este arquivo no SQL Editor do Supabase (https://supabase.com)
-- ============================================================================

-- 1. Habilitar extensões necessárias
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================================
-- 2. TABELAS PRINCIPAIS
-- ============================================================================

-- TABELA: EMPRESAS (Clientes que compram as placas)
create table if not exists public.companies (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    phone text,
    city text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- TABELA: PLACAS (Placas físicas com QR Code)
create table if not exists public.plates (
    id uuid primary key default gen_random_uuid(),
    code text unique not null,
    batch text not null default 'TESTE',
    status text not null default 'stock' check (status in ('stock', 'active', 'disabled')),
    company_id uuid references public.companies(id) on delete set null,
    review_url text,
    sale_amount numeric(10,2),
    payment_method text,
    activated_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- TABELA: SCANS (Métricas de leitura dos QR Codes)
create table if not exists public.scans (
    id bigserial primary key,
    plate_id uuid references public.plates(id) on delete cascade not null,
    company_id uuid references public.companies(id) on delete cascade,
    scanned_at timestamptz not null default now(),
    country text,
    city text,
    user_agent text,
    device_type text,
    ip_hash text
);

-- ============================================================================
-- 3. ÍNDICES DE ALTA PERFORMANCE
-- ============================================================================
create index if not exists idx_plates_code on public.plates (code);
create index if not exists idx_plates_status on public.plates (status);
create index if not exists idx_plates_company_id on public.plates (company_id);
create index if not exists idx_scans_plate_id on public.scans (plate_id);
create index if not exists idx_scans_company_id on public.scans (company_id);
create index if not exists idx_scans_scanned_at on public.scans (scanned_at desc);

-- ============================================================================
-- 4. FUNÇÃO AUXILIAR DE ADMIN & RLS (ROW LEVEL SECURITY)
-- ============================================================================

-- Habilitar RLS em todas as tabelas
alter table public.companies enable row level security;
alter table public.plates enable row level security;
alter table public.scans enable row level security;

-- Função para checar permissão de Admin (via service_role, app_metadata ou e-mail admin)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
as $$
  select coalesce(
    auth.role() = 'service_role'
    or (auth.jwt() ->> 'role') = 'service_role'
    or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    or lower(auth.jwt() ->> 'email') = 'scarpatoweb@gmail.com',
    false
  );
$$;

-- Políticas de RLS para COMPANIES
drop policy if exists "Admin tem acesso total a companies" on public.companies;
create policy "Admin tem acesso total a companies"
    on public.companies
    for all
    to authenticated
    using (public.is_admin())
    with check (public.is_admin());

-- Políticas de RLS para PLATES
drop policy if exists "Admin tem acesso total a plates" on public.plates;
create policy "Admin tem acesso total a plates"
    on public.plates
    for all
    to authenticated
    using (public.is_admin())
    with check (public.is_admin());

-- Leitura pública para checagem da placa não ativada (/p/:code)
drop policy if exists "Leitura pública de placa por código" on public.plates;
create policy "Leitura pública de placa por código"
    on public.plates
    for select
    to anon, authenticated
    using (true);

-- Políticas de RLS para SCANS
drop policy if exists "Admin tem acesso total a scans" on public.scans;
create policy "Admin tem acesso total a scans"
    on public.scans
    for all
    to authenticated
    using (public.is_admin())
    with check (public.is_admin());

-- ============================================================================
-- 5. PROCEDURES / RPCs PARA PAGES FUNCTIONS E DASHBOARD
-- ============================================================================

-- RPC 1: Resolver Placa no Redirect /r/:code (Chamada pelo Cloudflare Pages Function)
create or replace function public.resolve_plate(p_code text)
returns table (
    plate_id uuid,
    code text,
    status text,
    review_url text,
    company_id uuid,
    company_name text
)
language plpgsql
security definer
set search_path = public
as $$
begin
    return query
    select
        p.id as plate_id,
        p.code,
        p.status,
        p.review_url,
        p.company_id,
        c.name as company_name
    from public.plates p
    left join public.companies c on c.id = p.company_id
    where upper(trim(p.code)) = upper(trim(p_code))
    limit 1;
end;
$$;

-- Permitir execução anônima e service_role na RPC de redirect
grant execute on function public.resolve_plate(text) to anon, authenticated, service_role;


-- RPC 2: Registrar Scan de Acesso (Chamada assíncrona em waitUntil)
create or replace function public.register_scan(
    p_plate_id uuid,
    p_company_id uuid default null,
    p_country text default null,
    p_city text default null,
    p_user_agent text default null,
    p_device_type text default null,
    p_ip_hash text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.scans (
        plate_id,
        company_id,
        country,
        city,
        user_agent,
        device_type,
        ip_hash,
        scanned_at
    ) values (
        p_plate_id,
        p_company_id,
        p_country,
        p_city,
        p_user_agent,
        p_device_type,
        p_ip_hash,
        now()
    );
end;
$$;

grant execute on function public.register_scan(uuid, uuid, text, text, text, text, text) to anon, authenticated, service_role;


-- RPC 3: Métricas Consolidadas do Dashboard Admin (/admin)
create or replace function public.get_admin_dashboard_metrics()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
    v_result json;
begin
    if not public.is_admin() then
        raise exception 'Acesso negado: apenas administradores.';
    end if;

    select json_build_object(
        'plates_stock', count(*) filter (where status = 'stock'),
        'plates_active', count(*) filter (where status = 'active'),
        'plates_disabled', count(*) filter (where status = 'disabled'),
        'sold_this_month', count(*) filter (where status = 'active' and activated_at >= date_trunc('month', now())),
        'total_companies', (select count(*) from public.companies),
        'scans_today', (select count(*) from public.scans where scanned_at >= date_trunc('day', now())),
        'scans_7d', (select count(*) from public.scans where scanned_at >= now() - interval '7 days'),
        'scans_30d', (select count(*) from public.scans where scanned_at >= now() - interval '30 days')
    )
    into v_result
    from public.plates;

    return v_result;
end;
$$;

grant execute on function public.get_admin_dashboard_metrics() to authenticated, service_role;


-- RPC 4: Relatório Detalhado de uma Empresa (/admin/empresas/:id)
create or replace function public.get_company_analytics(p_company_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
    v_company json;
    v_plates json;
    v_scans_by_day json;
    v_peak_hours json;
    v_devices json;
begin
    if not public.is_admin() then
        raise exception 'Acesso negado: apenas administradores.';
    end if;

    -- Dados da empresa
    select row_to_json(c) into v_company
    from public.companies c
    where c.id = p_company_id;

    -- Placas vinculadas
    select coalesce(json_agg(p order by p.created_at desc), '[]'::json) into v_plates
    from public.plates p
    where p.company_id = p_company_id;

    -- Scans por dia (últimos 30 dias)
    select coalesce(json_agg(t), '[]'::json) into v_scans_by_day
    from (
        select
            to_char(date_trunc('day', s.scanned_at), 'YYYY-MM-DD') as dia,
            count(*) as total
        from public.scans s
        where s.company_id = p_company_id
          and s.scanned_at >= now() - interval '30 days'
        group by 1
        order by 1 asc
    ) t;

    -- Horários de pico (0 a 23h)
    select coalesce(json_agg(t), '[]'::json) into v_peak_hours
    from (
        select
            extract(hour from s.scanned_at) as hora,
            count(*) as total
        from public.scans s
        where s.company_id = p_company_id
          and s.scanned_at >= now() - interval '30 days'
        group by 1
        order by 1 asc
    ) t;

    -- Tipos de dispositivos
    select coalesce(json_agg(t), '[]'::json) into v_devices
    from (
        select
            coalesce(s.device_type, 'Outro') as dispositivo,
            count(*) as total
        from public.scans s
        where s.company_id = p_company_id
          and s.scanned_at >= now() - interval '30 days'
        group by 1
        order by 2 desc
    ) t;

    return json_build_object(
        'company', v_company,
        'plates', v_plates,
        'scans_by_day', v_scans_by_day,
        'peak_hours', v_peak_hours,
        'devices', v_devices
    );
end;
$$;

grant execute on function public.get_company_analytics(uuid) to authenticated, service_role;


-- ============================================================================
-- 6. ATRIBUIR ROLE 'admin' AO USUÁRIO PRINCIPAL
-- ============================================================================
-- Atribui automaticamente role 'admin' no app_metadata para o e-mail cadastrado
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'admin')
where lower(email) = 'scarpatoweb@gmail.com';

-- Trigger para garantir que se o usuário for criado depois, ganhe a role 'admin'
create or replace function public.handle_admin_user_role()
returns trigger
language plpgsql
security definer
as $$
begin
    if lower(new.email) = 'scarpatoweb@gmail.com' then
        new.raw_app_meta_data := coalesce(new.raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'admin');
    end if;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created_assign_admin on auth.users;
create trigger on_auth_user_created_assign_admin
    before insert or update on auth.users
    for each row execute function public.handle_admin_user_role();


-- ============================================================================
-- 7. CARGA INICIAL: PLACAS DO LOTE DE TESTE (5 placas em estoque)
-- ============================================================================
insert into public.plates (code, batch, status) values
    ('DR4ATZDH', 'TESTE', 'stock'),
    ('RWN4QHQA', 'TESTE', 'stock'),
    ('7F6P49RP', 'TESTE', 'stock'),
    ('QS4DAUJR', 'TESTE', 'stock'),
    ('UGB7H4W7', 'TESTE', 'stock')
on conflict (code) do nothing;

-- ============================================================================
-- FIM DO SCHEMA
-- ============================================================================
