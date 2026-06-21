import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Matches, Max, Min } from 'class-validator';

export class SearchRestaurantsDto {
  @IsOptional() @IsString() q?: string;
  @IsOptional() @IsString() cuisine?: string;
  @IsOptional() @IsIn(['rating', 'name']) sort?: 'rating' | 'name';
}

export class AvailabilityQueryDto {
  /** "YYYY-MM-DD". Defaults to today when omitted. */
  @IsOptional() @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be YYYY-MM-DD' }) date?: string;

  @Transform(({ value }) => (value === undefined ? 2 : Number(value)))
  @IsInt() @Min(1) @Max(20) party: number;

  @IsOptional() @IsString() area?: string;
}
