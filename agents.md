Você é um engenheiro full-stack sênior. Crie do zero, neste diretório, um projeto
chamado "placa-qr": sistema de placas de avaliação do Google com QR Code dinâmico,
hospedado no Cloudflare PAGES (com Pages Functions), usando o domínio *.pages.dev.

## Objetivo do negócio
Eu imprimo placas com QR codes pré-gerados, cada um apontando para
https://<DOMINIO>/r/<CODIGO>. Cada código começa "em estoque". Quando vendo a placa,
eu escaneio o QR, cadastro a empresa e o link de avaliação do Google, e ativo.
Depois disso, quem escanear é redirecionado ao link da empresa, e cada scan é
registrado para métricas.

## Stack (obrigatória)
- Cloudflare Pages + Pages Functions. NÃO usar Workers standalone.
- Front-end: Vite + React + TypeScript + Tailwind, em /web (build em /web/dist),
  mobile-first (uso principal no celular).
- Backend: Pages Functions em /functions na RAIZ do projeto (file-based routing):
  - functions/api/health.ts            -> GET /api/health
  - functions/r/[code].ts              -> GET /r/:code  (redirect)
  - functions/api/[[path]].ts          -> demais rotas /api/* (fase 2)
- Dados e login: Supabase (Postgres + Auth). As Functions acessam o Supabase via
  REST/RPC com a SERVICE_ROLE key guardada como secret do Pages (context.env), nunca
  no front. O front usa apenas a anon key + Supabase Auth.
- Variáveis: SUPABASE_URL e SUPABASE_ANON_KEY (variáveis normais),
  SUPABASE_SERVICE_ROLE_KEY (secret).
- Use `context.waitUntil()` para gravar o scan sem atrasar o redirect, e
  `request.cf` (país/cidade) quando disponível.

## Arquivos de configuração do Pages (colocar em /web/public para irem ao /dist)
1. _routes.json: executar Functions SOMENTE em /r/* e /api/*, para que a SPA seja
   servida como estático (não gastar cota de Functions):
   { "version": 1, "include": ["/r/*", "/api/*"], "exclude": [] }
2. _redirects: fallback da SPA:
   /* /index.html 200
   (Obs.: _redirects não vale para rotas atendidas por Functions; por isso as rotas
   /r/* e /api/* ficam no _routes.json.)
3. _headers: segurança básica (X-Content-Type-Options, Referrer-Policy,
   frame-ancestors none) e cache-control: no-store para /r/*.

## FASE 1 (fazer AGORA e fazer o deploy)
Objetivo: ter o sistema no ar para eu obter o endereço público *.pages.dev.
1. Estruture o projeto (package.json na raiz com scripts: "dev", "build" (builda
   /web), "deploy" (build + wrangler pages deploy)). Instale wrangler como devDependency.
2. Crie wrangler.toml na raiz com name="placa-qr",
   pages_build_output_dir="./web/dist" e compatibility_date atual.
3. Functions em modo mock (sem Supabase ainda):
   - GET /api/health -> JSON { ok: true, time: ISO }
   - GET /r/:code -> responde 302 para /p/:code (Location relativo ou absoluto
     com a origem da requisição). Usar 302, NUNCA 301.
4. Front com páginas mínimas:
   - "/"          -> "Placa QR no ar"
   - "/p/:code"   -> "Placa <code> ainda não ativada"
   - "/admin"     -> placeholder "Painel"
   Use react-router (BrowserRouter).
5. Build e deploy:
   - `npx wrangler pages project create placa-qr --production-branch main`
   - `npm run build`
   - `npx wrangler pages deploy ./web/dist --project-name placa-qr`
   Atenção: rode o deploy a partir da RAIZ do projeto, para o wrangler encontrar a
   pasta /functions. Se pedir login, pare e me diga o comando exato
   (`npx wrangler login`) para eu executar.
6. Valide com curl: /api/health (200 JSON), /r/TESTE (302 com Location /p/TESTE) e
   /admin (200 devolvendo o index.html da SPA).
7. Escreva a URL final (https://placa-qr.pages.dev ou a que o wrangler informar) no
   README.md e PARE para eu confirmar.

## FASE 2 (só depois que eu confirmar)
Vou colar o SQL do Supabase. Implementar:
- Auth por e-mail/senha (Supabase Auth). Rotas /admin/* protegidas; apenas usuários
  com role "admin" (app_metadata) acessam. As Functions /api/admin/* validam o JWT
  do Supabase no header Authorization antes de qualquer operação.(USAR ESSE LOGIN: EMAIL: scarpatoweb@gmail.com, SENHA: Rs9546@Fael) para admin ja cadastrado e nao precisar criar acesso.
- functions/r/[code].ts:
  1. Busca a placa via RPC Supabase `resolve_plate(p_code)`.
  2. status "active" -> registra scan em waitUntil (user-agent, país/cidade,
     hash do IP com sal) e responde 302 para o review_url da empresa.
  3. status "stock" -> 302 para /p/:code.
  4. "disabled" ou inexistente -> página HTML simples "Placa indisponível" (404).
  Sempre com Cache-Control: no-store.
- /p/:code: página pública "Placa não ativada". Se houver sessão admin, mostra o
  formulário de ativação com o código preenchido.
- /admin (dashboard): cards (placas em estoque, ativas, vendidas no mês, scans
  hoje/7d/30d) e lista de empresas.
- /admin/ativar: formulário com leitura do QR pela câmera (BarcodeDetector com
  fallback html5-qrcode, extraindo o código da URL /r/CODIGO) ou digitação manual;
  empresa (buscar existente ou criar: nome, telefone, cidade); link de avaliação do
  Google (validar domínios g.page/r/, search.google.com/local/writereview, g.co e
  google.com) com botão "Testar link"; valor da venda, forma de pagamento, data.
- /admin/placas: tabela com filtros (status, lote), busca por código e ações:
  desativar, reativar, reatribuir empresa, editar link.
- /admin/empresas/:id: dados, placas, gráfico de scans por dia (30d), horários de
  pico, dispositivos e botão "Gerar relatório" (texto pronto para WhatsApp).
- Visual limpo e moderno, botões grandes, acento azul.

## Qualidade
- TypeScript estrito, tratamento de erros, estados de loading.
- Nenhuma chave secreta no front nem no repositório. Incluir .gitignore,
  .dev.vars.example e README com passo a passo: criar projeto Supabase, configurar
  secrets (`npx wrangler pages secret put SUPABASE_SERVICE_ROLE_KEY --project-name placa-qr`),
  deploy e como ligar um domínio próprio depois (Pages > Custom domains).
- Desenvolvimento local com `npx wrangler pages dev ./web/dist`.

Comece pela FASE 1 e só avance quando eu autorizar.