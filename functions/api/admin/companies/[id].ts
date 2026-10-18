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

  const serviceRoleKey = context.env.SUPABASE_SERVICE_ROLE_KEY;
  const authHeader = context.request.headers.get('Authorization') || '';
  const userToken = authHeader.replace('Bearer ', '').trim();

  try {
    // 1. Tenta RPC
    const rpcRes = await fetch(`${context.env.SUPABASE_URL}/rest/v1/rpc/get_company_analytics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: serviceRoleKey,
        Authorization: `Bearer ${userToken || serviceRoleKey}`,
      },
      body: JSON.stringify({ p_company_id: companyId }),
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

    // 2. Fallback direto via tabelas
    const [compRes, platesRes, scansRes] = await Promise.all([
      fetch(`${context.env.SUPABASE_URL}/rest/v1/companies?id=eq.${encodeURIComponent(companyId)}`, {
        headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` },
      }),
      fetch(`${context.env.SUPABASE_URL}/rest/v1/plates?company_id=eq.${encodeURIComponent(companyId)}&order=created_at.desc`, {
        headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` },
      }),
      fetch(`${context.env.SUPABASE_URL}/rest/v1/scans?company_id=eq.${encodeURIComponent(companyId)}&order=scanned_at.desc&limit=1000`, {
        headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` },
      }),
    ]);

    const compList = compRes.ok ? await compRes.json() : [];
    if (!compList || compList.length === 0) {
      return new Response(JSON.stringify({ error: 'Empresa não encontrada' }), { status: 404 });
    }

    const company = compList[0];
    const plates = platesRes.ok ? await platesRes.json() : [];
    const scans: any[] = scansRes.ok ? await scansRes.json() : [];

    // Agrupamento de scans por dia
    const dayMap = new Map<string, number>();
    const hourMap = new Map<number, number>();
    const deviceMap = new Map<string, number>();

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    for (const s of scans) {
      const time = new Date(s.scanned_at).getTime();
      if (time >= thirtyDaysAgo) {
        const d = s.scanned_at.substring(0, 10);
        dayMap.set(d, (dayMap.get(d) || 0) + 1);

        const h = new Date(s.scanned_at).getHours();
        hourMap.set(h, (hourMap.get(h) || 0) + 1);

        const dev = s.device_type || 'Outro';
        deviceMap.set(dev, (deviceMap.get(dev) || 0) + 1);
      }
    }

    const scans_by_day = Array.from(dayMap.entries())
      .map(([dia, total]) => ({ dia, total }))
      .sort((a, b) => a.dia.localeCompare(b.dia));

    const peak_hours = Array.from(hourMap.entries())
      .map(([hora, total]) => ({ hora, total }))
      .sort((a, b) => a.hora - b.hora);

    const devices = Array.from(deviceMap.entries())
      .map(([dispositivo, total]) => ({ dispositivo, total }))
      .sort((a, b) => b.total - a.total);

    return new Response(
      JSON.stringify({
        company,
        plates,
        scans_by_day,
        peak_hours,
        devices,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
