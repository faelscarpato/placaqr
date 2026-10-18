# Placa QR — Sistema de Placas de Avaliação do Google com QR Code Dinâmico

Sistema moderno hospedado no **Cloudflare Pages** (com **Pages Functions**) e **Supabase**, projetado para placas físicas com QR Codes pré-gerados e redirecionamento dinâmico para avaliações do Google.

---

## 🌐 Endereço da Aplicação (Cloudflare Pages)

- **URL do Projeto em Produção:**
  - [https://placaqr.pages.dev](https://placaqr.pages.dev)

---

## 🏗️ Arquitetura e Stack

- **Hospedagem & Backend:** Cloudflare Pages + Pages Functions (`/functions` na raiz).
- **Front-end:** Vite + React + TypeScript + Tailwind CSS (em `/web`, com build gerado em `/web/dist`), interface mobile-first com botões amplos e acento azul.
- **Banco de Dados & Autenticação:** Supabase (PostgreSQL + Auth).
- **Redirecionamento:** HTTP 302 direto via Pages Functions com `Cache-Control: no-store` para `/r/:code`.

---

## 📁 Estrutura do Projeto

```
placa-qr/
├── functions/                     # Pages Functions (Backend serverless)
│   ├── api/
│   │   ├── health.ts              # GET /api/health
│   │   └── [[path]].ts            # Fallback de APIs
│   └── r/
│       └── [code].ts              # GET /r/:code (Redirect 302 dinâmico)
├── web/                           # Front-end SPA (Vite + React + TS)
│   ├── public/
│   │   ├── _headers               # Regras de segurança e no-cache
│   │   ├── _redirects             # Fallback da SPA (/* /index.html 200)
│   │   └── _routes.json           # Executa Functions apenas em /r/* e /api/*
│   └── src/
│       ├── pages/
│       │   ├── Home.tsx           # "/" -> "Placa QR no ar"
│       │   ├── PlatePending.tsx   # "/p/:code" -> "Placa <code> ainda não ativada"
│       │   └── AdminPlaceholder.tsx # "/admin" -> Painel Administrativo
│       ├── App.tsx
│       ├── main.tsx
│       └── index.css
├── .dev.vars.example              # Exemplo de variáveis locais do Cloudflare
├── .gitignore
├── package.json                   # Workspaces e scripts raiz (dev, build, deploy)
├── wrangler.toml                  # Configuração do Cloudflare Pages (placaqr)
└── README.md
```

---

## 🚀 Como Rodar Localmente

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Compilar o Front-end:**
   ```bash
   npm run build
   ```

3. **Executar com o emulador do Cloudflare Pages (Pages Functions + SPA):**
   ```bash
   npm run dev
   # ou: npx wrangler pages dev ./web/dist
   ```

---

## 🔐 Configuração do Supabase & Secrets (Fase 2)

### 1. Criar projeto no Supabase
1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto.
2. Copie a **URL do projeto**, a **chave anon** e a chave **service_role**.

### 2. Configurar Secrets no Cloudflare Pages
As variáveis secretas ficam protegidas no Cloudflare Pages e nunca são expostas ao front-end:
```bash
npx wrangler pages secret put SUPABASE_SERVICE_ROLE_KEY --project-name placaqr
```

Para variáveis normais (acessíveis no build / functions):
```bash
npx wrangler pages secret put SUPABASE_URL --project-name placaqr
npx wrangler pages secret put SUPABASE_ANON_KEY --project-name placaqr
```

python gerar_qr.py --base-url https://placaqr.pages.dev/r --qtd 100 --lote L001 --prefixo ""

---

## 🏷️ Como Configurar Domínio Próprio

1. No painel do Cloudflare: acesse **Workers & Pages** > selecione **placaqr**.
2. Vá até a aba **Custom domains**.
3. Clique em **Set up a domain** e digite o domínio desejado (ex: `avaliacao.seudominio.com.br`).
4. O Cloudflare configurará o DNS e o certificado SSL automaticamente.
