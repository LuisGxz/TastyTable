import { Controller, Get, Param, Query } from '@nestjs/common';
import { AvailabilityQueryDto, SearchRestaurantsDto } from './dto/restaurant-query.dto';
import { RestaurantsService } from './restaurants.service';

@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurants: RestaurantsService) {}

  @Get()
  search(@Query() query: SearchRestaurantsDto) {
    return this.restaurants.search(query);
  }

  @Get(':slug')
  detail(@Param('slug') slug: string) {
    return this.restaurants.detail(slug);
  }

  @Get(':slug/availability')
  availability(@Param('slug') slug: string, @Query() query: AvailabilityQueryDto) {
    return this.restaurants.availabilityFor(slug, query);
  }
}
