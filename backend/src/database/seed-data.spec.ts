import { generateReservationCode } from '../common/reservation-code';
import { RESTAURANT_SEED } from './seed-data';

describe('Seed data', () => {
  it('has a realistic spread of restaurants with unique slugs', () => {
    expect(RESTAURANT_SEED.length).toBeGreaterThanOrEqual(6);
    const slugs = new Set(RESTAURANT_SEED.map((r) => r.slug));
    expect(slugs.size).toBe(RESTAURANT_SEED.length);
  });

  it('each restaurant has tables, a menu and valid areas', () => {
    for (const r of RESTAURANT_SEED) {
      expect(r.tables.length).toBeGreaterThan(0);
      expect(r.menu.length).toBeGreaterThan(0);
      expect(r.priceLevel).toBeGreaterThanOrEqual(1);
      expect(r.priceLevel).toBeLessThanOrEqual(4);
      // Every table's area is one the restaurant actually offers.
      for (const t of r.tables) {
        expect(r.seatingAreas).toContain(t.area);
        expect(t.capacity).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('generates reservation codes in the TT-#####-PDX format', () => {
    for (let i = 0; i < 50; i++) {
      expect(generateReservationCode()).toMatch(/^TT-\d{5}-PDX$/);
    }
  });
});
