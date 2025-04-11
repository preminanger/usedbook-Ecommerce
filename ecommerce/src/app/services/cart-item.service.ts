import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Pokemon } from './pokemon.service';

export interface CartItem {
  id : number;
  quantity : number;
  pokemon : Pokemon;
  stockQuantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartItemService {

  constructor(private http: HttpClient) { }

  addToCart(body: {pokemon: {id:number}; cart:{id:number}; quantity: number}){
    
    return this.http.post<CartItem>(environment.api_url + '/cart-item/create',body )
  }
  updateQuantity(body:CartItem){
    return this.http.put<CartItem>(environment.api_url + '/cart-item/update-quantity',body)
  }
  deleteQuantity(id:number){
    return this.http.delete<CartItem>(environment.api_url + '/cart-item/' + id)
  }
  findOneCartItem(id:number){
    return this.http.get<CartItem>(environment.api_url + '/cart-item/' + id)
  }

  deleteCartItemsByCartId(id :number){
    return this.http.delete(environment.api_url + '/cart-item/delete/' + id)
  }
}
     