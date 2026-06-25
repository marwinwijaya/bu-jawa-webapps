import { WHATSAPP_NUMBER } from '../config/app';

/**
 * Format price in Indonesian Rupiah format with dots as thousands separator.
 * Returns "Hubungi kami" if price is null or 0.
 */
export function formatPrice(price: number | null): string {
  if (price === null || price === 0) {
    return 'Hubungi kami';
  }
  return `Rp ${price.toLocaleString('id-ID')}`;
}

/**
 * Generate a WhatsApp deep link (wa.me URL) with the given phone number and message.
 */
export function formatWhatsAppLink(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Generate a WhatsApp order message for a menu item.
 * Format: "Halo Bu Jawa, saya mau pesan [nama] (Rp [harga])"
 * Without price: "Halo Bu Jawa, saya mau pesan [nama]"
 */
export function formatWhatsAppMenuMessage(itemName: string, price: number | null): string {
  const pricePart = price !== null && price !== 0 ? ` (${formatPrice(price)})` : '';
  return `Halo Bu Jawa, saya mau pesan ${itemName}${pricePart}`;
}

/**
 * Open WhatsApp with an order message for a specific menu item.
 */
export function openWhatsAppOrder(itemName: string, price: number | null): void {
  const message = formatWhatsAppMenuMessage(itemName, price);
  const url = formatWhatsAppLink(WHATSAPP_NUMBER, message);
  window.open(url, '_blank');
}

/**
 * Open WhatsApp with a generic inquiry message.
 */
export function openWhatsAppInquiry(): void {
  const message = 'Halo Bu Jawa, saya mau bertanya';
  const url = formatWhatsAppLink(WHATSAPP_NUMBER, message);
  window.open(url, '_blank');
}
