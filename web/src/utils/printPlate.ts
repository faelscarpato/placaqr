/**
 * Utilitário para impressão isolada e perfeita da placa em alta definição
 * Garante que NENHUM elemento do site (menus, botões, cabeçalho, rodapé) seja impresso.
 */

export function printPlateSvg(svgString: string): void {
  if (!svgString) {
    window.print();
    return;
  }

  // Cria um iframe invisível e isolado para enviar apenas o SVG para o spool de impressão
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  iframe.style.zIndex = '-9999';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (!doc) {
    window.print();
    return;
  }

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8">
        <title>Imprimir Placa - Placa QR</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          * {
            box-sizing: border-box;
          }
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            background: #ffffff;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
          .plate-print-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            margin: auto;
          }
          svg {
            max-width: 145mm !important; /* Tamanho proporcional para display 10x15cm e A5 */
            max-height: 205mm !important;
            width: 100% !important;
            height: auto !important;
            display: block !important;
            margin: 0 auto !important;
            box-shadow: none !important;
            filter: none !important;
          }
        </style>
      </head>
      <body>
        <div class="plate-print-wrapper">
          ${svgString}
        </div>
      </body>
    </html>
  `);
  doc.close();

  // Aguarda carregamento dos assets e dispara impressão
  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.error('Erro na impressão por iframe:', e);
      window.print();
    } finally {
      // Remove o iframe após a janela de impressão ser fechada
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 5000);
    }
  }, 300);
}
