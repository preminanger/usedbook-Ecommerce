import { Address } from "src/address/entities/address.entity";
import { CartItem } from "src/cart-item/entities/cart-item.entity";
import { OrderItem } from "src/order-item/entities/order-item.entity";
import { Pokemon } from "src/pokemon/pokemon.entity";
import { User } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

export enum OrderStatus {
    WAITING_PAYMENT = 'waiting_payment',
    SLIP_UPLOADED = 'slip_uploaded',
    PAID = 'paid',
    PREPARING = 'preparing',
    SHIPPED = 'shipped',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled',
}
export enum ShippingMethod {
    STANDARD = 'standard',
    EXPRESS = 'express',
    SAME_DAY = 'same_day',
  }
@Entity('order')
export class Order {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    price: number;
    @Column({ nullable: true })
    payment_proof: string;
    @Column({ default: 'text' })
    order_code: string

    @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.WAITING_PAYMENT }) // pending, paid, shipped, canceled
    status: OrderStatus;

    @OneToMany(() => CartItem, (cartItem) => cartItem.order)
    cartItems: CartItem[]

    @ManyToOne(() => User, user => user.order)
    @JoinColumn({ name: 'user_id' })
    user: User

    @CreateDateColumn()
    created_at: Date
    @Column({ nullable: true })
    trackingNumber?: string;

    @Column({ nullable: true })
    shippingProvider?: string;

    @Column({ type: 'enum', enum: ShippingMethod, default: ShippingMethod.STANDARD })
    shippingMethod: ShippingMethod;

    @Column({ type: 'float', default: 0 })
    shippingFee: number;
    @ManyToOne(() => Address, { nullable: true })
    @JoinColumn({ name: 'shipping_address_id' })
    shippingAddress: Address;

    @OneToMany(() => OrderItem, orderItem => orderItem.order, { cascade: true })
    orderItems: OrderItem[];

    @ManyToOne(() => Pokemon, { eager: true })
    pokemon: Pokemon;

}
