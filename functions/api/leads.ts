interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  ADMIN_EMAIL?: string;
  RESEND_API_KEY?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = (await context.request.json()) as {
      name?: string;
      whatsapp?: string;
      email?: string;
      interests?: string[];
      source_plate?: string;
      action?: string;
    };

    const supabaseUrl = context.env.SUPABASE_URL;
    const serviceRoleKey = context.env.SUPABASE_SERVICE_ROLE_KEY || context.env.SUPABASE_ANON_KEY;
    const recipientEmail = context.env.ADMIN_EMAIL || 'scarpatoweb@gmail.com';

    const leadData = {
      name: (body.name || '').trim() || null,
      whatsapp: (body.whatsapp || '').trim() || null,
      email: (body.email || '').trim().toLowerCase() || null,
      interests: Array.isArray(body.interests) ? body.interests : [],
      source_plate: body.source_plate || 'unknown',
      action: body.action || 'unknown',
      created_at: new Date().toISOString(),
      status: 'new',
    };

    // 1. Grava o lead no Supabase se as variáveis de ambiente estiverem disponíveis
    let insertedLead: any = null;
    if (supabaseUrl && serviceRoleKey) {
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/leads`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
            Prefer: 'return=representation',
          },
          body: JSON.stringify(leadData),
        });

        if (response.ok) {
          const resJson = await response.json();
          insertedLead = Array.isArray(resJson) ? resJson[0] : resJson;
        } else {
          console.error('Erro ao salvar lead no Supabase:', await response.text());
        }
      } catch (err) {
        console.error('Falha de conexão com o Supabase ao salvar lead:', err);
      }
    }

    // 2. Dispara notificação por e-mail em background sem atrasar a resposta
    context.waitUntil(
      (async () => {
        try {
          // Se houver RESEND_API_KEY configurada no Cloudflare Pages, envia o e-mail formatado
          if (context.env.RESEND_API_KEY) {
            const interestLabels: Record<string, string> = {
              placa_google: '⭐ Placa de Avaliação Inteligente do Google',
              google_empresas: '📍 Cadastro e Otimização no Google Meu Negócio',
            };

            const interestsFormatted = (leadData.interests || [])
              .map((i: string) => `• ${interestLabels[i] || i}`)
              .join('<br />');

            const emailHtml = `
              <h2>Novo Lead Capturado no Placa QR!</h2>
              <p>Um visitante acabou de gerar uma placa e demonstrou interesse em seus serviços:</p>
              <hr />
              <p><strong>Nome:</strong> ${leadData.name || 'Não informado'}</p>
              <p><strong>WhatsApp:</strong> ${leadData.whatsapp || 'Não informado'}</p>
              <p><strong>E-mail:</strong> ${leadData.email || 'Não informado'}</p>
              <p><strong>Origem da Placa:</strong> ${leadData.source_plate.toUpperCase()}</p>
              <p><strong>Ação Realizada:</strong> ${leadData.action === 'print' ? 'Impressão' : 'Download PNG'}</p>
              <p><strong>Interesses Marcados:</strong><br />${interestsFormatted || 'Nenhum selecionado'}</p>
              <p><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</p>
              <hr />
              <p><small>Mensagem automática enviada pelo sistema Placa QR.</small></p>
            `;

            await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${context.env.RESEND_API_KEY}`,
              },
              body: JSON.stringify({
                from: 'Placa QR <notificacoes@placaqr.pages.dev>',
                to: [recipientEmail],
                subject: `🚨 Novo Lead Comercial: ${leadData.name || leadData.whatsapp || 'Interessado no Google'}`,
                html: emailHtml,
              }),
            });
          }
        } catch (mailErr) {
          console.error('Erro ao enviar notificação de e-mail:', mailErr);
        }
      })()
    );

    return new Response(
      JSON.stringify({
        success: true,
        lead: insertedLead || leadData,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Erro na rota POST /api/leads:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Falha ao processar captura de lead',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
};
