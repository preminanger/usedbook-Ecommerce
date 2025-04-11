import { Controller, Get, Param, Post, Body, Put, Delete, BadRequestException, Query } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartItem } from 'src/cart-item/entities/cart-item.entity';
import { Cart } from './entities/cart.entity';
import { UserService } from 'src/user/user.service';
import { getegid } from 'process';
import { CartItemService } from 'src/cart-item/cart-item.service';

@Controller('cart')
export class CartController {
  constructor(private readonly _cart: CartService, private readonly _user: UserService) { }

  @Get()
  findAll() {
    return this._cart.findAll();
  }
  
  @Get('find-one')
  findOneCart(@Query('id') id:string){
    console.log(id)
    return this._cart.fineOneCart(+id)
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this._cart.findOne(+id);
  }
  @Post('user/:id/add')
  async addCartItem(
    @Param('id') user_id: number,
    @Body() addItem: { pokemon_id: number; quantity: number }
  ) {
    try {
      const result = await this._cart.addItemToCart(user_id, addItem.pokemon_id, addItem.quantity);
      return { message: 'Item added to cart successfully', result };
    } catch (error) {
      console.error('Error adding item to cart:', error);
      throw new BadRequestException('Failed to add item to cart');
    }
  }
  @Post('initialize')
  async initializeCart(@Body() body: { userId: number }): Promise<Cart> {
    return await this._user.initializeCart(body.userId);
  }

}
