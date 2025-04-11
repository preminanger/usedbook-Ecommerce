import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CartItem } from './entities/cart-item.entity';
import { Repository } from 'typeorm';
import { Cart } from 'src/cart/entities/cart.entity';
import { Pokemon } from 'src/pokemon/pokemon.entity';

@Injectable()
export class CartItemService {

  constructor(
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(Pokemon)
    private pokemonRepository: Repository<Pokemon>
  ) { }

  async findAll() {
    return await this.cartItemRepository.find({ relations: ['cart', 'pokemon'] });
  }
  async findOne(id: number) {
    return await this.cartItemRepository.findOne({ where: { id }, relations: ['cart', 'pokemon'] })
  }
  async addToCart(body: any) {
    try {
      console.log('add to cart service called :-> ', body)
      if (!body.pokemon || !body.pokemon.id) {
        console.log("Error: body.pokemon or body.pokemon.id is undefined");
        throw new Error("Invalid Pokemon data");
      }
      if (!body.cart || !body.cart.id) {
        console.log("Error: body.cart or body.cart.id is undefined");
        throw new Error("Invalid Cart data");
      }
      let existingCartItem = await this.cartItemRepository.findOne({
        where: {
          pokemon: { id: body.pokemon.id },
          cart: { id: body.cart.id }
        }
      })
      console.log('existingCartItem ::->', existingCartItem)

      if (existingCartItem) {
        existingCartItem.quantity += body.quantity;
        console.log('Updated existingCartItem with new quantity:', existingCartItem);
        const added = await this.cartItemRepository.save(existingCartItem);
        return added;
      } else {
        const newCartItem = {
          pokemon: body.pokemon,
          cart: body.cart,
          quantity: body.quantity
        };
        console.log('New Cart Item to add :->', newCartItem);
        const added = await this.cartItemRepository.save(newCartItem);
        return added;
      }

    } catch (e) {
      console.log(e)
      return e
    }
  }
  async updateQuantity(body: CartItem) {
    try {
      console.log('updateQuantity service is called', body)
      let update = await this.cartItemRepository.update(body.id, { quantity: body.quantity })
      return { status: 'success',update }
    } catch (e) {
      console.log(e)
      return { status: 'error' }
    }
  }

  async deleteQuantity(id:number) {
    try {
      console.log('deleteQuantity service is called', id)
      let deleteResult = await this.cartItemRepository.findOne({where: { id }})
      await this.cartItemRepository.remove(deleteResult)
      return { status: 'success',deleteResult }
    } catch (e) {
      console.log(e)
      return { status: 'error' }
    }
  }
  async deleteCartItemWithCartId(id: number){
    await this.cartItemRepository.delete({cart: {id:id}})
  }
}


