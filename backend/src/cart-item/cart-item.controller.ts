import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { CartItemService } from './cart-item.service';
import { CartItem } from './entities/cart-item.entity';
import { Pokemon } from 'src/pokemon/pokemon.entity';

@Controller('cart-item')
export class CartItemController {
    constructor(private readonly cartItemService: CartItemService) { }
    @Get()
    async findAll() {
        return await this.cartItemService.findAll()
    }
    @Get(':id')
    async findOne(@Param('id') id: string) {
        return await this.cartItemService.findOne(+id)
    }

    @Post('create')
    async addToCart(@Body() pokemon: Pokemon) {
        return await this.cartItemService.addToCart(pokemon)
    }

    @Put('update-quantity')
    async updateQuantity(@Body() body:CartItem){
        return await this.cartItemService.updateQuantity(body)
    }
    @Delete(':id')
    async deleteQuantity(@Param('id') id:string){
        return await this.cartItemService.deleteQuantity(+id)
    }
    @Delete('/delete/:id')
    async deleteCartItemWithCart(@Param('id') id:number){
        await this.cartItemService.deleteCartItemWithCartId(id)
        return {message: 'Cart items deleted successfully'}
    }
}
