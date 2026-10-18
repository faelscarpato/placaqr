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

  const serviceRoleKey = context.env.SUPABASE_SERVICE_ROLE_KEY;
  const authHeader = context.request.headers.get('Authorization') || '';
  const userToken = authHeader.replace('Bearer ', '').trim();

  try {
    // 1. Tenta via RPC usando o token do usuário admin ou service_role
    const rpcRes = await fetch(`${context.env.SUPABASE_URL}/rest/v1/rpc/get_admin_dashboard_metrics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: serviceRoleKey,
        Authorization: `Bearer ${userToken || serviceRoleKey}`,
      },
    });

    if (rpcRes.ok) {
      const data = await rpcRes.json();
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      });
    }

    // 2. Fallback resiliente direto pelas tabelas (ignora RLS com service_role)
    const [platesRes, compRes, scansRes] = await Promise.all([
      fetch(`${context.env.SUPABASE_URL}/rest/v1/plates?select=status,activated_at`, {
        headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` },
      }),
      fetch(`${context.env.SUPABASE_URL}/rest/v1/companies?select=id`, {
        headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` },
      }),
      fetch(`${context.env.SUPABASE_URL}/rest/v1/scans?select=scanned_at`, {
        headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` },
      }),
    ]);

    const plates: any[] = platesRes.ok ? await platesRes.json() : [];
    const companies: any[] = compRes.ok ? await compRes.json() : [];
    const scans: any[] = scansRes.ok ? await scansRes.json() : [];

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;

    let plates_stock = 0;
    let plates_active = 0;
    let plates_disabled = 0;
    let sold_this_month = 0;

    for (const p of plates) {
      if (p.status === 'stock') plates_stock++;
      else if (p.status === 'active') {
        plates_active++;
        if (p.activated_at && new Date(p.activated_at).getTime() >= startOfMonth) {
          sold_this_month++;
        }
      } else if (p.status === 'disabled') {
        plates_disabled++;
      }
    }

    let scans_today = 0;
    let scans_7d = 0;
    let scans_30d = 0;

    for (const s of scans) {
      const scanTime = new Date(s.scanned_at).getTime();
      if (scanTime >= startOfDay) scans_today++;
      if (scanTime >= sevenDaysAgo) scans_7d++;
      if (scanTime >= thirtyDaysAgo) scans_30d++;
    }

    const calculated = {
      plates_stock,
      plates_active,
      plates_disabled,
      sold_this_month,
      total_companies: companies.length,
      scans_today,
      scans_7d,
      scans_30d,
    };

    return new Response(JSON.stringify(calculated), {
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
