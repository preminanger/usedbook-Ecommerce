import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { HomeComponent } from '../home/home.component';
import { UserService } from '../../services/user.service';
import { FooterComponent } from "../../layout/footer/footer.component";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule, HomeComponent, FooterComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'] // แก้ไขจาก styleUrl เป็น styleUrls
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false; 
  loginError: string | null = null;
  showPassword = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private _user : UserService) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true; 
      const formData = this.loginForm.value;
  
      this.authService.login(formData).subscribe(res => {
        this.isLoading = false;
  
        if (res && res.data) {
          localStorage.setItem('access_token', res.access_token);
          this._user.setCurrentUser(res.data);
  
          this.loginForm.reset();
          window.scrollTo(0, 0);
  
          if (res.data.isAdmin) {
            this.router.navigate(['/admin-report']);
          } else {
            this.router.navigate(['/home']);
          }
  
          this.loginError = null;
          console.log('Login successful:', res);
        } else {
          this.loginError = 'username or password is incorrect';
        }
      });
    } else {
      console.log('Form is invalid');
    }
  }
  
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
