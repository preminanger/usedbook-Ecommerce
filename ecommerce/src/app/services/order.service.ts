import { environment } from './../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from './user.service';
import { CartItem } from './cart-item.service';
import { Pokemon } from './pokemon.service';
export interface ShippingAddress {
  houseNumber: string;
  building?: string;
  street: string;
  subDistrict: string;
  district: string;
  province: string;
  postalCode: string;
  country: string;
  addressType: string;
  additionalInfo?: string;
}

export interface Order {
  id: number;
  user: User;
  orderItems: OrderItem[]; 
  price: number;
  order_code: string;
  created_at: Date;
  status: string;
  tempStatus?: string;
  payment_proof:string;
  shippingAddress?: ShippingAddress;
  trackingNumber?: string;
  shippingProvider?: string;
  shippingMethod?: string;     
  shippingFee?: number;  
}
export interface OrderItem {
  pokemon: Pokemon;
  quantity: number;
  price: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private http: HttpClient) { }
  postOrder(body : {user : { id:number},cart: {id:number},address: {id:number}, shippingMethod: 'standard' | 'express' | 'same_day', shippingFee: number}){
    return this.http.post<Order>(environment.api_url + '/order/create-order',body)
  }
  getOrderHistory(id:number){
    return this.http.get<Order[]>(environment.api_url + '/order/order-history/' + id)
  }
  updateStatus(id: number, body: {
    status:string, trackingNumber?: string,shippingProvider?: string
  }) {
    return this.http.patch(environment.api_url + '/order/update-status/' + id,body)
  }
  getMySales(id: number){
    return this.http.get<Order[]>(environment.api_url + '/order/my-sales/' + id)
  }
  cancelOrder(id: number) {
    return this.http.patch(environment.api_url + '/order/cancel/' + id, {})
  }
  uploadPaymentSlip(id: number, formData: FormData) {
    return this.http.post(environment.api_url + '/order/' + id + '/upload-proof' , formData);
  }
}
