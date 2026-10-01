export const businessConfig = {
  name: 'DIVYA ASTRO VASTU',
  legalName: 'DIVYA ASTRO VASTU',
  brandShort: 'DivyaAstroVastu',
  tagline: 'ONE STOP ASTRO-VASTU SOLUTION FOR EVERY LIFE CHALLENGE',
  taglineHi: 'ज्योतिष और वास्तु का समन्वय - जीवन की हर समस्या का समाधान',
  taglineGu: 'જ્યોતિષ અને વાસ્તુનું સંયોજન - જીવનની દરેક સમસ્યાનો ઉકેલ',
  description:
    'Modern astrology and professional Vastu consultation by Dr. Jaiprakaash Dwivedi — practical guidance for life, relationships, career, health, and prosperity.',
  astrologerName: 'Dr. Jaiprakaash Dwivedi',
  astrologerNameHi: 'डॉ. जयप्रकाश द्विवेदी',
  astrologerNameGu: 'ડૉ. જયપ્રકાશ દ્વિવેદી',
  astrologerCredentials: 'Ph.D.(Japan)',
  astrologerTitle: 'Modern Astrologer & Professional Vastu Consultant',
  experienceYears: null as number | null,
  phone: '+91 99587 52510',
  phoneSecondary: '+91 95702 10355',
  whatsapp: '+919958752510',
  email: 'divyaastrovastu@gmail.com',
  addressLine:
    'TF-307, Shyam Resi cum Plaza, Waghodia Rd, above SBI Branch, Near Parivar Char Rasta, Sarthi Nagar 2, Kendranagar',
  address:
    'TF-307, Shyam Resi cum Plaza, Waghodia Rd, above SBI Branch, Near Parivar Char Rasta, Sarthi Nagar 2, Kendranagar',
  city: 'Vadodara',
  state: 'Gujarat',
  pincode: '390019',
  country: 'India',
  timezone: 'Asia/Kolkata',
  consultationHours: '',
  currency: 'INR',
  currencySymbol: '₹',
  socialLinks: {
    facebook: '',
    instagram: '',
    youtube: '',
  },
  logo: '/images/logo.png',
  favicon: '/favicon.ico',
  astrologerPhotoUrl: '',
  websiteUrl: 'https://divyaastrovastu.com',
  /** WHATSAPP | GOOGLE_MEET | ZOOM | PHONE | IN_PERSON */
  consultationMode: 'WHATSAPP' as 'WHATSAPP' | 'GOOGLE_MEET' | 'ZOOM' | 'PHONE' | 'IN_PERSON',
  /** Optional fixed meeting URL (Google Meet / Zoom). WhatsApp mode builds a chat link per booking. */
  defaultMeetingLink: '',
  locales: ['en', 'hi', 'gu'] as const,
  defaultLocale: 'en' as const,
};

export type BusinessConfig = typeof businessConfig;
export type Locale = (typeof businessConfig.locales)[number];

export function formatBusinessAddress(cfg: BusinessConfig = businessConfig): string {
  return `${cfg.addressLine}, ${cfg.city}, ${cfg.state} ${cfg.pincode}, ${cfg.country}`;
}

export function localizedAstrologerName(locale: Locale, cfg: BusinessConfig = businessConfig): string {
  if (locale === 'hi') return cfg.astrologerNameHi;
  if (locale === 'gu') return cfg.astrologerNameGu;
  return cfg.astrologerName;
}

export function localizedTagline(locale: Locale, cfg: BusinessConfig = businessConfig): string {
  if (locale === 'hi') return cfg.taglineHi;
  if (locale === 'gu') return cfg.taglineGu;
  return cfg.tagline;
}
