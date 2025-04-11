import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Cart } from 'src/cart/entities/cart.entity';
import { Order } from 'src/order/entities/order.entity';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'src/auth/constants';
import { Address } from 'src/address/entities/address.entity';
import { OrderModule } from 'src/order/order.module';
import { Report } from 'src/report/entities/report.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User,Cart,Order,Address,Report]),JwtModule.register({
    global:true,
    secret:jwtConstants.secret,
    signOptions: { expiresIn: '1d'}
  }),
  OrderModule
],
  providers: [UserService],
  controllers: [UserController],
  exports:[TypeOrmModule.forFeature([User,Cart,Order,Address]),UserService]
})
export class UserModule {}
