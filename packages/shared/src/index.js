"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WEBHOOK_EVENTS = exports.FlashDesignStatus = exports.NotificationChannel = exports.MessageType = exports.WaiverStatus = exports.TattooStyle = exports.PaymentStatus = exports.AppointmentStatus = exports.UserRole = void 0;
// User roles
var UserRole;
(function (UserRole) {
    UserRole["CLIENT"] = "CLIENT";
    UserRole["ARTIST"] = "ARTIST";
    UserRole["STUDIO_OWNER"] = "STUDIO_OWNER";
    UserRole["ADMIN"] = "ADMIN";
})(UserRole || (exports.UserRole = UserRole = {}));
// Appointment status
var AppointmentStatus;
(function (AppointmentStatus) {
    AppointmentStatus["PENDING"] = "PENDING";
    AppointmentStatus["CONFIRMED"] = "CONFIRMED";
    AppointmentStatus["CANCELLED"] = "CANCELLED";
    AppointmentStatus["COMPLETED"] = "COMPLETED";
    AppointmentStatus["NO_SHOW"] = "NO_SHOW";
})(AppointmentStatus || (exports.AppointmentStatus = AppointmentStatus = {}));
// Payment status
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["PAID"] = "PAID";
    PaymentStatus["REFUNDED"] = "REFUNDED";
    PaymentStatus["FAILED"] = "FAILED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
// Tattoo styles
var TattooStyle;
(function (TattooStyle) {
    TattooStyle["TRADITIONAL"] = "TRADITIONAL";
    TattooStyle["NEO_TRADITIONAL"] = "NEO_TRADITIONAL";
    TattooStyle["REALISM"] = "REALISM";
    TattooStyle["WATERCOLOR"] = "WATERCOLOR";
    TattooStyle["BLACKWORK"] = "BLACKWORK";
    TattooStyle["TRIBAL"] = "TRIBAL";
    TattooStyle["JAPANESE"] = "JAPANESE";
    TattooStyle["GEOMETRIC"] = "GEOMETRIC";
    TattooStyle["MINIMALIST"] = "MINIMALIST";
    TattooStyle["ILLUSTRATIVE"] = "ILLUSTRATIVE";
    TattooStyle["OTHER"] = "OTHER";
})(TattooStyle || (exports.TattooStyle = TattooStyle = {}));
var WaiverStatus;
(function (WaiverStatus) {
    WaiverStatus["DRAFT"] = "DRAFT";
    WaiverStatus["SIGNED"] = "SIGNED";
    WaiverStatus["EXPIRED"] = "EXPIRED";
})(WaiverStatus || (exports.WaiverStatus = WaiverStatus = {}));
var MessageType;
(function (MessageType) {
    MessageType["TEXT"] = "TEXT";
    MessageType["IMAGE"] = "IMAGE";
    MessageType["SYSTEM"] = "SYSTEM";
})(MessageType || (exports.MessageType = MessageType = {}));
var NotificationChannel;
(function (NotificationChannel) {
    NotificationChannel["EMAIL"] = "EMAIL";
    NotificationChannel["SMS"] = "SMS";
    NotificationChannel["PUSH"] = "PUSH";
    NotificationChannel["IN_APP"] = "IN_APP";
})(NotificationChannel || (exports.NotificationChannel = NotificationChannel = {}));
var FlashDesignStatus;
(function (FlashDesignStatus) {
    FlashDesignStatus["AVAILABLE"] = "AVAILABLE";
    FlashDesignStatus["SOLD"] = "SOLD";
    FlashDesignStatus["RESERVED"] = "RESERVED";
})(FlashDesignStatus || (exports.FlashDesignStatus = FlashDesignStatus = {}));
exports.WEBHOOK_EVENTS = [
    'appointment.created',
    'appointment.confirmed',
    'appointment.cancelled',
    'appointment.completed',
    'payment.succeeded',
    'payment.refunded',
    'review.created',
];
//# sourceMappingURL=index.js.map