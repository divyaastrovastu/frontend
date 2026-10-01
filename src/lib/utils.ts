import { format, parseISO, isValid } from 'date-fns';
import { businessConfig } from './businessConfig';

export function getApiOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, '') ||
    'http://localhost:4000'
  );
}

/** Resolve CMS/media URLs so /uploads/* always hit the API host. */
export function resolveMediaUrl(url?: string | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }
  if (trimmed.startsWith('/uploads')) {
    return `${getApiOrigin()}${trimmed}`;
  }
  return trimmed;
}

export function formatCurrency(
  amount: number | string | null | undefined,
  currency = businessConfig.currency
): string {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount ?? 0;
  if (Number.isNaN(value)) return `${businessConfig.currencySymbol}0`;
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${businessConfig.currencySymbol}${value.toLocaleString('en-IN')}`;
  }
}

export function formatDate(
  date: string | Date | null | undefined,
  pattern = 'dd MMM yyyy'
): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '—';
  return format(d, pattern);
}

export function formatTime(time: string | null | undefined): string {
  if (!time) return '—';
  const [h, m] = time.split(':').map(Number);
  if (Number.isNaN(h)) return time;
  const date = new Date();
  date.setHours(h, m || 0, 0, 0);
  return format(date, 'h:mm a');
}

export function getEffectivePrice(service: {
  price: number | string;
  discountPrice?: number | string | null;
}): number {
  const price = typeof service.price === 'string' ? parseFloat(service.price) : service.price;
  if (service.discountPrice != null && service.discountPrice !== '') {
    const discount =
      typeof service.discountPrice === 'string'
        ? parseFloat(service.discountPrice)
        : service.discountPrice;
    if (!Number.isNaN(discount) && discount < price) return discount;
  }
  return price;
}

export function appointmentStatusLabel(status: string): string {
  return status
    .split('_')
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ');
}

export function whatsappUrl(phoneOrMessage?: string, message?: string): string {
  const looksLikePhone = phoneOrMessage ? /^[\d+\s-]+$/.test(phoneOrMessage.replace(/\s/g, '')) && phoneOrMessage.replace(/\D/g, '').length >= 10 : false;
  const phone = (looksLikePhone ? phoneOrMessage! : businessConfig.whatsapp).replace(/\D/g, '');
  const textSource = looksLikePhone ? message : phoneOrMessage;
  const text = textSource
    ? encodeURIComponent(textSource)
    : encodeURIComponent(`Hello ${businessConfig.name}, I would like to book a consultation.`);
  return `https://wa.me/${phone}?text=${text}`;
}

export function getErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object') {
    const e = err as {
      response?: { data?: { message?: string } };
      message?: string;
    };
    return e.response?.data?.message || e.message || fallback;
  }
  return fallback;
}
