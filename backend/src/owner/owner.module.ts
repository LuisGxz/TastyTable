import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ReservationsModule } from '../reservations/reservations.module';
import { RestaurantsModule } from '../restaurants/restaurants.module';
import { OwnerController } from './owner.controller';

@Module({
  imports: [RestaurantsModule, ReservationsModule, AuthModule],
  controllers: [OwnerController],
})
export class OwnerModule {}
