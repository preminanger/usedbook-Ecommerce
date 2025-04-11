import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Cart } from './cart.service';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export interface Address {
  id: number;
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
  isActive?: boolean;
}
interface ProfileUpdateResponse {
  status: string;
  data: User;
  token: string;
  notDeletedAddresses?: number[]; // ✅ สำคัญ!
}

export interface User {
  id: number;
  username :string;
  firstname : string;
  lastname : string;
  password : string;
  email :string;
  birth_date :Date;
  cart: Cart
  phone_number: number;
  profileUrl: string;
  bank_name?: string;
  account_name?: string;
  account_number?: string;
  qr_image_url?: string;
  addresses?: Address[];
  isAdmin: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private profileImageSubject = new BehaviorSubject<string | null>(null);
  profileImages$ = this.profileImageSubject.asObservable();
  currentUser! : User

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private http: HttpClient) { 
    if(isPlatformBrowser(this.platformId)){
      const savedUser =localStorage.getItem('currentUser');
      if (savedUser){
        this.currentUser = JSON.parse(savedUser);
        this.profileImageSubject.next(this.currentUser.profileUrl);
      }
    }
  }
  getUser(userId: number) {
    return this.http.get(`${environment.api_url}/user/${userId}`);
  }
  sendMessage(data: { senderId: number; receiverId: number; content: string }) {
  return this.http.post(environment.api_url + '/message/send', data);
}
  setCurrentUser(user:User){
    this.currentUser  = user;
    if(isPlatformBrowser(this.platformId)){
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
    this.profileImageSubject.next(user.profileUrl);
  }
  getUserAddresses(id: number) {
    return this.http.get<any[]>(environment.api_url + '/user/' + id + '/addresses');
  }
  sendReport(data: any) {
    return this.http.post(environment.api_url + '/reports/submit', data);
  }
  
  getCurrentUser(): User | null{
    return this.currentUser ? this.currentUser : null;
  }
  setProfileImage(imageUrl: string){
    if (this.currentUser){
      this.currentUser.profileUrl = imageUrl;
      this.setCurrentUser(this.currentUser);
    }
  }
  updateBankInfo(id: number,bankInfo:any){
    return this.http.patch(environment.api_url + '/user/' + id + '/bank-info',bankInfo)
  }
  getAllUser(){
    return this.http.get<Array<User>>(environment.api_url + '/user')
  }
  getOneUser(id:number){
    return this.http.get<User>(environment.api_url + '/user/' + id)
  }
  getUserProfile(id:number){
    return this.http.get<User>(environment.api_url + '/user/' + id)
  }
  updateUserProfile(id:number, userData: Partial<User>){
    return this.http.put(environment.api_url + '/user/' +id, userData)
  }
  getUserCart(id:number){
    return this.http.get(environment.api_url + '/cart/user/'+id)
  }
  postProfileImage(formData: FormData){
    return this.http.post<ProfileUpdateResponse>(environment.api_url + '/user/update-profile' , formData)
  }
  getInbox(userId: number) {
    return this.http.get(`${environment.api_url}/message/inbox/${userId}`);
  }
  getOrdersByUser(userId: number) {
    return this.http.get(`${environment.api_url}/order/user/${userId}`);
  }
  postReview(data: any) {
    return this.http.post(environment.api_url + '/review/create', data);
  }
  getUserReviews(userId: number) {
    return this.http.get(`${environment.api_url}/review/user/${userId}`);
  }
}
