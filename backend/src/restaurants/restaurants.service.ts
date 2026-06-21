import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AvailabilityService } from '../availability/availability.service';
import { AvailabilityQueryDto, SearchRestaurantsDto } from './dto/restaurant-query.dto';
import { UpsertTableDto } from './dto/table.dto';
import { RestaurantCard, RestaurantDetail, toCard, toDetail } from './restaurant.mappers';
import { Restaurant, RestaurantDocument } from './schemas/restaurant.schema';

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectModel(Restaurant.name) private readonly restaurants: Model<Restaurant>,
    private readonly availability: AvailabilityService,
  ) {}

  /** Discover list with each card carrying tonight's availability (party of 2). */
  async search(dto: SearchRestaurantsDto): Promise<RestaurantCard[]> {
    const filter: Record<string, unknown> = {};
    if (dto.cuisine) filter.cuisine = new RegExp(escapeRegex(dto.cuisine), 'i');
    if (dto.q) {
      const rx = new RegExp(escapeRegex(dto.q), 'i');
      filter.$or = [{ name: rx }, { cuisine: rx }, { neighborhood: rx }];
    }

    const sort: Record<string, 1 | -1> = dto.sort === 'name' ? { name: 1 } : { rating: -1 };
    const docs = await this.restaurants.find(filter).sort(sort);

    const date = todayStr();
    return Promise.all(
      docs.map(async (r) => {
        const slots = await this.availability.forDate(r, date, 2);
        return toCard(r, slots);
      }),
    );
  }

  async detail(slug: string): Promise<RestaurantDetail> {
    const r = await this.bySlug(slug);
    return toDetail(r);
  }

  async availabilityFor(slug: string, dto: AvailabilityQueryDto) {
    const r = await this.bySlug(slug);
    const date = dto.date ?? todayStr();
    if (dto.area && !r.seatingAreas.includes(dto.area)) {
      throw new BadRequestException('Unknown seating area for this restaurant.');
    }
    const slots = await this.availability.forDate(r, date, dto.party, dto.area);
    return { date, party: dto.party, area: dto.area ?? null, slots };
  }

  async bySlug(slug: string): Promise<RestaurantDocument> {
    const r = await this.restaurants.findOne({ slug: slug.toLowerCase() });
    if (!r) throw new NotFoundException('Restaurant not found.');
    return r;
  }

  // ── Owner panel ──
  async ownedBy(restaurantId: string | null): Promise<RestaurantDocument> {
    const r = restaurantId ? await this.restaurants.findById(restaurantId) : null;
    if (!r) throw new NotFoundException('You do not manage a restaurant.');
    return r;
  }

  async addTable(restaurantId: string | null, dto: UpsertTableDto): Promise<RestaurantDocument> {
    const r = await this.ownedBy(restaurantId);
    if (r.tables.some((t) => t.label.toLowerCase() === dto.label.toLowerCase())) {
      throw new ConflictException(`A table labelled "${dto.label}" already exists.`);
    }
    if (!r.seatingAreas.includes(dto.area)) r.seatingAreas.push(dto.area);
    r.tables.push(dto);
    await r.save();
    return r;
  }

  async updateTable(restaurantId: string | null, label: string, dto: UpsertTableDto): Promise<RestaurantDocument> {
    const r = await this.ownedBy(restaurantId);
    const table = r.tables.find((t) => t.label.toLowerCase() === label.toLowerCase());
    if (!table) throw new NotFoundException('Table not found.');
    table.label = dto.label;
    table.capacity = dto.capacity;
    table.area = dto.area;
    if (!r.seatingAreas.includes(dto.area)) r.seatingAreas.push(dto.area);
    await r.save();
    return r;
  }

  async removeTable(restaurantId: string | null, label: string): Promise<RestaurantDocument> {
    const r = await this.ownedBy(restaurantId);
    const before = r.tables.length;
    r.tables = r.tables.filter((t) => t.label.toLowerCase() !== label.toLowerCase());
    if (r.tables.length === before) throw new NotFoundException('Table not found.');
    await r.save();
    return r;
  }
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
