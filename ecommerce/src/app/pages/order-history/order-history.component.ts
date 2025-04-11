import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NavbarComponent } from '../../layout/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { Order, OrderService } from '../../services/order.service';
import { CartItem } from '../../services/cart-item.service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { UserService } from '../../services/user.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [NavbarComponent, CommonModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.scss'
})

export class OrderHistoryComponent implements OnInit {
  isSubmitting = false;
  cartItems: CartItem[] = [];
  orderList: Array<Order> = []
  orders: Order[] = []
  selectedOrder: Order | null = null
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  selectedOrderId: number | null = null;
  statusRank: Record<string, number> = {
    preparing: 1,
    shipped: 2,
    delivered: 3
  };
  reviewComment: string = '';
  reviewRating: number = 0;
  userReviews: any[] = [];
  @ViewChild('reportModal') reportModal!: ElementRef<HTMLDialogElement>;
reportReason: string = '';
reportedUserId: number | null = null;


  @ViewChild('paymentModal') paymentModal!: ElementRef<HTMLDialogElement>;
  constructor(
    private _user: UserService,
    private _order: OrderService,
    private router: Router
  ) { }
  ngOnInit(): void {
    setTimeout(() => {
      this.loadOrderHistory()
    }, 500);
    this.loadOrderHistory();
    this.loadUserReviews();

  }
  hasUserReviewed(pokemonId: number): boolean {
    return this.userReviews.some(r => r.pokemon?.id === pokemonId);
  }
  openReportModal(userId: number) {
    this.reportedUserId = userId;
    this.reportModal.nativeElement.showModal();
  }
  
  submitReport() {
    const reporterId = this._user.getCurrentUser()?.id;
    if (!reporterId || !this.reportedUserId || !this.reportReason.trim()) {
      alert('Please provide valid input.');
      return;
    }
  
    const data = {
      reporterId,
      reportedUserId: this.reportedUserId,
      reason: this.reportReason
    };
  
    this._user.sendReport(data).subscribe({
      next: () => {
        alert('✅ Report sent to admin');
        this.reportModal.nativeElement.close();
        this.reportReason = '';
        this.reportedUserId = null;
      },
      error: err => {
        console.error('❌ Failed to send report', err);
      }
    });
  }
  
  submitReview(pokemonId: number) {
    const userId = this._user.currentUser?.id;

    if (!userId || !this.reviewComment.trim() || !this.reviewRating) {
      alert('❌ Please write a comment and give a rating before submitting.');
      return;
    }

    const reviewData = {
      rating: this.reviewRating,
      comment: this.reviewComment,
      userId: userId,
      pokemonId: pokemonId,
    };


    this._user.postReview(reviewData).subscribe({
      next: (res) => {
        alert('✅ Review submitted!');
        this.reviewComment = '';
        this.reviewRating = 0;
        this.loadOrderHistory(); // โหลดใหม่เพื่อซ่อน textarea
      },
      error: (err) => {
        console.error('❌ Error submitting review:', err);
      }
    });
  }

