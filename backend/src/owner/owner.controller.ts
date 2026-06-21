import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import type { AuthUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../common/enums';
import { ReservationsService } from '../reservations/reservations.service';
import { UpsertTableDto } from '../restaurants/dto/table.dto';
import { toOwnerRestaurant } from '../restaurants/restaurant.mappers';
import { RestaurantsService } from '../restaurants/restaurants.service';

/** Restaurant owner panel — manage tables and view incoming bookings. */
@Controller('owner')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.Owner)
export class OwnerController {
  constructor(
    private readonly restaurants: RestaurantsService,
    private readonly reservations: ReservationsService,
  ) {}

  @Get('restaurant')
  async restaurant(@CurrentUser() user: AuthUser) {
    return toOwnerRestaurant(await this.restaurants.ownedBy(user.restaurantId));
  }

  @Get('reservations')
  async bookings(@CurrentUser() user: AuthUser) {
    const r = await this.restaurants.ownedBy(user.restaurantId);
    return this.reservations.forRestaurant((r._id as { toString(): string }).toString());
  }

  @Post('tables')
  async addTable(@CurrentUser() user: AuthUser, @Body() dto: UpsertTableDto) {
    return toOwnerRestaurant(await this.restaurants.addTable(user.restaurantId, dto));
  }

  @Patch('tables/:label')
  async updateTable(@CurrentUser() user: AuthUser, @Param('label') label: string, @Body() dto: UpsertTableDto) {
    return toOwnerRestaurant(await this.restaurants.updateTable(user.restaurantId, label, dto));
  }

  @Delete('tables/:label')
  async removeTable(@CurrentUser() user: AuthUser, @Param('label') label: string) {
    return toOwnerRestaurant(await this.restaurants.removeTable(user.restaurantId, label));
  }
}
