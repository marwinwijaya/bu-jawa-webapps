export const WHATSAPP_NUMBER: string = import.meta.env.VITE_RESTAURANT_WHATSAPP;

export const MAPS_URL = 'https://maps.app.goo.gl/xxxx'; // TODO: Replace with actual Google Maps link

export const OPENING_HOURS = {
  weekdays: '10:00 - 21:00',
  weekends: '09:00 - 22:00',
};

export const ADMIN_EMAILS: string[] = (
  import.meta.env.VITE_ADMIN_EMAILS || ''
)
  .split(',')
  .map((email: string) => email.trim())
  .filter(Boolean);
