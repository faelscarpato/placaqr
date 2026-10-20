/**
 * Utilitário para geração de payload universal de Wi-Fi para QR Code
 * 
 * Padrão ZXing / iOS / Android:
 * WIFI:T:<WPA|WEP|nopass>;S:<SSID>;P:<password>;H:<true|false>;;
 */

export type WifiEncryption = 'WPA' | 'WEP' | 'nopass';

export interface WifiPayloadParams {
  ssid: string;
  password?: string;
  encryption?: WifiEncryption;
  hidden?: boolean;
}

export interface GeneratedWifi {
  payload: string;
  ssid: string;
  password?: string;
  encryption: WifiEncryption;
  hidden: boolean;
}

// Escapa caracteres especiais conforme especificação ZXing
function escapeWifiString(str: string): string {
  return str.replace(/([\\;,":])/g, '\\$1');
}

export function generateWifiPayload(params: WifiPayloadParams): GeneratedWifi {
  const ssid = params.ssid.trim();
  const encryption: WifiEncryption = params.encryption || (params.password ? 'WPA' : 'nopass');
  const password = encryption === 'nopass' ? '' : (params.password || '').trim();
  const hidden = Boolean(params.hidden);

  const safeSsid = escapeWifiString(ssid);
  const safePassword = escapeWifiString(password);

  let payload = `WIFI:T:${encryption};S:${safeSsid};`;

  if (encryption !== 'nopass' && password) {
    payload += `P:${safePassword};`;
  }

  if (hidden) {
    payload += 'H:true;';
  }

  payload += ';';

  return {
    payload,
    ssid,
    password: password || undefined,
    encryption,
    hidden,
  };
}