  openPaymentModal(order: Order) {
    this.selectedOrder = order;
    const seller = order?.orderItems?.[0]?.pokemon?.user;
    if (!seller?.bank_name) {
      console.warn('❗ Seller has no bank info');
    }
    this.selectedOrderId = order.id;
    this.paymentModal.nativeElement.showModal();
  }
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }
  loadUserReviews() {
    const userId = this._user.currentUser?.id;
    if (!userId) return;

    this._user.getUserReviews(userId).subscribe((res) => {
      this.userReviews = res as any[];
    })
  }

  clearSelectedFile() {
    this.selectedFile = null;
    this.previewUrl = null;
  }
  isStatusAtLeast(current: string, step: string): boolean {
    return this.statusRank[current] >= this.statusRank[step];
  }
  submitPaymentProof() {
    if (!this.selectedOrderId || !this.selectedFile) return;

    const formData = new FormData();
    formData.append('proof', this.selectedFile);

    this._order.uploadPaymentSlip(this.selectedOrderId, formData).subscribe({
      next: () => {
        console.log(' Payment proof uploaded!');

        // ✅ ปิด modal ด้วย ViewChild
        this.paymentModal?.nativeElement?.close();

        // ✅ เคลียร์ฟอร์ม
        this.selectedFile = null;
        this.previewUrl = null;
        this.selectedOrderId = null;

        alert('📤 ส่งหลักฐานเรียบร้อยแล้ว!');
        this.loadOrderHistory?.();
      },
      error: err => {
        console.error('❌ Upload failed', err);
      }
    });
  }

  openOrderDetailModal(order: Order) {
    this.selectedOrder = order;
    (document.getElementById('order_detail_modal') as HTMLDialogElement).showModal();
  }
  getFirstImage(order: Order): string | null {
    const item = order.orderItems?.[0];

    if (!item || !item.pokemon || !Array.isArray((item.pokemon as any).imageUrlsParsed)) {
      console.warn(`⚠️ No image found for Order #${order.order_code}`);
      return null;
    }

    const image = (item.pokemon as any).imageUrlsParsed[0];
    if (image) {
      const path = 'http://localhost:3000' + image;
      return path;
    }

    return null;
  }

  cancelOrder(orderId: number) {
    // ตัวอย่าง: เรียก backend เพื่อยกเลิก
    this._order.cancelOrder(orderId).subscribe({
      next: () => {
        console.log('❌ Order cancelled');
        this.loadOrderHistory(); // รีโหลดรายการ
      },
      error: (err) => {
        console.error('❌ Failed to cancel order:', err);
      }
    });
  }

  notifyPayment(order: Order) {
    // ตัวอย่าง: เปิด modal แนบสลิป หรือแค่แจ้งเตือน
    console.log('📢 แจ้งชำระเงินสำหรับ order:', order);
    alert(`ระบบได้รับแจ้งการชำระเงินสำหรับคำสั่งซื้อ ${order.order_code}`);
  }
  getOrderTotal(order: Order): number {
    return (order.price ?? 0) + (order.shippingFee ?? 0);
  }
  getTotalPrice(order: Order | null): number {
    if (!order) return 0;
    return Number(order.price) + Number(order.shippingFee ?? 0);
  }
  handleChat(sellerId: number) {
    const currentUserId = this._user.getCurrentUser()?.id;
    if (currentUserId === sellerId) {
      alert('❌ คุณไม่สามารถคุยกับตัวเองได้');
      return; // ❗ หยุดที่นี่เลย ไม่ redirect
    }

    // ✅ ไปหน้าแชทถ้าไม่ใช่ตัวเอง
    this.router.navigate(['/chat', sellerId]);
  }
  getProgressWidth(status: string): string {
    switch (status) {
      case 'preparing': return '12%';
      case 'shipped': return '55%';
      case 'delivered': return '100%';
      default: return '0%';
    }
  }
  getProviderName(provider: string): string {
    switch (provider) {
      case 'flash': return 'Flash Express';
      case 'kerry': return 'Kerry Express';
      case 'thailand-post': return 'Thailand Post';
      default: return provider;
    }
  }
  onBackdropClick(event: MouseEvent): void {
    const dialog = document.getElementById('order_detail_modal') as HTMLDialogElement;
    if (event.target === dialog) {
      dialog.close();
    }
  }

  getTrackingUrl(provider: string, trackingNumber: string): string {
    switch (provider) {
      case 'flash': return `https://www.flashexpress.com/fle/tracking?se=${trackingNumber}`;
      case 'kerry': return `https://th.kerryexpress.com/en/track/?track=${trackingNumber}`;
      case 'thailand-post': return `https://track.thailandpost.co.th/?trackNumber=${trackingNumber}`;
      default: return '#';
    }
  }

  getEstimatedArrival(method?: string): string {
    const today = new Date();
    const arrivalDate = new Date(today);

    switch (method) {
      case 'standard':
        arrivalDate.setDate(today.getDate() + 3);
        return this.formatDate(arrivalDate);
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

  loadOrderHistory() {
    const user_id = this._user.currentUser?.id;
    if (!user_id) {
      console.error('User ID not found.');
      return;
    }

    this._order.getOrderHistory(user_id).subscribe(res => {
      console.log('Array of orders with this user ::->', res);
      console.log(' Full Orders:', res);
      this.orders = res;

      //  แปลง imageUrls ที่เป็น string → array แล้วเก็บใน imageUrlsParsed
      for (const order of this.orders) {
        if (order.shippingFee === undefined || order.shippingFee === null) {
          order.shippingFee = 0;
        }
        for (const item of order.orderItems || []) {
          const raw = item.pokemon?.imageUrls;

          if (typeof raw === 'string') {
            try {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) {
                (item.pokemon as any).imageUrlsParsed = parsed;
              } else {
                (item.pokemon as any).imageUrlsParsed = [];
              }
            } catch (e) {
              (item.pokemon as any).imageUrlsParsed = [];
            }
          } else if (Array.isArray(raw)) {
            (item.pokemon as any).imageUrlsParsed = raw;
          } else {
            (item.pokemon as any).imageUrlsParsed = [];
          }
        }
      }
    });
  }
}
