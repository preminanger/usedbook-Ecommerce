import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../services/user.service';
import { NavbarComponent } from "../../layout/navbar/navbar.component";
import { FooterComponent } from "../../layout/footer/footer.component";

@Component({
  standalone: true,
  selector: 'app-chat-page',
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './chat-page.component.html',
})
export class ChatPageComponent implements OnInit {
  messages: any[] = [];
  content: string = '';
  receiverId!: number;
  currentUserId!: number;
  chattingWith: any = null;
  selectedImageFile: File | null = null;
selectedImagePreview: string | ArrayBuffer | null = null;
selectedImage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    public _user: UserService,
    private location: Location
  ) { }

  ngOnInit(): void {
    const currentUser = this._user.getCurrentUser();
    if (!currentUser) {
      alert('กรุณาเข้าสู่ระบบก่อนใช้งานแชท');
      return;
    }
  
    this.currentUserId = currentUser.id;
  
    const idParam = this.route.snapshot.paramMap.get('id');
    this.receiverId = idParam ? +idParam : 0;
  
    if (this.currentUserId === this.receiverId) {
      alert('คุณไม่สามารถคุยกับตัวเองได้');
      return;
    }
  
    this.loadMessages();
    this.http.get(`http://localhost:3000/user/${this.receiverId}`).subscribe((user: any) => {
      this.chattingWith = user;
    });
  }
  
  goBack() {
    this.location.back();
  }

  loadMessages() {
    this.http
      .get<any[]>(`http://localhost:3000/message/conversation/${this.currentUserId}/${this.receiverId}`)
      .subscribe((res) => {
        this.messages = res;
        setTimeout(() => this.scrollToBottom(), 100);
      });

  }
  openImageModal(imageUrl: string) {
    this.selectedImage = imageUrl;
    const modal = document.getElementById('imageModal') as HTMLDialogElement;
    modal?.showModal();
  }
  
  closeImageModal(event: MouseEvent) {
    const modal = document.getElementById('imageModal') as HTMLDialogElement;
    if ((event.target as HTMLElement).id === 'imageModal') {
      modal?.close();
    }
  }
  sendMessage() {
    const hasText = this.content.trim().length > 0;
    const hasImage = !!this.selectedImageFile;
  
    // ❌ ไม่มีข้อความหรือรูป ไม่ทำอะไร
    if (!hasText && !hasImage) return;
  
    // ✅ ถ้ามีรูป → อัปโหลดภาพก่อน
    if (hasImage) {
      const formData = new FormData();
      formData.append('image', this.selectedImageFile!);
      formData.append('senderId', this.currentUserId.toString());
      formData.append('receiverId', this.receiverId.toString());
  
      this.http.post('http://localhost:3000/message/send-image', formData).subscribe(() => {
        // ล้างหลังส่ง
        this.selectedImageFile = null;
        this.selectedImagePreview = null;
        this.loadMessages();
      });
    }
  
    // ✅ ถ้ามีข้อความ → ส่งข้อความ
    if (hasText) {
      const payload = {
        senderId: this.currentUserId,
        receiverId: this.receiverId,
        content: this.content.trim(),
      };
  
      this.http.post('http://localhost:3000/message/send', payload).subscribe(() => {
        this.content = '';
        this.loadMessages();
      });
    }
  }
  

  scrollToBottom() {
    const container = document.getElementById('chat-container');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }
  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.selectedImageFile = file;
  
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedImagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }
  
  removeSelectedImage() {
    this.selectedImageFile = null;
    this.selectedImagePreview = null;
  }
  
}
