import { Component } from '@angular/core';
import { NavbarComponent } from "../../layout/navbar/navbar.component";
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-bank-account',
  standalone: true,
  imports: [NavbarComponent, CommonModule, RouterLinkActive, RouterLink, FormsModule],
  templateUrl: './bank-account.component.html',
  styleUrl: './bank-account.component.scss'
})
export class BankAccountComponent {
  bankInfo = {
    bank_name: '',
    account_name: '',
    account_number: '',
    qr_image_url: ''
  };
  showToast = false;

  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;

  constructor(public _user: UserService) {}
  ngOnInit(): void {
    const userId = this._user.currentUser?.id;
    if (!userId) return;

    this._user.getUser(userId).subscribe({
      next: (res: any) => {
        this.bankInfo.bank_name = res.bank_name;
        this.bankInfo.account_name = res.account_name;
        this.bankInfo.account_number = res.account_number;

        if (res.qr_image_url) {
          this.previewUrl = 'http://localhost:3000' + res.qr_image_url;
        }
      },
    });
  }
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  submitBankForm() {
    const formData = new FormData();
    formData.append('bank_name', this.bankInfo.bank_name);
    formData.append('account_name', this.bankInfo.account_name);
    formData.append('account_number', this.bankInfo.account_number);
    if (this.selectedFile) {
      formData.append('qr_image', this.selectedFile); // ⬅️ ชื่อฟิลด์ตรงกับ backend
    }
  
    const userId = this._user.currentUser?.id;
    if (!userId) return;
  
    this._user.updateBankInfo(userId, formData).subscribe({
      next: () => {
        this.showToast = true;
        setTimeout(() => this.showToast = false, 3000); // หายไปเองใน 3 วิ
      },
      error: err => console.error('❌ Update failed', err)
    });
  }
}
