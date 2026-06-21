import { Reservation } from './schemas/reservation.schema';

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
  status: string;
  isPast: boolean;
}

interface PopulatedRestaurant {
  slug?: string;
  address?: string;
  photo?: string;
}

type WithId = Reservation & { _id: { toString(): string } };

/** Combine "YYYY-MM-DD" + "HH:mm" into a Date for past/upcoming sorting. */
export function slotDate(date: string, time: string): Date {
  return new Date(`${date}T${time}:00`);
}

export function toView(r: WithId, restaurant?: PopulatedRestaurant | null): ReservationView {
  return {
    id: r._id.toString(),
    code: r.code,
    restaurantId: r.restaurantId.toString(),
    restaurantName: r.restaurantName,
    restaurantSlug: restaurant?.slug ?? null,
    address: restaurant?.address ?? null,
    photo: restaurant?.photo ?? null,
    guestName: r.guestName,
    date: r.date,
    time: r.time,
    partySize: r.partySize,
    seatingArea: r.seatingArea,
    tableLabel: r.tableLabel,
    status: r.status,
    isPast: slotDate(r.date, r.time).getTime() < Date.now(),
  };
}
