// src/review/review.entity.ts
import { Pokemon } from 'src/pokemon/pokemon.entity';
import { User } from 'src/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';

@Entity()
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  rating: number; // เช่น 1-5 ดาว

  @Column({ type: 'text' })
  comment: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, user => user.reviews)
  user: User;

  @ManyToOne(() => Pokemon, { eager: false })
  pokemon: Pokemon;

}
