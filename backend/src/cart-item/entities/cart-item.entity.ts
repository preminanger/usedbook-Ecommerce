import { Cart } from 'src/cart/entities/cart.entity';
import { Order } from 'src/order/entities/order.entity';
import { Pokemon } from 'src/pokemon/pokemon.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('cart_item')
export class CartItem {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({default: 1})
    quantity: number;

    @ManyToOne(() => Cart, cart => cart.cartItems)
    @JoinColumn({name: 'cart_id'})
    cart: Cart;

    @ManyToOne(() => Pokemon, (pokemon) => pokemon.cartItems)
    @JoinColumn({name: 'pokemon_id'})
    pokemon: Pokemon;

    @ManyToOne(() => Order, order => order.cartItems)
    order: Order
}
