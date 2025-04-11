import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { User } from './user.service';
import { CartItem } from './cart-item.service';
import { BehaviorSubject } from 'rxjs';

export interface Cart {
  id: number;
  user: User;
  cartItems: CartItem[]

}
@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartItems: any[] = [];

  private cartItemSubject = new BehaviorSubject<any[]>([]);
  cartItems$ = this.cartItemSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadCartFromStorage();
    console.log('Loaded cart from storage: ', this.cartItems);

    this.cartItemSubject.next(this.cartItems)
  }

  public addLocalItem(item: any) {
    const existing = this.cartItems.find(i => i.id === item.id);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      this.cartItems.push(item);
    }
    this.saveCartToStorage();
    this.cartItemSubject.next(this.cartItems);
  }
  getCartItems(): any[] {
    return this.cartItems;
  }
  removeFromCart(item: any, quantity: number = 1) {
    const existingItem = this.cartItems.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      existingItem.quantity -= quantity;
      if (existingItem.quantity <= 0) {
        this.cartItems = this.cartItems.filter(cartItem => cartItem.id !== item.id);
      }
      this.saveCartToStorage();
      console.log('🧹 removing item...', item);
      console.log('🧺 updated cartItems:', this.cartItems);

      this.cartItemSubject.next(this.cartItems)
    }
  }

  removeItem(index: number) {
    if (index >= 0 && index < this.cartItems.length) {
      this.cartItems.splice(index, 1);

      this.saveCartToStorage();
      this.cartItemSubject.next(this.cartItems)
    }
  }


  clearCartItems() {
    this.cartItems = [];
    this.saveCartToStorage();
  }

  // Save cart data to localStorage
  public saveCartToStorage() {
    localStorage.setItem('cartItems', JSON.stringify(this.cartItems));
    console.log('saved to localstorage: ', this.cartItems);

    this.cartItemSubject.next(this.cartItems);
  }

  broadcastCart() {
    this.cartItemSubject.next(this.cartItems);
  }

  public setCartItems(items: any[]) {
    this.cartItems = items;
    this.saveCartToStorage();
    this.cartItemSubject.next(this.cartItems);
  }
  
  // Load cart data from localStorage
  private loadCartFromStorage() {
    const storedCart = localStorage.getItem('cartItems');
    if (storedCart) {
      this.cartItems = JSON.parse(storedCart);
      this.cartItemSubject.next(this.cartItems);
    }
  }
  getCartItemCount(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }
  getCurrentCartItems(): any[] {
    return this.cartItems;
  }
  getUserCart() {
    return this.http.get(environment.api_url + '/cart')
  }
  findOneCart(id: number) {
    let params = new HttpParams().set('id', id)
    return this.http.get<{ status: string, data: Cart }>(environment.api_url + '/cart/find-one', { params })
  }
}