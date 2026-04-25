export declare enum UserRole {
    CLIENT = "CLIENT",
    ARTIST = "ARTIST",
    STUDIO_OWNER = "STUDIO_OWNER",
    ADMIN = "ADMIN"
}
export declare enum AppointmentStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    CANCELLED = "CANCELLED",
    COMPLETED = "COMPLETED",
    NO_SHOW = "NO_SHOW"
}
export declare enum PaymentStatus {
    PENDING = "PENDING",
    PAID = "PAID",
    REFUNDED = "REFUNDED",
    FAILED = "FAILED"
}
export declare enum TattooStyle {
    TRADITIONAL = "TRADITIONAL",
    NEO_TRADITIONAL = "NEO_TRADITIONAL",
    REALISM = "REALISM",
    WATERCOLOR = "WATERCOLOR",
    BLACKWORK = "BLACKWORK",
    TRIBAL = "TRIBAL",
    JAPANESE = "JAPANESE",
    GEOMETRIC = "GEOMETRIC",
    MINIMALIST = "MINIMALIST",
    ILLUSTRATIVE = "ILLUSTRATIVE",
    OTHER = "OTHER"
}
export declare enum WaiverStatus {
    DRAFT = "DRAFT",
    SIGNED = "SIGNED",
    EXPIRED = "EXPIRED"
}
export declare enum MessageType {
    TEXT = "TEXT",
    IMAGE = "IMAGE",
    SYSTEM = "SYSTEM"
}
export declare enum NotificationChannel {
    EMAIL = "EMAIL",
    SMS = "SMS",
    PUSH = "PUSH",
    IN_APP = "IN_APP"
}
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
    dayOfWeek: number;
    startTime: string;
    endTime: string;
}
export interface BlockedDate {
    date: Date;
    reason?: string;
}
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
export interface AftercareData {
    id: string;
    appointmentId: string;
    artistId: string;
    clientId: string;
    instructions: string;
    milestones: AftercareMilestone[];
    photos: AftercarePhotoData[];
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
export interface AftercarePhotoData {
    id: string;
    aftercareId: string;
    url: string;
    dayNumber: number;
    artistComment?: string;
    uploadedAt: Date;
}
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
export interface StudioAnalytics {
    period: string;
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    totalRevenue: number;
    averageBookingValue: number;
    topArtists: Array<{
        artistId: string;
        name: string;
        bookings: number;
        revenue: number;
    }>;
    appointmentsByDay: Array<{
        date: string;
        count: number;
    }>;
    revenueByDay: Array<{
        date: string;
        amount: number;
    }>;
}
export declare enum FlashDesignStatus {
    AVAILABLE = "AVAILABLE",
    SOLD = "SOLD",
    RESERVED = "RESERVED"
}
export interface ArtistResidencyData {
    id: string;
    artistId: string;
    studioId: string;
    startDate: Date;
    endDate?: Date;
    isActive: boolean;
    announcement?: string;
    artist?: ArtistProfileData;
    studio?: StudioData;
    createdAt: Date;
}
export interface FlashDesignData {
    id: string;
    artistId: string;
    title: string;
    description?: string;
    imageUrl: string;
    price: number;
    style: TattooStyle;
    status: FlashDesignStatus;
    licensingTerms?: string;
    artist?: ArtistProfileData;
    createdAt: Date;
}
export interface FlashPurchaseData {
    id: string;
    designId: string;
    clientId: string;
    amount: number;
    purchasedAt: Date;
}
export interface ReviewData {
    id: string;
    appointmentId: string;
    artistId: string;
    clientId: string;
    rating: number;
    content?: string;
    artistResponse?: string;
    photos: ReviewPhotoData[];
    client?: Pick<UserProfile, 'id' | 'firstName' | 'lastName' | 'avatarUrl'>;
    createdAt: Date;
}
export interface ReviewPhotoData {
    id: string;
    reviewId: string;
    url: string;
    createdAt: Date;
}
export interface WebhookData {
    id: string;
    userId: string;
    url: string;
    events: string[];
    isActive: boolean;
    createdAt: Date;
}
export interface ApiKeyData {
    id: string;
    userId: string;
    name: string;
    keyPrefix: string;
    lastUsedAt?: Date;
    expiresAt?: Date;
    isActive: boolean;
    createdAt: Date;
}
export interface StyleMatchResult {
    detectedStyle: TattooStyle;
    confidence: number;
    recommendedArtists: ArtistProfileData[];
}
export interface SearchQuery {
    q?: string;
    style?: TattooStyle;
    city?: string;
    latitude?: number;
    longitude?: number;
    radiusKm?: number;
    minPrice?: number;
    maxPrice?: number;
    isAvailable?: boolean;
    page?: number;
    limit?: number;
}
export declare const WEBHOOK_EVENTS: readonly ["appointment.created", "appointment.confirmed", "appointment.cancelled", "appointment.completed", "payment.succeeded", "payment.refunded", "review.created"];
export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];
//# sourceMappingURL=index.d.ts.map