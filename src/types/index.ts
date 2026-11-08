export type PageType = 'catalog' | 'detail' | 'booking';

export type RoomCategory = 'all' | 'focus' | 'meeting' | 'team' | 'event';

export type UserCategory = 'freelancer' | 'mahasiswa' | 'komunitas' | 'profesional';

export interface RoomSpecifications {
  area: string;
  wifiSpeed: string;
  powerOutlets: number;
  hasProjector: boolean;
  hasWhiteboard: boolean;
  hasSoundSystem: boolean;
  hasCoffeeAccess: boolean;
}

export interface Room {
  id: string;
  name: string;
  category: 'focus' | 'meeting' | 'team' | 'event';
  categoryLabel: string;
  floor: number;
  capacity: number;
  pricePerHour: number;
  description: string;
  facilities: string[];
  available: boolean;
  imageUrl: string;
  specifications: RoomSpecifications;
  rules: string[];
}

export interface BookingFormData {
  fullName: string;
  email: string;
  phone: string;
  userCategory: UserCategory | '';
  roomId: string;
  date: string;
  startTime: string;
  endTime: string;
  attendees: string;
  notes: string;
  agreeToTerms: boolean;
}

export type BookingFormErrors = Partial<Record<keyof BookingFormData, string>>;

export interface BookingConfirmation {
  bookingId: string;
  roomName: string;
  fullName: string;
  email: string;
  phone: string;
  userCategory: string;
  date: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  attendees: number;
  totalCost: number;
  createdAt: string;
}
