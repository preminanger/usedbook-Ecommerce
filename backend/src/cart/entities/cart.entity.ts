import { CartItem } from 'src/cart-item/entities/cart-item.entity';
import { User } from 'src/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, OneToOne, OneToMany, JoinColumn } from 'typeorm';

@Entity('cart')
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.cart)
  @JoinColumn({name: 'user_id'})
  user: User;

  @OneToMany(() => CartItem, (cartItem) => cartItem.cart )
  cartItems: CartItem[];
}
