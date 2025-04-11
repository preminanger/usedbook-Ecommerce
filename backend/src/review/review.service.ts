import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { Pokemon } from 'src/pokemon/pokemon.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private reviewRepo: Repository<Review>,
  ) {}

  async create(reviewData: any) {
    const review = new Review();
  
    review.rating = reviewData.rating;
    review.comment = reviewData.comment;
  
    review.pokemon = { id: reviewData.pokemonId } as Pokemon;
    review.user = { id: reviewData.userId } as User;
  
    return await this.reviewRepo.save(review);
  }
  

  async findByProduct(productId: number) {
    return await this.reviewRepo.find({
      where: {
        pokemon: { id: productId }, 
      },
      relations: ['user', 'pokemon'], 
      order: { createdAt: 'DESC' },
    });
  }
  async findByUser(userId: number) {
    return await this.reviewRepo.find({
      where: { user: { id: userId } },
      relations: ['pokemon'],
    });
  }
  
}
