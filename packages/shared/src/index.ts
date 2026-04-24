// User roles
export enum UserRole {
  CLIENT = 'CLIENT',
  ARTIST = 'ARTIST',
  STUDIO_OWNER = 'STUDIO_OWNER',
  ADMIN = 'ADMIN',
}

// Appointment status
export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW',
}

// Payment status
export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
  FAILED = 'FAILED',
}

// Tattoo styles
export enum TattooStyle {
  TRADITIONAL = 'TRADITIONAL',
  NEO_TRADITIONAL = 'NEO_TRADITIONAL',
  REALISM = 'REALISM',
  WATERCOLOR = 'WATERCOLOR',
  BLACKWORK = 'BLACKWORK',
  TRIBAL = 'TRIBAL',
  JAPANESE = 'JAPANESE',
  GEOMETRIC = 'GEOMETRIC',
  MINIMALIST = 'MINIMALIST',
  ILLUSTRATIVE = 'ILLUSTRATIVE',
  OTHER = 'OTHER',
}

export enum WaiverStatus {
  DRAFT = 'DRAFT',
  SIGNED = 'SIGNED',
  EXPIRED = 'EXPIRED',
}

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  SYSTEM = 'SYSTEM',
}

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
  IN_APP = 'IN_APP',
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

// Auth types
export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// User types
export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  emailVerified: boolean;
  createdAt: Date;
}

// Artist types
export interface ArtistProfileData {
  id: string;
  userId: string;
  bio: string;
  styles: TattooStyle[];
  hourlyRate?: number;
  minimumDeposit?: number;
  depositPercentage?: number;
  city: string;
  state: string;
  country: string;
  instagramHandle?: string;
  tiktokHandle?: string;
  websiteUrl?: string;
  yearsExperience?: number;
  isAvailable: boolean;
  stripeConnectId?: string;
  user: UserProfile;
}

export interface PortfolioImageData {
  id: string;
  artistId: string;
  url: string;
  thumbnailUrl?: string;
  style: TattooStyle;
  title?: string;
  description?: string;
  isPublic: boolean;
  createdAt: Date;
}

// Appointment types
export interface AppointmentData {
  id: string;
  clientId: string;
  artistId: string;
  studioId?: string;
  startTime: Date;
  endTime: Date;
  status: AppointmentStatus;
  serviceType: string;
  description?: string;
  estimatedHours?: number;
  depositAmount?: number;
  depositPaid: boolean;
  totalAmount?: number;
  paymentStatus: PaymentStatus;
  googleCalendarEventId?: string;
  notes?: string;
  createdAt: Date;
}

export interface AvailabilitySlot {
  dayOfWeek: number; // 0=Sunday, 6=Saturday
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
}

export interface BlockedDate {
  date: Date;
  reason?: string;
}

// Waiver types
export interface WaiverTemplateData {
  id: string;
  artistId: string;
  title: string;
  content: string;
  version: number;
  isActive: boolean;
}

export interface WaiverData {
  id: string;
  appointmentId: string;
  templateId: string;
  clientId: string;
  signatureData?: string;
  medicalHistory?: Record<string, unknown>;
  signedAt?: Date;
  status: WaiverStatus;
  pdfUrl?: string;
}

// Payment types
export interface PaymentData {
  id: string;
  appointmentId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  refundId?: string;
  refundAmount?: number;
  createdAt: Date;
}

// Message types
export interface MessageData {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  type: MessageType;
  mediaUrl?: string;
  readAt?: Date;
  createdAt: Date;
  sender: Pick<UserProfile, 'id' | 'firstName' | 'lastName' | 'avatarUrl'>;
}

// Aftercare types
export interface AftercareData {
  id: string;
  appointmentId: string;
  artistId: string;
  clientId: string;
  instructions: string;
  milestones: AftercareMilestone[];
  photos: AftercarePhoData[];
  createdAt: Date;
}

export interface AftercareMilestone {
  id: string;
  aftercareId: string;
  dayNumber: number;
  title: string;
  instructions: string;
  completed: boolean;
  completedAt?: Date;
}

export interface AftercarePhoData {
  id: string;
  aftercareId: string;
  url: string;
  dayNumber: number;
  artistComment?: string;
  uploadedAt: Date;
}

// Studio types
export interface StudioData {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  phone?: string;
  email?: string;
  websiteUrl?: string;
  logoUrl?: string;
  isActive: boolean;
  artists: ArtistProfileData[];
}

export interface InventoryItemData {
  id: string;
  studioId: string;
  name: string;
  category: string;
  quantity: number;
  lowStockThreshold: number;
  unit: string;
  costPerUnit?: number;
  supplier?: string;
  isLowStock: boolean;
}

// Notification types
export interface NotificationPreferenceData {
  userId: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  appointmentReminders: boolean;
  marketingEmails: boolean;
  aftercareReminders: boolean;
  paymentNotifications: boolean;
}

// Analytics types
export interface StudioAnalytics {
  period: string;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  totalRevenue: number;
  averageBookingValue: number;
  topArtists: Array<{ artistId: string; name: string; bookings: number; revenue: number }>;
  appointmentsByDay: Array<{ date: string; count: number }>;
  revenueByDay: Array<{ date: string; amount: number }>;
}
