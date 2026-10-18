interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

async function verifyAdminAuth(request: Request, env: Env): Promise<boolean> {
  const authHeader = request.headers.get('Authorization') || '';
  if (!authHeader.startsWith('Bearer ')) return false;
  const token = authHeader.replace('Bearer ', '').trim();

  try {
    const res = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: env.SUPABASE_ANON_KEY || env.SUPABASE_SERVICE_ROLE_KEY,
      },
    });
    if (!res.ok) return false;
    const user = await res.json() as any;
    return user?.app_metadata?.role === 'admin' || user?.email?.toLowerCase() === 'scarpatoweb@gmail.com';
  } catch {
    return false;
  }
}

// GET: Listar placas com suporte a busca e filtros
export const onRequestGet: PagesFunction<Env> = async (context) => {
  if (!await verifyAdminAuth(context.request, context.env)) {
    return new Response(JSON.stringify({ error: 'Não autorizado' }), { status: 401 });
  }

  const url = new URL(context.request.url);
  const search = url.searchParams.get('q') || '';
  const status = url.searchParams.get('status') || '';
  const batch = url.searchParams.get('batch') || '';

  let query = `${context.env.SUPABASE_URL}/rest/v1/plates?select=*,companies(*)&order=created_at.desc`;
  if (status && status !== 'all') {
    query += `&status=eq.${encodeURIComponent(status)}`;
  }
  if (batch && batch !== 'all') {
    query += `&batch=eq.${encodeURIComponent(batch)}`;
  }
  if (search) {
    query += `&code=ilike.*${encodeURIComponent(search)}*`;
  }

  const res = await fetch(query, {
    headers: {
      apikey: context.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${context.env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};

// POST: Ativar uma placa (venda e associação à empresa)
export const onRequestPost: PagesFunction<Env> = async (context) => {
  if (!await verifyAdminAuth(context.request, context.env)) {
    return new Response(JSON.stringify({ error: 'Não autorizado' }), { status: 401 });
  }

  const body = await context.request.json() as {
    code: string;
    company_id?: string;
    company_name?: string;
    company_phone?: string;
    company_city?: string;
    review_url: string;
    sale_amount?: number;
    payment_method?: string;
    activated_at?: string;
  };

  const code = (body.code || '').trim().toUpperCase();
  if (!code || !body.review_url) {
    return new Response(JSON.stringify({ error: 'Código da placa e link de avaliação são obrigatórios.' }), { status: 400 });
  }

  const serviceKey = context.env.SUPABASE_SERVICE_ROLE_KEY;
  let companyId = body.company_id;

  // Se não passou company_id mas passou company_name -> cria ou busca a empresa
  if (!companyId && body.company_name) {
    const compRes = await fetch(`${context.env.SUPABASE_URL}/rest/v1/companies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        name: body.company_name.trim(),
        phone: body.company_phone?.trim() || null,
        city: body.company_city?.trim() || null,
      }),
    });
    if (compRes.ok) {
      const newComps = await compRes.json() as any[];
      if (newComps && newComps.length > 0) {
        companyId = newComps[0].id;
      }
    }
  }

  // Atualiza ou insere a placa como 'active'
  const updateRes = await fetch(`${context.env.SUPABASE_URL}/rest/v1/plates?code=eq.${encodeURIComponent(code)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({
      status: 'active',
      company_id: companyId || null,
      review_url: body.review_url.trim(),
      sale_amount: body.sale_amount || null,
      payment_method: body.payment_method || null,
      activated_at: body.activated_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }),
  });

  if (!updateRes.ok) {
    const errText = await updateRes.text();
    return new Response(JSON.stringify({ error: `Erro ao ativar placa: ${errText}` }), { status: 500 });
  }

  const updatedPlates = await updateRes.json() as any[];
  if (!updatedPlates || updatedPlates.length === 0) {
    // Placa não existia, cria diretamente
    const createRes = await fetch(`${context.env.SUPABASE_URL}/rest/v1/plates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        code,
        batch: 'AVULSO',
        status: 'active',
        company_id: companyId || null,
        review_url: body.review_url.trim(),
        sale_amount: body.sale_amount || null,
        payment_method: body.payment_method || null,
        activated_at: body.activated_at || new Date().toISOString(),
      }),
    });
    const created = await createRes.json();
    return new Response(JSON.stringify(created), { status: 201 });
  }

  return new Response(JSON.stringify(updatedPlates[0]), { status: 200 });
};

// PATCH: Atualização rápida de placa (desativar, reativar, alterar review_url, reatribuir)
export const onRequestPatch: PagesFunction<Env> = async (context) => {
  if (!await verifyAdminAuth(context.request, context.env)) {
    return new Response(JSON.stringify({ error: 'Não autorizado' }), { status: 401 });
  }

  const body = await context.request.json() as {
    id: string;
    status?: 'stock' | 'active' | 'disabled';
    review_url?: string;
    company_id?: string | null;
  };

  if (!body.id) {
    return new Response(JSON.stringify({ error: 'ID da placa é obrigatório.' }), { status: 400 });
  }

  const payload: any = { updated_at: new Date().toISOString() };
  if (body.status !== undefined) payload.status = body.status;
  if (body.review_url !== undefined) payload.review_url = body.review_url;
  if (body.company_id !== undefined) payload.company_id = body.company_id;

  const res = await fetch(`${context.env.SUPABASE_URL}/rest/v1/plates?id=eq.${encodeURIComponent(body.id)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      apikey: context.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${context.env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  return new Response(JSON.stringify(data), { status: res.status });
};
