import { UserRole, AppointmentStatus, TattooStyle, PaymentStatus } from '@inksync/shared';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatarUrl?: string;
  emailVerified: boolean;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface Artist {
  id: string;
  userId: string;
  bio: string;
  styles: TattooStyle[];
  hourlyRate?: number;
  city: string;
  state: string;
  instagramHandle?: string;
  isAvailable: boolean;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  portfolioImages: PortfolioImage[];
}

export interface PortfolioImage {
  id: string;
  url: string;
  style: TattooStyle;
  title?: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  artistId: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  serviceType: string;
  description?: string;
  depositAmount?: number;
  depositPaid: boolean;
  paymentStatus: PaymentStatus;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  artist: {
    id: string;
    user: { firstName: string; lastName: string; avatarUrl?: string };
  };
}

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  type: 'TEXT' | 'IMAGE';
  createdAt: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
}

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Explore: undefined;
  Bookings: undefined;
  Messages: undefined;
  Profile: undefined;
};

export type HomeStackParamList = {
  HomeScreen: undefined;
  ArtistDetail: { artistId: string };
  BookingCreate: { artistId: string };
  AppointmentDetail: { appointmentId: string };
};

export type BookingsStackParamList = {
  AppointmentList: undefined;
  AppointmentDetail: { appointmentId: string };
  WaiverSign: { appointmentId: string; waiverId: string };
  Aftercare: { appointmentId: string };
};

export type MessagesStackParamList = {
  ChatList: undefined;
  ChatRoom: { roomId: string; appointmentId: string };
};
