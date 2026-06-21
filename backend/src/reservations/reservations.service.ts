import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AvailabilityService } from '../availability/availability.service';
import { ReservationStatus } from '../common/enums';
import { generateReservationCode } from '../common/reservation-code';
import { Restaurant } from '../restaurants/schemas/restaurant.schema';
import { AuthUser } from '../auth/auth.types';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationView, slotDate, toView } from './reservation.mappers';
import { Reservation } from './schemas/reservation.schema';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectModel(Reservation.name) private readonly reservations: Model<Reservation>,
    @InjectModel(Restaurant.name) private readonly restaurants: Model<Restaurant>,
    private readonly availability: AvailabilityService,
  ) {}

  async create(user: AuthUser, dto: CreateReservationDto): Promise<ReservationView> {
    const restaurant = await this.restaurants.findById(dto.restaurantId);
    if (!restaurant) throw new NotFoundException('Restaurant not found.');

    if (slotDate(dto.date, dto.time).getTime() < Date.now()) {
      throw new BadRequestException('That time is in the past.');
    }
    if (dto.seatingArea && !restaurant.seatingAreas.includes(dto.seatingArea)) {
      throw new BadRequestException('Unknown seating area for this restaurant.');
    }
    if (!this.availability.slots(restaurant).includes(dto.time)) {
      throw new BadRequestException('That time is outside the service window.');
    }

    const table = await this.availability.findFreeTable(
      restaurant, dto.date, dto.time, dto.partySize, dto.seatingArea,
    );
    if (!table) throw new BadRequestException('No table available for that time and party size.');

    const created = await this.reservations.create({
      code: generateReservationCode(),
      restaurantId: restaurant._id,
      userId: new Types.ObjectId(user.id),
      restaurantName: restaurant.name,
      guestName: user.name,
      tableLabel: table.label,
      seatingArea: table.area,
      date: dto.date,
      time: dto.time,
      partySize: dto.partySize,
      status: ReservationStatus.Confirmed,
    });
    return toView(created, restaurant);
  }

  /** A diner's reservations, split into upcoming (asc) and history (desc). */
  async mine(user: AuthUser): Promise<{ upcoming: ReservationView[]; past: ReservationView[] }> {
    const docs = await this.reservations
      .find({ userId: new Types.ObjectId(user.id) })
      .populate<{ restaurantId: { _id: unknown; slug: string; address: string; photo: string } }>(
        'restaurantId', 'slug address photo',
      )
      .lean();

    const views: ReservationView[] = docs.map((d) => {
      const rest = d.restaurantId;
      return {
        id: String(d._id),
        code: d.code,
        restaurantId: rest?._id ? String(rest._id) : '',
        restaurantName: d.restaurantName,
        restaurantSlug: rest?.slug ?? null,
        address: rest?.address ?? null,
        photo: rest?.photo ?? null,
        guestName: d.guestName,
        date: d.date,
        time: d.time,
        partySize: d.partySize,
        seatingArea: d.seatingArea,
        tableLabel: d.tableLabel,
        status: d.status,
        isPast: slotDate(d.date, d.time).getTime() < Date.now(),
      };
    });

    // Upcoming = confirmed and still in the future; everything else is history.
    const isUpcoming = (v: ReservationView) => !v.isPast && v.status === ReservationStatus.Confirmed;
    const upcoming = views.filter(isUpcoming).sort((a, b) => slotDate(a.date, a.time).getTime() - slotDate(b.date, b.time).getTime());
    const past = views.filter((v) => !isUpcoming(v)).sort((a, b) => slotDate(b.date, b.time).getTime() - slotDate(a.date, a.time).getTime());
    return { upcoming, past };
  }

  async cancel(user: AuthUser, id: string): Promise<ReservationView> {
    const reservation = await this.reservations.findById(id);
    if (!reservation) throw new NotFoundException('Reservation not found.');
    if (reservation.userId.toString() !== user.id) {
      throw new ForbiddenException('This reservation is not yours.');
    }
    if (reservation.status !== ReservationStatus.Confirmed) {
      throw new BadRequestException('Only confirmed reservations can be cancelled.');
    }
    if (slotDate(reservation.date, reservation.time).getTime() < Date.now()) {
      throw new BadRequestException('Past reservations cannot be cancelled.');
    }
    reservation.status = ReservationStatus.Cancelled;
    await reservation.save();
    const restaurant = await this.restaurants.findById(reservation.restaurantId).select('slug address photo');
    return toView(reservation, restaurant ?? undefined);
  }

  /** Upcoming confirmed reservations for the owner's restaurant. */
  async forRestaurant(restaurantId: string): Promise<ReservationView[]> {
    const docs = await this.reservations
      .find({ restaurantId: new Types.ObjectId(restaurantId), status: ReservationStatus.Confirmed })
      .sort({ date: 1, time: 1 });
    return docs
      .map((d) => toView(d))
      .filter((v) => !v.isPast);
  }
}
