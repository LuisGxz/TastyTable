import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { AvailabilityService } from './availability.service';
import { Reservation } from '../reservations/schemas/reservation.schema';
import { Restaurant } from '../restaurants/schemas/restaurant.schema';

/** A fake Reservation model whose find().select().lean() resolves to `booked`. */
function fakeReservationModel(booked: { time: string; tableLabel: string }[]) {
  return {
    find: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(booked),
      }),
    }),
  };
}

function restaurant(overrides: Partial<Restaurant> = {}): Restaurant & { _id: string } {
  return {
    openTime: '17:00', lastSeating: '19:00', slotMinutes: 30,
    tables: [
      { label: 'I1', capacity: 2, area: 'Indoor' },
      { label: 'I2', capacity: 4, area: 'Indoor' },
      { label: 'P1', capacity: 2, area: 'Patio' },
    ],
    seatingAreas: ['Indoor', 'Patio'],
    ...overrides,
  } as unknown as Restaurant & { _id: string };
}

async function build(booked: { time: string; tableLabel: string }[]) {
  const moduleRef = await Test.createTestingModule({
    providers: [
      AvailabilityService,
      { provide: getModelToken(Reservation.name), useValue: fakeReservationModel(booked) },
    ],
  }).compile();
  return moduleRef.get(AvailabilityService);
}

describe('AvailabilityService', () => {
  it('generates inclusive slots across the service window', async () => {
    const svc = await build([]);
    expect(svc.slots({ openTime: '17:00', lastSeating: '19:00', slotMinutes: 30 })).toEqual([
      '17:00', '17:30', '18:00', '18:30', '19:00',
    ]);
  });

  it('marks every slot available when nothing is booked', async () => {
    const svc = await build([]);
    const out = await svc.forDate(restaurant(), '2026-07-01', 2);
    expect(out).toHaveLength(5);
    expect(out.every((s) => s.available)).toBe(true);
  });

  it('marks a slot unavailable only when all fitting tables are taken', async () => {
    // At 18:00 both 2-tops (I1, P1) and the 4-top (I2) are booked → party of 2 has nothing.
    const svc = await build([
      { time: '18:00', tableLabel: 'I1' },
      { time: '18:00', tableLabel: 'I2' },
      { time: '18:00', tableLabel: 'P1' },
    ]);
    const out = await svc.forDate(restaurant(), '2026-07-01', 2);
    expect(out.find((s) => s.time === '18:00')!.available).toBe(false);
    expect(out.find((s) => s.time === '17:30')!.available).toBe(true);
  });

  it('respects party size — a party of 4 ignores 2-tops', async () => {
    const svc = await build([{ time: '18:00', tableLabel: 'I2' }]); // the only 4-top is taken
    const out = await svc.forDate(restaurant(), '2026-07-01', 4);
    expect(out.find((s) => s.time === '18:00')!.available).toBe(false);
    expect(out.find((s) => s.time === '18:30')!.available).toBe(true);
  });

  it('filters by seating area', async () => {
    const svc = await build([{ time: '18:00', tableLabel: 'P1' }]);
    const out = await svc.forDate(restaurant(), '2026-07-01', 2, 'Patio');
    // Patio only has P1; booked at 18:00 → unavailable there even though Indoor is free.
    expect(out.find((s) => s.time === '18:00')!.available).toBe(false);
  });

  it('findFreeTable prefers the smallest table that fits and skips taken ones', async () => {
    const svc = await build([{ time: '18:00', tableLabel: 'I1' }]);
    const t = await svc.findFreeTable(restaurant(), '2026-07-01', '18:00', 2);
    // I1 (2-top) is taken → next smallest fitting is P1 (2-top), not the 4-top I2.
    expect(t?.label).toBe('P1');
  });

  it('findFreeTable returns null when nothing fits', async () => {
    const svc = await build([]);
    const t = await svc.findFreeTable(restaurant(), '2026-07-01', '18:00', 12);
    expect(t).toBeNull();
  });
});
