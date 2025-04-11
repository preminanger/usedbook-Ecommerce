import { CartItem } from 'src/cart-item/entities/cart-item.entity';
import { Review } from 'src/review/entities/review.entity';
import { User } from 'src/user/entities/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';


export enum BookCondition {
  LIKE_NEW = 'Like New',
  VERY_GOOD = 'Very Good',
  GOOD = 'Good',
  ACCEPTABLE = 'Acceptable',
  POOR = 'Poor',
}
export enum Genre {
  FICTION = 'Fiction',
  NONFICTION = 'Non-fiction',
  ROMANCE = 'Romance',
  FANTASY = 'Fantasy',
  SCIFI = 'Sci-Fi',
  HISTORY = 'History',
  SELFHELP = 'Self-help',
  BIOGRAPHY = 'Biography',
  MYSTERY = 'Mystery',
  EDUCATION = 'Education',
  KID = 'Kid'
}

@Entity()
export class Pokemon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100 })
  author: string;

  @Column({ type: 'text' })
  des: string;

  @Column({ default: 1 })
  quantity: number

  @Column()
  price: number;

  @Column()
  pages: number;

  @Column({ length: 100 })
  publicationYear: string;

  @Column({ type: 'simple-array' })
  genre: string[];


  @Column({ type: 'text', nullable: true })
  imageUrls: string;

  // ผู้แปล (ถ้ามี)
  @Column({ length: 100, nullable: true })
  translator: string;

  // สำนักพิมพ์
  @Column({ length: 100 })
  publisher: string;

  // เลข ISBN
  @Column({ length: 22 })
  isbn: string;

  @Column({ type: 'enum', enum: BookCondition })
  condition: BookCondition;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @CreateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  @OneToMany(() => CartItem, (cartItem) => cartItem.pokemon)
  @JoinColumn({ name: 'cart_item_id' })
  cartItems: CartItem[];

  @ManyToOne(() => User, user => user.pokemons)
  @JoinColumn({ name: 'user_id' })
  user: User;
  @OneToMany(() => Review, review => review.pokemon)
reviews: Review[];

  imageUrlsParsed?: string[];
}
