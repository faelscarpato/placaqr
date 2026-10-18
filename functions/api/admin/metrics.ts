interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

// Valida JWT do Supabase e permissão de admin
async function verifyAdminAuth(request: Request, env: Env): Promise<{ authorized: boolean; email?: string }> {
  const authHeader = request.headers.get('Authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    return { authorized: false };
  }
  const token = authHeader.replace('Bearer ', '').trim();

  try {
    const res = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: env.SUPABASE_ANON_KEY || env.SUPABASE_SERVICE_ROLE_KEY,
      },
    });

    if (!res.ok) return { authorized: false };
    const user = await res.json() as any;

    const isAdmin = user?.app_metadata?.role === 'admin' || user?.email?.toLowerCase() === 'scarpatoweb@gmail.com';
    return { authorized: isAdmin, email: user?.email };
  } catch (err) {
    console.error('Erro na validação do token admin:', err);
    return { authorized: false };
  }
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const auth = await verifyAdminAuth(context.request, context.env);
  if (!auth.authorized) {
    return new Response(JSON.stringify({ error: 'Acesso não autorizado. É necessário perfil de Administrador.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }

  try {
    const serviceRoleKey = context.env.SUPABASE_SERVICE_ROLE_KEY;
    const rpcRes = await fetch(`${context.env.SUPABASE_URL}/rest/v1/rpc/get_admin_dashboard_metrics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    });

    if (!rpcRes.ok) {
      const errText = await rpcRes.text();
      return new Response(JSON.stringify({ error: errText }), { status: 500 });
    }

    const data = await rpcRes.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
