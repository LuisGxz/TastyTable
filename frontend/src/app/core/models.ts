/** Mirrors of the backend API shapes. */

export type UserRole = 'diner' | 'owner';
export type ReservationStatus = 'confirmed' | 'cancelled' | 'completed';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  restaurantId: string | null;
}
export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
}

export interface MenuItem { name: string; nameEs: string; price: number; photo: string; }

export interface RestaurantCard {
  id: string;
  slug: string;
  name: string;
  cuisine: string;
  cuisineEs: string;
  priceLevel: number;
  neighborhood: string;
  city: string;
  rating: number;
  photo: string;
  availableToday: boolean;
  nextSlots: string[];
}

export interface RestaurantDetail {
  id: string;
  slug: string;
  name: string;
  cuisine: string;
  cuisineEs: string;
  priceLevel: number;
  neighborhood: string;
  city: string;
  rating: number;
  photo: string;
  description: string;
  descriptionEs: string;
  address: string;
  seatingAreas: string[];
  menu: MenuItem[];
  openTime: string;
  lastSeating: string;
  slotMinutes: number;
}

export interface TableSpec { label: string; capacity: number; area: string; }
export interface OwnerRestaurant extends RestaurantDetail { tables: TableSpec[]; }

export interface SlotAvailability { time: string; available: boolean; }
export interface AvailabilityResponse {
  date: string;
  party: number;
  area: string | null;
  slots: SlotAvailability[];
}

export interface ReservationView {
  id: string;
  code: string;
  restaurantId: string;
  restaurantName: string;
  restaurantSlug: string | null;
  address: string | null;
  photo: string | null;
  guestName: string;
  date: string;
  time: string;
  partySize: number;
  seatingArea: string;
  tableLabel: string;
  status: ReservationStatus;
  isPast: boolean;
}
export interface MyReservations { upcoming: ReservationView[]; past: ReservationView[]; }

export interface ApiError { statusCode?: number; message?: string | string[]; error?: string; }
