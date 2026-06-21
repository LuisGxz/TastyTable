import { SlotAvailability } from '../availability/availability.service';
import { Restaurant } from './schemas/restaurant.schema';

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

export interface RestaurantDetail extends Omit<RestaurantCard, 'availableToday' | 'nextSlots'> {
  description: string;
  descriptionEs: string;
  address: string;
  seatingAreas: string[];
  menu: { name: string; nameEs: string; price: number; photo: string }[];
  openTime: string;
  lastSeating: string;
  slotMinutes: number;
}

type WithId = Restaurant & { _id: { toString(): string } };

export function toCard(r: WithId, today: SlotAvailability[]): RestaurantCard {
  const open = today.filter((s) => s.available).map((s) => s.time);
  return {
    id: r._id.toString(), slug: r.slug, name: r.name,
    cuisine: r.cuisine, cuisineEs: r.cuisineEs, priceLevel: r.priceLevel,
    neighborhood: r.neighborhood, city: r.city, rating: r.rating, photo: r.photo,
    availableToday: open.length > 0,
    nextSlots: open.slice(0, 3),
  };
}

export interface OwnerRestaurant extends RestaurantDetail {
  tables: { label: string; capacity: number; area: string }[];
}

export function toOwnerRestaurant(r: WithId): OwnerRestaurant {
  return {
    ...toDetail(r),
    tables: r.tables.map((t) => ({ label: t.label, capacity: t.capacity, area: t.area })),
  };
}

export function toDetail(r: WithId): RestaurantDetail {
  return {
    id: r._id.toString(), slug: r.slug, name: r.name,
    cuisine: r.cuisine, cuisineEs: r.cuisineEs, priceLevel: r.priceLevel,
    neighborhood: r.neighborhood, city: r.city, rating: r.rating, photo: r.photo,
    description: r.description, descriptionEs: r.descriptionEs, address: r.address,
    seatingAreas: r.seatingAreas,
    menu: r.menu.map((m) => ({ name: m.name, nameEs: m.nameEs, price: m.price, photo: m.photo })),
    openTime: r.openTime, lastSeating: r.lastSeating, slotMinutes: r.slotMinutes,
  };
}
