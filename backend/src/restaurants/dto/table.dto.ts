import { IsInt, IsString, Max, Min, MinLength } from 'class-validator';

export class UpsertTableDto {
  @IsString() @MinLength(1) label: string;
  @IsInt() @Min(1) @Max(20) capacity: number;
  @IsString() @MinLength(1) area: string;
}
