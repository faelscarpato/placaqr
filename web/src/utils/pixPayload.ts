/**
 * Utilitário para geração de payload oficial do Pix (EMVCo BR Code Padrão Banco Central do Brasil)
 * 
 * Implementação estrita das especificações do Manual de Padrões para Iniciação do Pix do BACEN.
 * Gera string no padrão TLV (Tag-Length-Value) com cálculo rigoroso de CRC16-CCITT.
 */

// Função para remover acentos e caracteres especiais, conforme exigido pelo BACEN
export function sanitizePixText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[^a-zA-Z0-9\s]/g, '') // permite apenas letras, números e espaços
    .trim();
}

// Formata campo no padrão TLV (ID + Tamanho 2 dígitos + Valor)
function formatTLV(id: string, value: string): string {
  const length = value.length.toString().padStart(2, '0');
  return `${id}${length}${value}`;
}

/**
 * Cálculo de CRC16-CCITT (Polinômio 0x1021, Valor inicial 0xFFFF)
 * Padrão oficial exigido pelo BACEN no campo ID 63
 */
export function calculateCRC16(payload: string): string {
  let crc = 0xffff;
  const polynomial = 0x1021;

  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ polynomial) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export type PixKeyType = 'cpf' | 'cnpj' | 'phone' | 'email' | 'random';

export interface PixPayloadParams {
  keyType: PixKeyType;
  key: string;
  merchantName: string;
  merchantCity: string;
  amount?: number | string | null;
  txid?: string | null;
  description?: string | null;
}

export interface GeneratedPix {
  payload: string;
  formattedKey: string;
  merchantName: string;
  merchantCity: string;
  amountText: string | null;
  txid: string;
}

/**
 * Formata e sanitiza a chave Pix dependendo do tipo
 */
export function formatPixKey(key: string, type: PixKeyType): string {
  const clean = key.trim();
  switch (type) {
    case 'cpf':
    case 'cnpj':
      return clean.replace(/\D/g, '');
    case 'phone': {
      let digits = clean.replace(/\D/g, '');
      // Se não tiver código de país +55, adiciona
      if (!digits.startsWith('55') && (digits.length === 10 || digits.length === 11)) {
        digits = `55${digits}`;
      }
      return `+${digits}`;
    }
    case 'email':
      return clean.toLowerCase();
    case 'random':
    default:
      return clean;
  }
}

/**
 * Constrói o payload completo do Pix Copia e Cola / QR Code EMVCo
 */
export function generatePixPayload(params: PixPayloadParams): GeneratedPix {
  const cleanKey = formatPixKey(params.key, params.keyType);
  const cleanName = sanitizePixText(params.merchantName || 'RECEBEDOR').substring(0, 25).toUpperCase();
  const cleanCity = sanitizePixText(params.merchantCity || 'BRASIL').substring(0, 15).toUpperCase();
  
  // TXID: se não fornecido, o BACEN recomenda '***' para Pix estático
  const rawTxid = params.txid ? sanitizePixText(params.txid).replace(/\s/g, '').substring(0, 25) : '***';
  const cleanTxid = rawTxid || '***';

  // 00: Payload Format Indicator (Fixo: 01)
  let payload = formatTLV('00', '01');

  // 26: Merchant Account Information
  // 00: GUI br.gov.bcb.pix
  // 01: Chave Pix
  // 02: Descrição adicional (opcional)
  let accountInfo = formatTLV('00', 'br.gov.bcb.pix') + formatTLV('01', cleanKey);
  if (params.description) {
    const cleanDesc = sanitizePixText(params.description).substring(0, 40);
    if (cleanDesc) {
      accountInfo += formatTLV('02', cleanDesc);
    }
  }
  payload += formatTLV('26', accountInfo);

  // 52: Merchant Category Code (Fixo: 0000)
  payload += formatTLV('52', '0000');

  // 53: Transaction Currency (986 = BRL / Real)
  payload += formatTLV('53', '986');

  // 54: Transaction Amount (Opcional)
  let amountText: string | null = null;
  if (params.amount !== undefined && params.amount !== null && params.amount !== '') {
    const num = typeof params.amount === 'number' ? params.amount : parseFloat(params.amount.toString().replace(',', '.'));
    if (!isNaN(num) && num > 0) {
      const formattedAmount = num.toFixed(2);
      payload += formatTLV('54', formattedAmount);
      amountText = `R$ ${num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  }

  // 58: Country Code (BR)
  payload += formatTLV('58', 'BR');

  // 59: Merchant Name
  payload += formatTLV('59', cleanName || 'RECEBEDOR');

  // 60: Merchant City
  payload += formatTLV('60', cleanCity || 'CIDADE');

  // 62: Additional Data Field Template (TXID)
  const additionalData = formatTLV('05', cleanTxid);
  payload += formatTLV('62', additionalData);

  // 63: CRC16 - Adiciona o identificador "6304" e calcula o checksum de 4 caracteres
  const payloadForCrc = `${payload}6304`;
  const crc = calculateCRC16(payloadForCrc);
  const finalPayload = `${payloadForCrc}${crc}`;

  return {
    payload: finalPayload,
    formattedKey: cleanKey,
    merchantName: cleanName || 'RECEBEDOR',
    merchantCity: cleanCity || 'CIDADE',
    amountText,
    txid: cleanTxid,
  };
}
