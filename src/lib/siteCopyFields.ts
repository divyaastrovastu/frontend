/**
 * Editable marketing copy fields for Admin → Website content.
 * Paths map to i18n keys (e.g. home.heroTitle).
 */
export type SiteCopyField = {
  path: string;
  label: string;
  section: string;
  multiline?: boolean;
};

export const SITE_COPY_FIELDS: SiteCopyField[] = [
  { path: 'home.heroTitle', label: 'Hero title', section: 'Home' },
  { path: 'home.ctaBook', label: 'Book consultation button', section: 'Home' },
  { path: 'home.ctaWhatsapp', label: 'WhatsApp button', section: 'Home' },
  { path: 'home.introTitle', label: 'About section title', section: 'Home' },
  { path: 'home.introBody', label: 'About section body', section: 'Home', multiline: true },
  { path: 'home.servicesTitle', label: 'Services section title', section: 'Home' },
  { path: 'home.servicesBody', label: 'Services section body', section: 'Home', multiline: true },
  { path: 'home.why1', label: 'Highlight 1', section: 'Home' },
  { path: 'home.why2', label: 'Highlight 2', section: 'Home' },
  { path: 'home.why3', label: 'Highlight 3', section: 'Home' },
  { path: 'home.testimonialsTitle', label: 'Testimonials title', section: 'Home' },
  { path: 'home.ctaTitle', label: 'Bottom CTA title', section: 'Home' },
  { path: 'home.ctaBody', label: 'Bottom CTA body', section: 'Home', multiline: true },
  { path: 'home.contactTitle', label: 'Contact block title', section: 'Home' },
  { path: 'home.photoPending', label: 'Photo placeholder text', section: 'Home', multiline: true },

  { path: 'about.title', label: 'Page title', section: 'About' },
  { path: 'about.subtitle', label: 'Subtitle', section: 'About', multiline: true },
  { path: 'about.body', label: 'Body', section: 'About', multiline: true },

  { path: 'contact.title', label: 'Page title', section: 'Contact' },
  { path: 'contact.subtitle', label: 'Subtitle', section: 'Contact', multiline: true },
  { path: 'contact.formTitle', label: 'Form title', section: 'Contact' },
  { path: 'contact.nameLabel', label: 'Name field label', section: 'Contact' },
  { path: 'contact.emailLabel', label: 'Email field label', section: 'Contact' },
  { path: 'contact.phoneLabel', label: 'Phone field label', section: 'Contact' },
  { path: 'contact.subjectLabel', label: 'Subject field label', section: 'Contact' },
  { path: 'contact.messageLabel', label: 'Message field label', section: 'Contact' },
  { path: 'contact.submit', label: 'Submit button', section: 'Contact' },
  { path: 'contact.success', label: 'Success message', section: 'Contact', multiline: true },

  { path: 'common.hoursPending', label: 'Hours pending text', section: 'Common' },
  { path: 'footer.rights', label: 'Footer rights line', section: 'Footer' },
];

export function setByPath(obj: Record<string, unknown>, path: string, value: string) {
  const parts = path.split('.');
  let cur: Record<string, unknown> = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (!cur[p] || typeof cur[p] !== 'object') cur[p] = {};
    cur = cur[p] as Record<string, unknown>;
  }
  cur[parts[parts.length - 1]] = value;
}

export function getByPath(obj: Record<string, unknown> | undefined, path: string): string {
  if (!obj) return '';
  const parts = path.split('.');
  let cur: unknown = obj;
  for (const part of parts) {
    if (cur && typeof cur === 'object' && part in (cur as object)) {
      cur = (cur as Record<string, unknown>)[part];
    } else {
      return '';
    }
  }
  return typeof cur === 'string' ? cur : '';
}
