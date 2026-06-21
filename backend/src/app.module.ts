import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { AvailabilityModule } from './availability/availability.module';
import { DatabaseModule } from './database/database.module';
import { HealthController } from './health.controller';
import { OwnerModule } from './owner/owner.module';
import { ReservationsModule } from './reservations/reservations.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI ?? 'mongodb://localhost:27018/tastytable'),
    UsersModule,
    AuthModule,
    RestaurantsModule,
    ReservationsModule,
    AvailabilityModule,
    OwnerModule,
    DatabaseModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
