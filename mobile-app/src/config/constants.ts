export const WEBSITE_BASE_URL = 'https://kaar.rentals';

export const ROUTES = {
  home: '/',
  cars: '/cars',
  profile: '/profile/me',
  auth: '/auth',
} as const;

export const WHATSAPP_URL = 'https://wa.me/923245793350';
export const WHATSAPP_MESSAGE =
  'Hi Kaar.Rentals! I found you on the mobile app and would like to inquire about a car rental.';

export const APP_NAME = 'Kaar.Rentals';
export const APP_TAGLINE = 'Reliable Rides Anytime';

/** Paths that open in external browser (payments, social, etc.) */
export const EXTERNAL_URL_PATTERNS = [
  /^https?:\/\/(www\.)?(facebook|instagram|tiktok|twitter|x)\.com/i,
  /^https?:\/\/wa\.me/i,
  /^mailto:/i,
  /^tel:/i,
];
