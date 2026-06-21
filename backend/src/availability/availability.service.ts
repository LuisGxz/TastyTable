import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ReservationStatus } from '../common/enums';
import { Reservation } from '../reservations/schemas/reservation.schema';
import { Restaurant, TableSpec } from '../restaurants/schemas/restaurant.schema';

export interface SlotAvailability {
  time: string;
  available: boolean;
}

/**
 * Turns a restaurant's service window + tables and the day's confirmed bookings into
 * per-slot availability. A slot is available if at least one table large enough for the
 * party (in the requested area, if any) is not already held at that time.
 */
@Injectable()
export class AvailabilityService {
  constructor(@InjectModel(Reservation.name) private readonly reservations: Model<Reservation>) {}

  /** All bookable time slots for a venue, e.g. ['17:00','17:30',…,'22:30']. */
  slots(restaurant: Pick<Restaurant, 'openTime' | 'lastSeating' | 'slotMinutes'>): string[] {
    const start = toMinutes(restaurant.openTime);
    const end = toMinutes(restaurant.lastSeating);
    const step = restaurant.slotMinutes || 30;
    const out: string[] = [];
    for (let m = start; m <= end; m += step) out.push(fromMinutes(m));
    return out;
  }

  private candidateTables(restaurant: Restaurant, partySize: number, area?: string): TableSpec[] {
    return restaurant.tables.filter(
      (t) => t.capacity >= partySize && (!area || t.area === area),
    );
  }

  /** Map of "HH:mm" → set of table labels already booked that day. */
  private async occupancy(restaurantId: Types.ObjectId | string, date: string): Promise<Map<string, Set<string>>> {
    const booked = await this.reservations
      .find({ restaurantId, date, status: ReservationStatus.Confirmed })
      .select('time tableLabel')
      .lean();
    const map = new Map<string, Set<string>>();
    for (const r of booked) {
      if (!map.has(r.time)) map.set(r.time, new Set());
      map.get(r.time)!.add(r.tableLabel);
    }
    return map;
  }

  /** Availability for every slot on a given date for a party (optionally in one area). */
  async forDate(
    restaurant: Restaurant & { _id: Types.ObjectId | string },
    date: string,
    partySize: number,
    area?: string,
  ): Promise<SlotAvailability[]> {
    const tables = this.candidateTables(restaurant, partySize, area);
    const slots = this.slots(restaurant);
    if (tables.length === 0) return slots.map((time) => ({ time, available: false }));

    const occupied = await this.occupancy(restaurant._id, date);
    return slots.map((time) => {
      const taken = occupied.get(time) ?? new Set<string>();
      const available = tables.some((t) => !taken.has(t.label));
      return { time, available };
    });
  }

  /** The first free table for an exact slot, or null if none — used when booking. */
  async findFreeTable(
    restaurant: Restaurant & { _id: Types.ObjectId | string },
    date: string,
    time: string,
    partySize: number,
    area?: string,
  ): Promise<TableSpec | null> {
    const tables = this.candidateTables(restaurant, partySize, area).sort((a, b) => a.capacity - b.capacity);
    if (tables.length === 0) return null;
    const occupied = await this.occupancy(restaurant._id, date);
    const taken = occupied.get(time) ?? new Set<string>();
    // Prefer the smallest table that fits, to keep larger tables free.
    return tables.find((t) => !taken.has(t.label)) ?? null;
  }
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}
function fromMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
