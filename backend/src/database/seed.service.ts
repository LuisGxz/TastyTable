import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model, Types } from 'mongoose';
import { ReservationStatus, UserRole } from '../common/enums';
import { Reservation } from '../reservations/schemas/reservation.schema';
import { Restaurant } from '../restaurants/schemas/restaurant.schema';
import { User } from '../users/schemas/user.schema';
import { RESTAURANT_SEED } from './seed-data';

const DEMO_PASSWORD = 'Taste123!';

/** Seeds a realistic Portland dining scene + demo accounts on first boot (idempotent). */
@Injectable()
export class SeedService implements OnModuleInit {
  private readonly log = new Logger(SeedService.name);

  constructor(
    @InjectModel(User.name) private readonly users: Model<User>,
    @InjectModel(Restaurant.name) private readonly restaurants: Model<Restaurant>,
    @InjectModel(Reservation.name) private readonly reservations: Model<Reservation>,
  ) {}

  async onModuleInit(): Promise<void> {
    if ((await this.restaurants.estimatedDocumentCount()) > 0) {
      this.log.log('Seed skipped — data already present.');
      return;
    }
    await this.seed();
    this.log.log('Seed complete.');
  }

  async seed(): Promise<void> {
    const hash = await bcrypt.hash(DEMO_PASSWORD, 10);

    const created = await this.restaurants.insertMany(RESTAURANT_SEED);
    const bySlug = new Map(created.map((r) => [r.slug, r]));
    const casaBrasa = bySlug.get('casa-brasa')!;

    const owner = await this.users.create({
      email: 'owner@casabrasa.app', passwordHash: hash, name: 'Marta Ríos',
      role: UserRole.Owner, restaurantId: casaBrasa._id,
    });
    await this.restaurants.updateOne({ _id: casaBrasa._id }, { ownerId: owner._id });

    const diner = await this.users.create({
      email: 'diner@tastytable.app', passwordHash: hash, name: 'Luis Chiquito', role: UserRole.Diner,
    });

    // Two sample reservations for the diner: one upcoming, one past.
    const noriko = bySlug.get('noriko-omakase')!;
    await this.reservations.create([
      {
        code: 'TT-88412-PDX', restaurantId: casaBrasa._id, userId: diner._id,
        restaurantName: casaBrasa.name, guestName: diner.name,
        tableLabel: 'P2', seatingArea: 'Patio',
        date: offsetDate(2), time: '19:30', partySize: 2, status: ReservationStatus.Confirmed,
      },
      {
        code: 'TT-71190-PDX', restaurantId: noriko._id, userId: diner._id,
        restaurantName: noriko.name, guestName: diner.name,
        tableLabel: 'B3', seatingArea: 'Bar',
        date: offsetDate(-12), time: '20:45', partySize: 2, status: ReservationStatus.Completed,
      },
    ]);
  }
}

/** A date offset from today as "YYYY-MM-DD". */
function offsetDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export { DEMO_PASSWORD };
export type SeededId = Types.ObjectId;
