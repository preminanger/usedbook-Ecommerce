import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { User, UserService } from '../../services/user.service';
import { CartItem } from '../../services/cart-item.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink,CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit{
  cartItems: CartItem[] = [];
  isLoggedIn: boolean = false;
  imageUrl: string | null = null
  isAdmin: boolean = false;
  
  constructor(private authService: AuthService  ,private _user:UserService, private _cart: CartService){}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser(); // ✅ ใช้ method นี้จาก AuthService
  
    this.isLoggedIn = !!currentUser;
    this.isAdmin = !!currentUser?.isAdmin;
    console.log('🛡️ NavbarComponent > isAdmin:', this.isAdmin);
  
    if (currentUser?.profileUrl){
      this.imageUrl = 'http://localhost:3000/' + currentUser.profileUrl;
    }
  
  
    // ถ้าใช้ profileImages$ เพื่อ update แบบ reactive
    this._user.profileImages$.subscribe(url => {
      if (url){
        this.imageUrl = 'http://localhost:3000/' + url;
      }
    });
  }

  logout() {
    this.authService.logout(); 
    this.isLoggedIn = false; 
    this.imageUrl = null
    localStorage.removeItem('token')
  }

  getTotalQuantity(){
    return this.cartItems.reduce((total, item) => total + item.quantity,0)
  }

}
