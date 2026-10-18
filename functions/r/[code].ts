interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

interface RouteParams {
  code: string;
}

interface PlateResolveResult {
  plate_id: string;
  code: string;
  status: 'stock' | 'active' | 'disabled';
  review_url: string | null;
  company_id: string | null;
  company_name: string | null;
}

function escapeHtml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeJs(str: string): string {
  return (str || '')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}

// Função utilitária para hash seguro de IP (com sal para privacidade)
async function hashIp(ip: string): Promise<string> {
  const salt = 'placa-qr-salt-2026';
  const data = new TextEncoder().encode(ip + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
}

// Detecta tipo de dispositivo a partir do User-Agent
function detectDeviceType(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (/mobile|iphone|ipod|android.*mobile|blackberry|iemobile|opera mini/i.test(ua)) {
    return 'Mobile';
  }
  if (/tablet|ipad|android(?!.*mobile)/i.test(ua)) {
    return 'Tablet';
  }
  return 'Desktop';
}

export const onRequestGet: PagesFunction<Env, 'code', RouteParams> = async (context) => {
  const code = (context.params.code || '').trim().toUpperCase();
  const url = new URL(context.request.url);

  const supabaseUrl = context.env.SUPABASE_URL;
  const serviceRoleKey = context.env.SUPABASE_SERVICE_ROLE_KEY || context.env.SUPABASE_ANON_KEY;

  if (!code || !supabaseUrl || !serviceRoleKey) {
    // Redirecionamento de contingência para página da placa
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${url.origin}/p/${encodeURIComponent(code)}`,
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    });
  }

  try {
    // 1. Consulta RPC resolve_plate no Supabase
    const rpcResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/resolve_plate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({ p_code: code }),
    });

    if (!rpcResponse.ok) {
      console.error('Erro na RPC resolve_plate:', await rpcResponse.text());
      return new Response(null, {
        status: 302,
        headers: {
          Location: `${url.origin}/p/${encodeURIComponent(code)}`,
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
      });
    }

    const plates: PlateResolveResult[] = await rpcResponse.json();
    const plate = plates && plates.length > 0 ? plates[0] : null;

    // Se a placa não existe ou está desativada -> Página 404 "Placa indisponível"
    if (!plate || plate.status === 'disabled') {
      const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Placa Indisponível — Placa QR</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #0f172a; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 1.5rem; text-align: center; }
    .card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1.5rem; padding: 2.5rem 2rem; max-width: 420px; width: 100%; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }
    .icon { width: 56px; height: 56px; margin: 0 auto 1.5rem; background: #fee2e2; color: #dc2626; border-radius: 1rem; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: bold; }
    h1 { font-size: 1.5rem; font-weight: 800; margin: 0 0 0.5rem; }
    p { font-size: 0.875rem; color: #64748b; line-height: 1.5; margin: 0 0 1.5rem; }
    .code { font-family: monospace; font-weight: bold; background: #f1f5f9; padding: 0.25rem 0.75rem; border-radius: 0.5rem; display: inline-block; margin-bottom: 1rem; color: #334155; }
    a { display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; font-weight: 600; padding: 0.75rem 1.5rem; border-radius: 0.75rem; font-size: 0.875rem; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">!</div>
    <div class="code">${code}</div>
    <h1>Placa indisponível</h1>
    <p>Esta placa com QR Code está temporariamente desativada ou não foi encontrada no sistema.</p>
    <a href="/">Ir para a página inicial</a>
  </div>
</body>
</html>`;

      return new Response(html, {
        status: 404,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
      });
    }

    // Se está em estoque -> Redireciona 302 para /p/:code
    if (plate.status === 'stock') {
      return new Response(null, {
        status: 302,
        headers: {
          Location: `${url.origin}/p/${encodeURIComponent(code)}`,
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          Pragma: 'no-cache',
        },
      });
    }

    // Se está ativa (status === 'active') e possui link de avaliação -> Redireciona para o review_url e registra scan em waitUntil
    if (plate.status === 'active' && plate.review_url) {
      const userAgent = context.request.headers.get('user-agent') || '';
      const clientIp = context.request.headers.get('cf-connecting-ip') || context.request.headers.get('x-forwarded-for') || '127.0.0.1';
      const cf = (context.request as any).cf;
      const country = cf?.country || null;
      const city = cf?.city || null;
      const deviceType = detectDeviceType(userAgent);

      // Executa o registro de métricas em background sem atrasar a resposta
      context.waitUntil(
        (async () => {
          try {
            const ipHash = await hashIp(clientIp);
            await fetch(`${supabaseUrl}/rest/v1/rpc/register_scan`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                apikey: serviceRoleKey,
                Authorization: `Bearer ${serviceRoleKey}`,
              },
              body: JSON.stringify({
                p_plate_id: plate.plate_id,
                p_company_id: plate.company_id,
                p_country: country,
                p_city: city,
                p_user_agent: userAgent.substring(0, 500),
                p_device_type: deviceType,
                p_ip_hash: ipHash,
              }),
            });
          } catch (err) {
            console.error('Falha ao registrar scan:', err);
          }
        })()
      );

      const safeTargetUrl = plate.review_url;
      const safeTargetUrlHtml = escapeHtml(safeTargetUrl);
      const safeTargetUrlJs = escapeJs(safeTargetUrl);
      const safeCodeJs = escapeJs(code);
      const safeCompanyIdJs = escapeJs(plate.company_id || '');
      const safeCompanyNameJs = escapeJs(plate.company_name || '');
      const safeDeviceTypeJs = escapeJs(deviceType);

      // Retorna resposta HTML instantânea com gtag.js para rastrear no Google Analytics e redirecionar imediatamente
      const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Redirecionando...</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="refresh" content="3;url=${safeTargetUrlHtml}">
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-X03TXPQ9BR"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'G-X03TXPQ9BR', {
      page_path: '/r/' + '${safeCodeJs}',
      page_title: 'Redirect Scan - ${safeCodeJs}',
      transport_type: 'beacon'
    });

    var redirected = false;
    function doRedirect() {
      if (!redirected) {
        redirected = true;
        window.location.replace('${safeTargetUrlJs}');
      }
    }

    // Dispara evento no GA4 e redireciona via callback
    gtag('event', 'scan_redirect', {
      plate_code: '${safeCodeJs}',
      company_id: '${safeCompanyIdJs}',
      company_name: '${safeCompanyNameJs}',
      device_type: '${safeDeviceTypeJs}',
      destination_url: '${safeTargetUrlJs}',
      event_callback: function() {
        doRedirect();
      }
    });

    // Fallback de segurança: redireciona em 120ms mesmo se o GA falhar ou for bloqueado por adblock
    setTimeout(doRedirect, 120);
  </script>
  <noscript>
    <meta http-equiv="refresh" content="0;url=${safeTargetUrlHtml}">
  </noscript>
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: #f8fafc;
      color: #334155;
      text-align: center;
      padding: 1.5rem;
    }
    .spinner {
      width: 42px;
      height: 42px;
      border: 4px solid #e2e8f0;
      border-top-color: #2563eb;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 1.25rem;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    a {
      color: #2563eb;
      text-decoration: underline;
      font-size: 0.875rem;
      margin-top: 1.25rem;
    }
  </style>
</head>
<body>
  <div class="spinner"></div>
  <p style="font-weight: 600; font-size: 1.125rem; margin: 0 0 0.5rem 0;">Redirecionando para avaliação...</p>
  <p style="color: #64748b; font-size: 0.875rem; margin: 0;">Você será transferido para a página oficial do Google em instantes.</p>
  <a href="${safeTargetUrlHtml}">Clique aqui se não for redirecionado automaticamente</a>
</body>
</html>`;

      return new Response(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          Pragma: 'no-cache',
        },
      });
    }

    // Fallback caso não tenha review_url configurado
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${url.origin}/p/${encodeURIComponent(code)}`,
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    });
  } catch (error) {
    console.error('Erro no redirect /r/:code:', error);
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${url.origin}/p/${encodeURIComponent(code)}`,
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    });
  }
};
