import { IsInt, IsMongoId, IsOptional, IsString, Matches, Max, Min } from 'class-validator';

export class CreateReservationDto {
  @IsMongoId() restaurantId: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be YYYY-MM-DD' }) date: string;
  @Matches(/^\d{2}:\d{2}$/, { message: 'time must be HH:mm' }) time: string;

  @IsInt() @Min(1) @Max(20) partySize: number;

  @IsOptional() @IsString() seatingArea?: string;
}
