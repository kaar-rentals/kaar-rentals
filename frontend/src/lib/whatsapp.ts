import { contactConfig } from '@/config/contact';

/** WhatsApp number digits only (no +) for wa.me links */
export const WHATSAPP_DIGITS = '923245793350';

export function buildWhatsAppUrl(message: string): string {
  const encoded = encodeURIComponent(message);
  const base = contactConfig.whatsapp.replace(/\?.*$/, '') || `https://wa.me/${WHATSAPP_DIGITS}`;
  return `${base}?text=${encoded}`;
}

export function buildPlanWhatsAppMessage(params: {
  planName: string;
  carsLabel: string;
  userName?: string;
  userPhone?: string;
  extra?: string;
}): string {
  const { planName, carsLabel, userName, userPhone, extra } = params;
  return [
    'Hi Kaar.Rentals,',
    '',
    `I would like to subscribe to the *${planName}* plan.`,
    '',
    `*Plan:* ${planName}`,
    `*Number of cars:* ${carsLabel}`,
    `*Name:* ${userName || 'Not provided'}`,
    `*Phone:* ${userPhone || 'Not provided'}`,
    extra ? `*Note:* ${extra}` : '',
    '',
    'Please help me get started. Thank you!',
  ]
    .filter(Boolean)
    .join('\n');
}

export function buildListCarInquiryMessage(): string {
  return [
    'Hi Kaar.Rentals,',
    '',
    'I would like to *list my car for rent* in Pakistan.',
    '',
    'Please share details about your listing plans (Basic, Standard, Premium, or Lifetime) and how to get started.',
    '',
    'Thank you!',
  ].join('\n');
}

export function openPlanWhatsApp(params: {
  planName: string;
  carsLabel: string;
  userName?: string;
  userPhone?: string;
}): void {
  const message = buildPlanWhatsAppMessage(params);
  window.open(buildWhatsAppUrl(message), '_blank', 'noopener,noreferrer');
}
