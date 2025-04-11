import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../layout/navbar/navbar.component';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Address, User, UserService } from '../../services/user.service';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, NavbarComponent, RouterLinkActive],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  selectedFile!: File
  imageUrl!: string
  expandedAddressIndex: number | null = 0;
  deletedAddressIds: number[] = [];
  showToast = false;
  isLoading = true;

  constructor(
    private _user: UserService,
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
    const userId = this._user.getCurrentUser()?.id;
    if (userId) {
      this._user.getUserProfile(userId).subscribe(user => {
        this.formInit(user); // ✅ ส่ง user ที่โหลดได้เข้าไปเลย
        this.isLoading = false;
      });
    }
  }
  clearAddresses() {
    const addressArray = this.profileForm.get('addresses') as FormArray;
    while (addressArray.length !== 0) {
      addressArray.removeAt(0);
    }
  }

  formInit(user: User) {
      console.log('📥 Received user:', user);
      console.log('👀 Username:', user.username); 
      
    this.profileForm = this.fb.group({
      id: [user.id],
      username: [user.username],
      firstname: [user.firstname],
      lastname: [user.lastname],
      email: [user.email],
      phone_number: [user.phone_number],
      birth_date: [user.birth_date?.toString().slice(0, 10)],
      addresses: this.fb.array([])
    });
  
    if (user.profileUrl) {
      this.imageUrl = `${environment.api_url}/${user.profileUrl}`;
    }
  
    const addressArray = this.profileForm.get('addresses') as FormArray;
  
    if (user.addresses && user.addresses.length > 0) {
      const activeOnly = user.addresses.filter(addr => addr.isActive != false); 
      activeOnly.forEach(addr => {
        addressArray.push(this.initAddressGroup(addr));
      });
    } else {
      addressArray.push(this.initAddressGroup());
    }
  }

  //Address toggle
  toggleExpand(index: number) {
    this.expandedAddressIndex = this.expandedAddressIndex === index ? null : index;
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('imageFile', file);
      this._user.postProfileImage(formData);
    }
    this.selectedFile = file;

    const reader = new FileReader();
    reader.readAsDataURL(file)
    reader.onload = (e: any) => {
      this.imageUrl = e.target.result
    };
  }
  initAddressGroup(data?: Address): FormGroup {
    return this.fb.group({
      id: [data?.id || null],
      houseNumber: [data?.houseNumber || ''],
      building: [data?.building || ''],
      street: [data?.street || ''],
      subDistrict: [data?.subDistrict || ''],
      district: [data?.district || ''],
      province: [data?.province || ''],
      postalCode: [data?.postalCode || ''],
      country: [data?.country || 'Thailand'],
      addressType: [data?.addressType || 'home'],
      additionalInfo: [data?.additionalInfo || '']
    });
  }
  addAddress() {
    const addressArray = this.profileForm.get('addresses') as FormArray;
    addressArray.push(this.initAddressGroup());
    this.expandedAddressIndex = addressArray.length - 1;
  }

  removeAddress(index: number) {
    const addressArray = this.profileForm.get('addresses') as FormArray;
    const addressId = addressArray.at(index).value.id;

    if (addressId) {
      this.deletedAddressIds.push(addressId);
    }
    addressArray.removeAt(index);
  }
  getAddressControls() {
    return (this.profileForm.get('addresses') as FormArray).controls;
  }
  updateUser() {
    let value = this.profileForm.value;
    const formData = new FormData();
  
    formData.append('form', JSON.stringify({ ...value, deletedAddressIds: this.deletedAddressIds }));
    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }
  
    this._user.postProfileImage(formData).subscribe(res => {
      console.log('User updated:', res);
      if (res.status === 'success') {
        const notDeletable = res.notDeletedAddresses || [];
        console.log('🔍 notDeletedAddresses จาก backend:', notDeletable); 
        if (notDeletable.length > 0) {
          const addressArray = this.profileForm.get('addresses') as FormArray;
          notDeletable.forEach(id => {
            const index = addressArray.controls.findIndex(ctrl => ctrl.value.id === id);
            if (index !== -1) {
              this.deletedAddressIds = this.deletedAddressIds.filter(x => x !== id);
              console.warn(` Address ID ${id} was not removed because it was used in an order.`);
            }
          });
        }
  
        localStorage.setItem('access_token', res.token);
        this._user.setCurrentUser(res.data);
  
        const filteredUser = {
          ...res.data,
          addresses: res.data.addresses?.filter((addr: any) => addr.isActive !== false)
        };
  
        this.clearAddresses();
        this.formInit(filteredUser);
        this.deletedAddressIds = [];
        this.showToast = true;
        setTimeout(() => this.showToast = false, 3000);
      }
    });
  }

}


