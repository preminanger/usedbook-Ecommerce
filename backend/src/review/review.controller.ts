import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ReviewService } from './review.service';
import { Review } from './entities/review.entity';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post('create')
create(@Body() body: any) {
  return this.reviewService.create(body);
}


  @Get('product/:productId')
  getReviewsByProduct(@Param('productId') productId: number) {
    return this.reviewService.findByProduct(productId);
  }
  @Get('user/:userId')
getReviewsByUser(@Param('userId') userId: number) {
  return this.reviewService.findByUser(userId);
}

}
