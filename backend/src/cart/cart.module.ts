import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from 'src/cart-item/entities/cart-item.entity';
import { User } from 'src/user/entities/user.entity';
import { Pokemon } from 'src/pokemon/pokemon.entity';
import { UserService } from 'src/user/user.service';
import { Address } from 'src/address/entities/address.entity';
import { Order } from 'src/order/entities/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cart,CartItem,User,Pokemon,Address,Order])],
  controllers: [CartController],
  providers: [CartService,UserService],
  exports: [TypeOrmModule.forFeature([Cart,User,Address]),CartService]
})
export class CartModule {}
