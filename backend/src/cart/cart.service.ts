import { Cart } from 'src/cart/entities/cart.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from 'src/cart-item/entities/cart-item.entity';
import { User } from 'src/user/entities/user.entity';
import { Pokemon } from 'src/pokemon/pokemon.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private cartRepository: Repository<Cart>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(CartItem) private cartItemRepository: Repository<CartItem>
    
  ) {}
 
  async findAll() {
    return await this.cartRepository.find({relations: ['user']})
  }

  async findOne(id: number){
    return this.cartRepository.findOne({where: {id} ,relations: ['user']})
  }
  async fineOneCart(id: number) {
    try {
      if (!id || isNaN(id)) {
        console.warn('❌ Invalid cart ID:', id);
        return { status: 'error', message: 'Invalid cart ID' };
      }
  
      console.log('find one cart service called :-> ', id);
      const response = await this.cartRepository.findOne({
        where: { id },
        relations: {
          cartItems: {
            pokemon: true
          }
        }
      });
  
      return { status: 'success', data: response };
    } catch (e) {
      console.error('🔥 Error in fineOneCart:', e);
      return { status: 'error', message: 'Internal server error' };
    }
  }
  
 
  async addItemToCart(cartId: number, pokemonId: number, quantity: number) {
    const cart = await this.cartRepository.findOne({ where: { id: cartId }, relations: ['cartItems'] });

    if (!cart) {
        throw new Error('Cart not found');
    }

    const newItem = new CartItem();
    newItem.pokemon = { id: pokemonId } as Pokemon;
    newItem.quantity = quantity;
    newItem.cart = cart;

    cart.cartItems.push(newItem);
    return this.cartRepository.save(cart);
}

  async createCartWithItems(userId: number, items: CartItem[]) {
    const cart = this.cartRepository.create({ user: { id: userId }, cartItems: items });
    return this.cartRepository.save(cart);
}
  

}
