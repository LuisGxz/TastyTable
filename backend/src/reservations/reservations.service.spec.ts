import { BadRequestException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { AvailabilityService } from '../availability/availability.service';
import { Reservation } from './schemas/reservation.schema';
import { Restaurant } from '../restaurants/schemas/restaurant.schema';
import { ReservationsService } from './reservations.service';
import type { AuthUser } from '../auth/auth.types';

const USER: AuthUser = { id: '64b000000000000000000001', email: 'd@t.app', name: 'Diner', role: 'diner', restaurantId: null };

const RESTAURANT = {
  _id: '64b0000000000000000000aa', name: 'Casa Brasa', seatingAreas: ['Indoor'],
  tables: [{ label: 'I1', capacity: 2, area: 'Indoor' }],
  openTime: '17:00', lastSeating: '19:00', slotMinutes: 30,
};

function futureDate(): string {
  return '2999-01-01';
}

async function build(occupancy: { time: string; tableLabel: string }[]) {
  const reservationModel = {
    find: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(occupancy) }),
    }),
    create: jest.fn().mockImplementation((doc: Record<string, unknown>) =>
      Promise.resolve({ ...doc, _id: '64b0000000000000000000ff', restaurantId: { toString: () => String(RESTAURANT._id) } }),
    ),
  };
  const restaurantModel = {
    findById: jest.fn().mockResolvedValue(RESTAURANT),
  };
  const moduleRef = await Test.createTestingModule({
    providers: [
      ReservationsService,
      AvailabilityService,
      { provide: getModelToken(Reservation.name), useValue: reservationModel },
      { provide: getModelToken(Restaurant.name), useValue: restaurantModel },
    ],
  }).compile();
  return { svc: moduleRef.get(ReservationsService), reservationModel };
}

describe('ReservationsService.create', () => {
  it('books the smallest free table and returns a confirmation', async () => {
    const { svc, reservationModel } = await build([]);
    const view = await svc.create(USER, { restaurantId: String(RESTAURANT._id), date: futureDate(), time: '18:00', partySize: 2 });
    expect(view.code).toMatch(/^TT-\d{5}-PDX$/);
    expect(view.tableLabel).toBe('I1');
    expect(view.status).toBe('confirmed');
    expect(reservationModel.create).toHaveBeenCalledTimes(1);
  });

  it('rejects a time in the past', async () => {
    const { svc } = await build([]);
    await expect(
      svc.create(USER, { restaurantId: String(RESTAURANT._id), date: '2000-01-01', time: '18:00', partySize: 2 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects a time outside the service window', async () => {
    const { svc } = await build([]);
    await expect(
      svc.create(USER, { restaurantId: String(RESTAURANT._id), date: futureDate(), time: '23:30', partySize: 2 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects when no table fits the party', async () => {
    const { svc } = await build([]);
    await expect(
      svc.create(USER, { restaurantId: String(RESTAURANT._id), date: futureDate(), time: '18:00', partySize: 8 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects when the only fitting table is already taken at that slot', async () => {
    const { svc } = await build([{ time: '18:00', tableLabel: 'I1' }]);
    await expect(
      svc.create(USER, { restaurantId: String(RESTAURANT._id), date: futureDate(), time: '18:00', partySize: 2 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
