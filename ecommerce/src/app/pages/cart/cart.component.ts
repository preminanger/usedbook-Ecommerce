import { CartItem, CartItemService } from './../../services/cart-item.service';
import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../layout/navbar/navbar.component';
import { Pokemon, PokemonService } from '../../services/pokemon.service';
import { Cart, CartService } from '../../services/cart.service';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Address, User, UserService } from '../../services/user.service';
import { Order, OrderService } from '../../services/order.service';
import { forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from "../../layout/footer/footer.component";


export enum AddressType {
  HOME = 'Home',
  WORK = 'Work',
  OTHER = 'Other'
}
export enum shippingMethod{
  STANDARD = 'standard',
  EXPRESS = 'express',
  SAME_DAY = 'same_day'
}
@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [NavbarComponent, CommonModule, RouterLink, FormsModule, FooterComponent],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  userAddresses: any[] = [];
  
  selectedAddressId: number | null = null;
  pokemonList: Array<Pokemon> = [];
  selectedFile: File | null = null;
  imageUrl: string | ArrayBuffer | null = null;
  pokemonObject = {
    name: '', des: '', price: '', imageFile: null as File | null, imageUrl: ''
  }
  OrderList: Array<Order> = [];
  cartItems: CartItem[] = [];
  cartId: number = 0
  isLoading: boolean = false;
  selectedShippingMethod: shippingMethod = shippingMethod.STANDARD;


  constructor(
    private _pokemon: PokemonService,
    private _cart: CartService,
    private _user: UserService,
    private _cartItem: CartItemService,
    private _order: OrderService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this._cart.cartItems$.subscribe(items => {
      this.cartItems = items;
    });
    setTimeout(() => {
      this.cartId = this._user.currentUser?.cart?.id
      this.getCartWithCartItem()
      this.getAllPokemon();
      this.getUserCart();

      this.loadUserAddresses();
    }, 500);
  }
  formatAddress(address: Address): string {
    const {
      houseNumber,
      building,
      street,
      subDistrict,
      district,
      province,
      postalCode,
      country
    } = address;

    const parts = [
      houseNumber,
      building,
      street,
      `Sub-district: ${subDistrict}`,
      `District: ${district}`,
      province,
      postalCode,
      country
    ];

    return parts.filter(Boolean).join(', ');
  }

  loadUserAddresses() {
    const userId = this._user.currentUser?.id;
    if (!userId) return;

    this._user.getUserAddresses(userId).subscribe(addresses => {
      this.userAddresses = addresses.filter(addr => addr.isActive !== false);
      if (addresses.length > 0) {
        this.selectedAddressId = addresses[0].id;
      }
    });
  }
  getEstimatedArrival(method: string): string {
    const today = new Date();
    const arrivalDate = new Date(today);
  
    switch (method) {
      case 'standard':
        arrivalDate.setDate(today.getDate() + 3);
        return this.formatDate(arrivalDate); // → "Apr 10, 2025"
      case 'express':
        arrivalDate.setDate(today.getDate() + 1);
        return this.formatDate(arrivalDate);
      case 'same_day':
        return 'Today';
      default:
        return '-';
    }
  }
  
  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  hasAddress(): boolean {
    return this.userAddresses && this.userAddresses.length > 0;
  }
  getAllPokemon() {
    return this._pokemon.GetAllPokemon().subscribe(res => {
      console.log(res);
      this.pokemonList = res;
    });
  }
  getCartWithCartItem() {
    console.log(this.cartId)
    this._cart.findOneCart(this.cartId).subscribe(res => {
      console.log('find one cart res :-> ', res)
      if (res.status == 'success') {
        this.cartItems = res.data.cartItems
      }
      this.cartItems.forEach((item, index) => {
        console.log(`🖼️ Cart Item #${index + 1}:`, item.pokemon.imageUrls);
        console.log('💡 typeof imageUrls:', typeof item.pokemon.imageUrls);
        console.log('🧾 imageUrls:', item.pokemon.imageUrls);
      });
      this.cartItems.forEach(item => {
        if (typeof item.pokemon.imageUrls === 'string') {
          try {
            item.pokemon.imageUrls = JSON.parse(item.pokemon.imageUrls);
          } catch (e) {
            console.error('❌ Failed to parse imageUrls:', item.pokemon.imageUrls);
            item.pokemon.imageUrls = [];
          }
        }
      });
    })
  }
  handleCheckout() {
    this.isLoading = true;
    const user_id = this._user.currentUser.id;
    const cart_id = this._user.currentUser.cart.id;
    if (!this.selectedAddressId) {
      alert('⚠️ กรุณาเลือกที่อยู่จัดส่งก่อนทำการสั่งซื้อ');
      this.isLoading = false;
      return;
    }

    const body = {
      user: { id: user_id },
      cart: { id: cart_id },
      address: { id: this.selectedAddressId },
      shippingMethod: this.selectedShippingMethod,
      shippingFee: this.getShippingFee()
    };

    this._order.postOrder(body).subscribe({
      next: (res) => {
        console.log('📦 Order success:', res);
        this._cart.findOneCart(cart_id).subscribe(cartRes => {
          const itemsToDelete = cartRes.data.cartItems.map(item =>
            this._cartItem.deleteQuantity(item.id)
          );

          if (itemsToDelete.length === 0) {
            this.finishCheckout();
          } else {
            forkJoin(itemsToDelete).subscribe(() => {
              this.finishCheckout();
            });
          }
        });
      },
      error: (err) => {
        console.error('❌ Checkout failed:', err);
        this.isLoading = false;
      }
    });
  }

  private finishCheckout() {
    this._cart.clearCartItems();
    this._cart.broadcastCart();
    this.cartItems = [];

    setTimeout(() => {
      this.isLoading = false;
      (document.getElementById('checkout_modal') as HTMLDialogElement)?.close();
      this.router.navigate(['/order-history']);
    }, 1000);
  }
  openModal() {
    const modal = document.getElementById('checkout_modal') as HTMLDialogElement;
    if (modal) {
      modal.showModal();
    }
  }

  changeQuantity(status: string, item: CartItem) {
    console.log(status, item)
    if (status == 'increase') {
      item.quantity += 1
    } else {
      if (item.quantity > 1) item.quantity -= 1
    }
    if (item.quantity == 0) {
      this._cartItem.deleteQuantity(item.id).subscribe(res => {
        console.log('delete success', res)
        this.cartItems = this.cartItems.filter(cartItem => cartItem.id !== item.id);
      })
    }
    this._cartItem.updateQuantity(item).subscribe(res => {
      console.log('item update:', item)
    })
  }
  hasOverQuantityItems(): boolean {
    return this.cartItems.some(item => item.quantity > item.pokemon.quantity);
  }

  getCartItems() {
    return this.cartItems;
  }
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }
  getUserCart() {
    const user_id = this._user.currentUser?.id
    console.log('Your User ID:', user_id)
  }

  updateQuantity(body: CartItem) {
    this._cartItem.updateQuantity(body).subscribe(res => {
      console.log('item update:', res)

    })
  }

  deleteQuantity(id: number) {
    this._cartItem.deleteQuantity(id).subscribe(res => {
      console.log('delete success', res)
      this.cartItems = this.cartItems.filter(item => item.id !== id);
    })
  }
  getTotalPrice() {
    return this.cartItems.reduce((total, item) => total + item.quantity * item.pokemon.price, 0)
  }
  getTotalQuantity() {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  
  getShippingFee(): number {
    switch (this.selectedShippingMethod) {
      case 'express': return 50;
      case 'same_day': return 120;
      default: return 30;
    }
  }

}
