import { Module, Controller } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PokemonModule } from './pokemon/pokemon.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pokemon } from './pokemon/pokemon.entity';
import { AdminModule } from './admin/admin.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { User } from './user/entities/user.entity';
import { Admin } from './admin/admin.entity';
import { CartModule } from './cart/cart.module';
import { CartItemModule } from './cart-item/cart-item.module';
import { Cart } from './cart/entities/cart.entity';
import { CartItem } from './cart-item/entities/cart-item.entity';
import { OrderModule } from './order/order.module';
import { AddressModule } from './address/address.module';
import { Order } from './order/entities/order.entity';
import { Address } from './address/entities/address.entity';
import { OrderItemModule } from './order-item/order-item.module';
import { OrderItem } from './order-item/entities/order-item.entity';
import { MessageModule } from './message/message.module';
import { ReviewModule } from './review/review.module';
import { Message } from './message/entities/message.entity';
import { Review } from './review/entities/review.entity';
import { ReportModule } from './report/report.module';
import { Report } from './report/entities/report.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'Prem@03022546',
      database: 'pokemon',
      entities: [Pokemon,User,Admin,Cart,CartItem,Order,Address,OrderItem,Message,Review,Report],
      synchronize: true,
      autoLoadEntities: true,
    }),
    PokemonModule,
    AdminModule,
    UserModule,
    AuthModule,
    CartModule,
    CartItemModule,
    OrderModule,
    AddressModule,
    OrderItemModule,
    MessageModule,
    ReviewModule,
    ReportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  
}
