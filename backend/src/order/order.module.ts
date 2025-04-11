import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Order } from './entities/order.entity';
import { CartItem } from 'src/cart-item/entities/cart-item.entity';
import { OrderItem } from 'src/order-item/entities/order-item.entity';
import { Pokemon } from 'src/pokemon/pokemon.entity';
import { Address } from 'src/address/entities/address.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CartItem,Order,OrderItem,Pokemon,Address])],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [TypeOrmModule,OrderService]
})
export class OrderModule {}
