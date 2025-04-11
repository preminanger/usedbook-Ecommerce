import { Module } from '@nestjs/common';
import { CartItemService } from './cart-item.service';
import { CartItemController } from './cart-item.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItem } from './entities/cart-item.entity';
import { Cart } from 'src/cart/entities/cart.entity';
import { Pokemon } from 'src/pokemon/pokemon.entity';
import { Order } from 'src/order/entities/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CartItem,Cart,Pokemon,Order])],
  controllers: [CartItemController],
  providers: [CartItemService],
  exports: [TypeOrmModule,CartItemService]
})
export class CartItemModule {}
