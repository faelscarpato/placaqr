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

export const onRequestGet: PagesFunction<Env> = async (context) => {
  if (!await verifyAdminAuth(context.request, context.env)) {
    return new Response(JSON.stringify({ error: 'Não autorizado' }), { status: 401 });
  }

  // Busca empresas com contagem de placas
  const res = await fetch(`${context.env.SUPABASE_URL}/rest/v1/companies?select=*,plates(count)&order=name.asc`, {
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

export const onRequestPost: PagesFunction<Env> = async (context) => {
  if (!await verifyAdminAuth(context.request, context.env)) {
    return new Response(JSON.stringify({ error: 'Não autorizado' }), { status: 401 });
  }

  const body = await context.request.json() as {
    name: string;
    phone?: string;
    city?: string;
  };

  if (!body.name) {
    return new Response(JSON.stringify({ error: 'Nome da empresa é obrigatório.' }), { status: 400 });
  }

  const res = await fetch(`${context.env.SUPABASE_URL}/rest/v1/companies`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      apikey: context.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${context.env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({
      name: body.name.trim(),
      phone: body.phone?.trim() || null,
      city: body.city?.trim() || null,
    }),
  });

  const data = await res.json();
  return new Response(JSON.stringify(data), { status: res.status });
};
