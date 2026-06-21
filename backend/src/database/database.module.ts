import { Module } from '@nestjs/common';
import { ReservationsModule } from '../reservations/reservations.module';
import { RestaurantsModule } from '../restaurants/restaurants.module';
import { UsersModule } from '../users/users.module';
import { SeedService } from './seed.service';

@Module({
  imports: [UsersModule, RestaurantsModule, ReservationsModule],
  providers: [SeedService],
  exports: [SeedService],
})
export class DatabaseModule {}
