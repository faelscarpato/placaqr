interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

interface RouteParams {
  id: string;
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

export const onRequestGet: PagesFunction<Env, 'id', RouteParams> = async (context) => {
  if (!await verifyAdminAuth(context.request, context.env)) {
    return new Response(JSON.stringify({ error: 'Não autorizado' }), { status: 401 });
  }

  const companyId = context.params.id;
  if (!companyId) {
    return new Response(JSON.stringify({ error: 'ID da empresa é obrigatório' }), { status: 400 });
  }

  try {
    const rpcRes = await fetch(`${context.env.SUPABASE_URL}/rest/v1/rpc/get_company_analytics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: context.env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${context.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ p_company_id: companyId }),
    });

    if (!rpcRes.ok) {
      const err = await rpcRes.text();
      return new Response(JSON.stringify({ error: err }), { status: 500 });
    }

    const data = await rpcRes.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
