export type Role = 'CUSTOMER' | 'ADMIN';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';

export type AppointmentStatus =
  | 'PENDING'
  | 'PAYMENT_PENDING'
  | 'CONFIRMED'
  | 'RESCHEDULED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'
  | 'REFUND_REQUESTED'
  | 'REFUNDED';

export type PaymentStatus =
  | 'CREATED'
  | 'PENDING'
  | 'SUCCESS'
  | 'FAILED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export type BlogStatus = 'DRAFT' | 'PUBLISHED' | 'SCHEDULED';

export type TestimonialStatus = 'PENDING' | 'APPROVED' | 'HIDDEN';

export type EnquiryStatus = 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export type GalleryCategory =
  | 'EVENTS'
  | 'AWARDS'
  | 'WORKSHOPS'
  | 'CONSULTATIONS'
  | 'MEDIA';

export type SavedProfileRelation =
  | 'SELF'
  | 'SPOUSE'
  | 'CHILD'
  | 'PARENT'
  | 'OTHER';

export type CampaignStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'RUNNING'
  | 'COMPLETED'
  | 'CANCELLED';

export type NotificationChannel = 'EMAIL' | 'WHATSAPP';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errorCode?: string;
  details?: unknown;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface User {
  id: string;
  email: string;
  mobile?: string | null;
  name: string;
  role: Role;
  isEmailVerified: boolean;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  customerProfile?: CustomerProfile | null;
}

export interface CustomerProfile {
  id: string;
  userId: string;
  dateOfBirth?: string | null;
  birthTime?: string | null;
  birthPlace?: string | null;
  gender?: Gender | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  country?: string | null;
  notes?: string | null;
}

export interface SavedProfile {
  id: string;
  userId: string;
  label: string;
  relation: SavedProfileRelation;
  name: string;
  dateOfBirth?: string | null;
  birthTime?: string | null;
  birthPlace?: string | null;
  gender?: Gender | null;
  createdAt: string;
}

export interface NotificationPreference {
  id: string;
  userId: string;
  emailEnabled: boolean;
  whatsappEnabled: boolean;
  appointmentReminders: boolean;
  marketingMessages: boolean;
  birthdayGreetings: boolean;
  festivalGreetings: boolean;
}

export interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  imageUrl?: string | null;
  durationMinutes: number;
  price: number | string;
  discountPrice?: number | string | null;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available?: boolean;
}

export interface Appointment {
  id: string;
  bookingRef: string;
  customerId: string;
  serviceId: string;
  service?: Service;
  customer?: User;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  status: AppointmentStatus;
  amount: number | string;
  couponCode?: string | null;
  couponDiscount?: number | string | null;
  notes?: string | null;
  adminNotes?: string | null;
  rescheduleCount: number;
  cancelledAt?: string | null;
  cancelReason?: string | null;
  completedAt?: string | null;
  meetingLink?: string | null;
  meetingPlatform?: string | null;
  createdAt: string;
  payments?: Payment[];
  invoices?: Invoice[];
}

export interface Payment {
  id: string;
  appointmentId: string;
  customerId: string;
  provider: string;
  orderId?: string | null;
  paymentId?: string | null;
  amount: number | string;
  currency: string;
  status: PaymentStatus;
  refundAmount?: number | string | null;
  paidAt?: string | null;
  createdAt: string;
  appointment?: Appointment;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  appointmentId: string;
  paymentId: string;
  customerId: string;
  businessName: string;
  customerName: string;
  customerEmail: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  subtotal: number | string;
  taxAmount: number | string;
  totalAmount: number | string;
  currency: string;
  pdfPath?: string | null;
  createdAt: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  featuredImage?: string | null;
  categoryId?: string | null;
  category?: BlogCategory | null;
  tags: string[];
  status: BlogStatus;
  publishedAt?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  createdAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  review: string;
  rating: number;
  photoUrl?: string | null;
  status: TestimonialStatus;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface GalleryItem {
  id: string;
  imageUrl: string;
  caption?: string | null;
  category: GalleryCategory;
  sortOrder: number;
  isActive: boolean;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface ContactEnquiry {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  status: EnquiryStatus;
  adminNotes?: string | null;
  createdAt: string;
}

export interface AvailabilityRule {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  breaks?: { id?: string; startTime: string; endTime: string; label?: string }[];
}

export interface BlockedDate {
  id: string;
  date: string;
  reason?: string | null;
  isHoliday: boolean;
}

export interface Campaign {
  id: string;
  name: string;
  message: string;
  subject?: string | null;
  channels: NotificationChannel[];
  audience: string;
  status: CampaignStatus;
  scheduledAt?: string | null;
  createdAt: string;
}

export interface NotificationLog {
  id: string;
  customerId?: string | null;
  type: string;
  channel: NotificationChannel;
  subject?: string | null;
  status: string;
  error?: string | null;
  sentAt?: string | null;
  createdAt: string;
}

export interface PageSeo {
  id: string;
  pageKey: string;
  title?: string | null;
  metaDescription?: string | null;
  keywords?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  canonicalUrl?: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  user: User;
}

export interface DashboardStats {
  totalAppointments?: number;
  upcomingAppointments?: number;
  totalPayments?: number;
  totalRevenue?: number;
  totalCustomers?: number;
  pendingEnquiries?: number;
  recentAppointments?: Appointment[];
  revenueByMonth?: { month: string; revenue: number }[];
}
