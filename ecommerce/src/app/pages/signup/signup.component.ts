import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FooterComponent } from "../../layout/footer/footer.component";

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule, FooterComponent],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  signUpForm!: FormGroup;
  isLoading = false; // แสดงสถานะ Loading
  errorMessage: string | null = null;
  successMessage: string | null = null;
  showPassword = false;
  showConfirmPassword = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.signUpForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone_number: ['', [Validators.required]],
      birth_date: ['', Validators.required],
      consent: [false, Validators.requiredTrue]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword') {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  onSubmitSignUp() {
    if (this.signUpForm.valid) {
      this.isLoading = true;
      this.errorMessage = null;
      this.successMessage = null;

      const formData = this.signUpForm.value;
      this.authService.signUp(formData).subscribe(
        res => {
          console.log('สมัครสมาชิกสำเร็จ', res);
          this.isLoading = false;
          this.successMessage = "สมัครสมาชิกสำเร็จ! กำลังพาไปหน้าเข้าสู่ระบบ...";
          
          // ตรวจสอบว่ามี userId หรือไม่
          if (res.userId) {
            this.authService.initializeCart(res.userId).subscribe(
              cartRes => console.log('ตะกร้าเริ่มต้นเรียบร้อยแล้ว', cartRes),
              cartError => console.error('เกิดข้อผิดพลาดในการเริ่มต้นตะกร้า:', cartError)
            );
          } else {
            console.error('ไม่พบ userId ในการตอบกลับ');
          }

          // รอ 2 วินาที แล้วเปลี่ยนหน้าไป Login
          setTimeout(() => {
            this.router.navigate(['/log-in']);
          }, 2000);
        },
        error => {
          this.isLoading = false;
          this.errorMessage = 'เกิดข้อผิดพลาดระหว่างการสมัครสมาชิก กรุณาลองอีกครั้ง';
          console.error('เกิดข้อผิดพลาดระหว่างการสมัครสมาชิก:', error);
        }
      );
    } else {
      console.log('แบบฟอร์มไม่ถูกต้อง');
      this.errorMessage = 'กรุณากรอกข้อมูลให้ครบถ้วน';
    }
  }
}
