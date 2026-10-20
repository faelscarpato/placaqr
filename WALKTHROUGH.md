# Walkthrough: Landing Page de Alta Conversão com Geradores de Pix, Wi-Fi e Funil da Placa Google

Implementamos com rigor técnico e acabamento de alto nível a evolução completa da página inicial pública (`/`), transformando-a em uma plataforma de atração de lojistas (*Lead Magnet*) com geradores de placas de **Pix** e **Wi-Fi** gratuitos, além da vitrine exclusiva de vendas da **Placa de Avaliação Inteligente do Google**.

---

## 1. O que foi Implementado

### A. Motor Oficial do Pix (EMVCo BR Code + CRC16-CCITT)
* Arquivo: [`web/src/utils/pixPayload.ts`](web/src/utils/pixPayload.ts)
* Segue a especificação oficial do Banco Central do Brasil no formato TLV (*Tag-Length-Value*).
* Suporta tipos de chaves: Telefone (+55 automático), CPF, CNPJ, E-mail e Chave Aleatória (EVP).
* Sanitização automática de caracteres e remoção de acentos exigida pelo BACEN.
* Cálculo matemático rigoroso do checksum **CRC16-CCITT** (polinômio `0x1021`, inicial `0xFFFF`).
* Gera string autêntica do **Pix Copia e Cola** testável em qualquer aplicativo de banco (Nubank, Itaú, Bradesco, Inter, BB, Mercado Pago, etc.).

### B. Motor Universal de Conexão Wi-Fi (ZXing / iOS / Android)
* Arquivo: [`web/src/utils/wifiPayload.ts`](web/src/utils/wifiPayload.ts)
* Gera o formato `WIFI:T:<WPA|WEP|nopass>;S:<SSID>;P:<senha>;H:<true|false>;;`.
* Suporta redes WPA/WPA2/WPA3, WEP e Abertas, com escape de caracteres especiais e suporte a redes ocultas.
* Conexão imediata ao apontar a câmera do iPhone ou Android.

### C. Design Vetorial das Placas com Acabamento Idêntico ao da Placa Google
* Arquivo: [`web/src/components/landing/PlateSvgCanvas.tsx`](web/src/components/landing/PlateSvgCanvas.tsx)
* Proporção matemática idêntica ao `MODELO.svg` da placa Google (`viewBox="0 0 576.16 819.45"`).
* Efeito de acrílico cristal com chanfros, corte a laser, bordas internas bisotadas e reflexo de luz diagonal.
* Cantoneiras de mira estilizadas para enquadramento do QR Code sobre fundo branco absoluto.
* **3 Estilos de Acabamento Selecionáveis**:
  1. **Acrílico Cristal Clean**: Estilo oficial moderno, fundo acetinado perolado.
  2. **Cores Oficiais (Verde Esmeralda Pix / Azul Tecnologia Wi-Fi)**: Identidade marcante de alta visibilidade no balcão.
  3. **Black & Gold Luxo**: Fundo preto piano profundo com ouro metálico, ideal para estabelecimentos sofisticados (barbearias, bistrôs, clínicas).
* Rodapé com linha de corte e divulgação sutil: *"Quer mais avaliações 5 estrelas no Google? Conheça a Placa Inteligente • placaqr.pages.dev"*.

### D. Gerador e Customizador de Placa Pix
* Arquivo: [`web/src/components/landing/PixGenerator.tsx`](web/src/components/landing/PixGenerator.tsx)
* Formulário completo com máscaras e contadores de caracteres.
* Opção de definir valor fixo ou livre.
* Opção de exibir ou ocultar a chave por extenso.
* Botão para **Copiar Código Pix Copia e Cola** para testar no celular.
* Ações de **Imprimir Placa**, **Baixar PNG (300 DPI)** e **Baixar Vetor SVG**.

### E. Gerador e Customizador de Placa Wi-Fi
* Arquivo: [`web/src/components/landing/WifiGenerator.tsx`](web/src/components/landing/WifiGenerator.tsx)
* Formulário com SSID, senha visível/oculta, tipo de segurança e rede oculta.
* Opção de imprimir a senha por extenso no rodapé para clientes com notebook.
* Botão para **Copiar Dados Rápidos de Conexão**.
* Ações de **Imprimir Placa**, **Baixar PNG (300 DPI)** e **Baixar Vetor SVG**.

### F. Vitrine Exclusiva da Placa de Avaliação do Google (Core Business)
* Arquivo: [`web/src/components/landing/GooglePlateShowcase.tsx`](web/src/components/landing/GooglePlateShowcase.tsx)
* Renderização realista do `MODELO.svg` com reflexo de acrílico e tag oficial Google Reviews.
* **Seção Educativa**: Por que a Placa do Google não é de papel (QR dinâmico inquebrável, métricas diárias, acrílico cristal cortado a laser).
* **Tabela Comparativa Lado a Lado**: Placa de Papel Comum vs Placa Inteligente Placa QR.
* **Calculadora Interativa de Impacto no Google Maps**: Slider com fluxo diário de clientes calculando estimativa de novas notas 5 estrelas e subida para o Top 3 da região.
* **Botão Direto no WhatsApp**: Abre conversa com mensagem pré-formatada para encomendar a placa física.

### G. Nova Landing Page Integrada e Otimizada para Impressão
* Arquivo: [`web/src/pages/Home.tsx`](web/src/pages/Home.tsx)
* Arquivo: [`web/src/index.css`](web/src/index.css)
* Navegação fluida por abas sincronizadas na URL (`/?tab=pix`, `/?tab=wifi`, `/?tab=google`).
* Seção "Como Funciona em 3 Passos" e "Perguntas Frequentes (FAQ)".
* CSS `@media print` milimetricamente configurado para centralizar a placa em folha A4 com proporção para displays de mesa (10x15cm ou A5), ocultando automaticamente menus e botões.

---

## 2. Testes e Validações Executados

1. **Cálculo de CRC16 e Padrão TLV do BACEN**:
   * Testado e validado com sucesso com chaves de celular, CPF e CNPJ.
   * Validação de sanitização sem acentos e inclusão do código monetário BRL (`5303986`).
2. **Payload de Wi-Fi ZXing**:
   * Testado com caracteres especiais escapados (`\;`, `\:`, `\"`).
3. **Compilação e Tipagem**:
   * Executado `tsc -b && vite build` com **código de saída 0** e zero erros de tipo ou variáveis não utilizadas.
4. **Deploy Automático**:
   * Commit enviado com sucesso para o branch `main` no GitHub (`ffe9709`), acionando o deploy no Cloudflare Pages.

---

## 3. Como Visualizar

* Acesse a URL pública do projeto: **`https://placaqr.pages.dev/`**
* Teste as 3 abas na parte superior:
  - **Placa Pix**: Preencha seus dados reais e teste a leitura do QR Code com o app do seu banco ou copie o Pix Copia e Cola.
  - **Placa Wi-Fi**: Coloque os dados da sua rede e aponte a câmera do seu celular para testar a conexão instantânea.
  - **Placa Google**: Veja a vitrine do produto premium, simule o crescimento com o slider e teste o botão do WhatsApp.
