import { Order } from 'src/order/entities/order.entity';
import { Pokemon } from 'src/pokemon/pokemon.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('order-item')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number; 

  @ManyToOne(() => Order, order => order.orderItems)
  @JoinColumn({ name: 'order_id'})
  order: Order; 
  
  @ManyToOne(() => Pokemon, { eager: true }) 
  @JoinColumn({ name: 'pokemon_id' })
  pokemon: Pokemon;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
