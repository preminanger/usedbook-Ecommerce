import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { LoginResponse } from '../pages/login/auth.model';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isLoggedIn: boolean = false;

  constructor(private http: HttpClient) { }

  login(credentials: { username: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(environment.api_url + '/auth/login', credentials).pipe(
      tap(response => {
        console.log('Login response:', response); 
        if (response.token) { // สมมุติว่าคุณมี token ในการตอบกลับ
          this.isLoggedIn = true; // เปลี่ยนสถานะการล็อกอิน
          localStorage.setItem('token', response.access_token); // บันทึก token ใน localStorage
          localStorage.setItem('user', JSON.stringify(response.data));
        }
      })
    );
  }
  getCurrentUser(): any {
    const token = localStorage.getItem('access_token');
    if (!token) return null;
  
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (e) {
      return null;
    }
  }
  
  
  isUserAdmin(): boolean {
    const user = this.getCurrentUser();
    return !!user?.isAdmin;
  }
  

  signUp(userData: any): Observable<any> {
    return this.http.post<any>(environment.api_url + '/user/sign-up', userData);
  }
  initializeCart(userId: number) {
    return this.http.post<any>(environment.api_url + '/cart/initialize', { userId })
  }

  verify(token: string) {
    let params = new HttpParams().set('token', token)
    return this.http.get<any>(environment.api_url + '/auth/verify', { params })
  }

  logout() {
    this.isLoggedIn = false; // เปลี่ยนสถานะการล็อกอิน
    localStorage.removeItem('token'); // ลบ token ออกจาก localStorage
  }

}
