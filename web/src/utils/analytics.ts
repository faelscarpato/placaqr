/**
 * Utilitário central de telemetria e rastreamento para Google Analytics 4 (gtag.js)
 * ID de medição: G-X03TXPQ9BR
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export type PlateType = 'pix' | 'wifi';
export type PlateAction = 'print' | 'download';
export type TabName = 'pix' | 'wifi' | 'google';

/**
 * Função base para envio de evento seguro para o GA4
 */
export function trackEvent(eventName: string, params: Record<string, any> = {}): void {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', eventName, {
        ...params,
        send_to: 'G-X03TXPQ9BR',
      });
    }
  } catch (err) {
    // Falha silenciosa para não quebrar a aplicação caso adblockers estejam ativos
    console.debug('[GA4] Event dispatch ignored:', eventName, err);
  }
}

/**
 * Rastreia visualização e troca de abas na Landing Page
 */
export function trackTabVisit(tab: TabName): void {
  trackEvent('view_tab', {
    tab_name: tab,
    page_title: `Placa QR — Aba ${tab.toUpperCase()}`,
    page_location: window.location.href,
  });

  // Dispara também page_view virtual no GA4
  trackEvent('page_view', {
    page_path: `/?tab=${tab}`,
    page_title: `Placa QR — Aba ${tab.toUpperCase()}`,
  });
}

/**
 * Rastreia download de imagem PNG em alta resolução (300 DPI)
 */
export function trackPlateDownload(plateType: PlateType, theme: string, companyName?: string): void {
  trackEvent('download_plate', {
    plate_type: plateType,
    theme,
    format: 'png_300dpi',
    has_company_name: Boolean(companyName && companyName.trim()),
    event_category: 'engagement',
    event_label: `Download Placa ${plateType.toUpperCase()} - ${theme}`,
  });
}

/**
 * Rastreia impressão de placa (estilo 10x15cm / A5)
 */
export function trackPlatePrint(plateType: PlateType, theme: string, companyName?: string): void {
  trackEvent('print_plate', {
    plate_type: plateType,
    theme,
    has_company_name: Boolean(companyName && companyName.trim()),
    event_category: 'engagement',
    event_label: `Impressão Placa ${plateType.toUpperCase()} - ${theme}`,
  });
}

/**
 * Rastreia captura de lead comercial no formulário pré-download/impressão
 */
export function trackLeadSubmission(data: {
  leadName?: string;
  hasWhatsapp: boolean;
  hasEmail: boolean;
  interests: string[];
  sourcePlate: PlateType;
  action: PlateAction;
}): void {
  trackEvent('generate_lead', {
    source_plate: data.sourcePlate,
    trigger_action: data.action,
    has_whatsapp: data.hasWhatsapp,
    has_email: data.hasEmail,
    interests_count: data.interests.length,
    interests: data.interests.join(','),
    event_category: 'lead_generation',
    value: 1,
  });
}

/**
 * Rastreia quando o usuário opta por pular a captação de lead
 */
export function trackLeadSkipped(sourcePlate: PlateType, action: PlateAction): void {
  trackEvent('lead_skipped', {
    source_plate: sourcePlate,
    trigger_action: action,
    event_category: 'lead_generation',
  });
}

/**
 * Rastreia clique no botão de compra/WhatsApp da Placa do Google
 */
export function trackGooglePlateCta(clientsPerDay: number): void {
  trackEvent('click_buy_google_plate', {
    clients_per_day: clientsPerDay,
    destination: 'whatsapp_sales',
    event_category: 'conversion',
  });
}
