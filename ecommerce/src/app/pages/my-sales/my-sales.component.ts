import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Order, OrderService } from '../../services/order.service';
import { UserService } from '../../services/user.service';
import { RouterLink, RouterModule } from '@angular/router';
import { NavbarComponent } from "../../layout/navbar/navbar.component";
import { FormsModule } from '@angular/forms';
import { FooterComponent } from "../../layout/footer/footer.component";

@Component({
  selector: 'app-my-sales',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterModule, NavbarComponent, FormsModule, FooterComponent],
  templateUrl: './my-sales.component.html',
  styleUrl: './my-sales.component.scss'
})

export class MySalesComponent implements OnInit {
  orders: Order[] = []
  showToast = false;
  toastMessage = '';
  selectedStatus: string = '';
  sortOption = 'latest';
  filteredOrders: Order[] = [];
  page = 1;
  pageSize = 6;
  displayedOrders: Order[] = [];
  selectedOrderForShipping?: Order;
  showShippingModal = false;
  shippingUpdates: { [orderId: number]: { status: string, trackingNumber?: string, shippingProvider?: string } } = {};
  selectedShippingUpdate?: { trackingNumber?: string; shippingProvider?: string; status: string };

  constructor(private _order: OrderService, private _user: UserService) { }

  ngOnInit(): void {
    this.loadMySales();
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.showShippingModal = false;
      }
    });
  }
  sortOrders() {
    this.applyFiltersAndSort();
  }
  loadMoreOrders() {
    const startIndex = (this.page - 1) * this.pageSize;
    const endIndex = this.page * this.pageSize;

    const more = this.filteredOrders.slice(startIndex, endIndex);
    this.displayedOrders = [...this.displayedOrders, ...more];
    this.page++;
  }
  getProviderName(key: string): string {
    switch (key) {
      case 'flash': return 'Flash Express';
      case 'kerry': return 'Kerry Express';
      case 'thailand-post': return 'Thailand Post';
      default: return 'Other';
    }
  }

  getTrackingUrl(provider: string, trackingNumber: string): string {
    switch (provider) {
      case 'flash':
        return `https://www.flashexpress.com/fle/tracking?se=${trackingNumber}`;
      case 'kerry':
        return `https://th.kerryexpress.com/en/track/?track=${trackingNumber}`;
      case 'thailand-post':
        return `https://track.thailandpost.co.th/?trackNumber=${trackingNumber}`;
      default:
        return '#';
    }
  }
  closeOnOutsideClick(event: MouseEvent): void {
    this.showShippingModal = false;
  }
  openShippingModal(order: Order) {
    this.selectedOrderForShipping = order;
  
    if (!this.shippingUpdates[order.id]) {
      this.shippingUpdates[order.id] = {
        trackingNumber: order.trackingNumber || '',
        shippingProvider: order.shippingProvider || '',
        status: order.status || 'preparing'
      };
    }
  
    // เก็บไว้แยกต่างหากเพื่อใช้ใน ngModel
    this.selectedShippingUpdate = this.shippingUpdates[order.id];
  
    this.showShippingModal = true;
  }
  
  
  submitShippingModal() {
    if (!this.selectedOrderForShipping) return;
  
    const update = this.shippingUpdates[this.selectedOrderForShipping.id];
  
    this._order.updateStatus(this.selectedOrderForShipping.id, {
      status: update.status,
      trackingNumber: update.trackingNumber,
      shippingProvider: update.shippingProvider
    }).subscribe({
      next: () => {
        this.toastMessage = 'Shipping updated successfully!';
        this.showToast = true;
        setTimeout(() => this.showToast = false, 3000);
        this.showShippingModal = false;
        this.selectedOrderForShipping = undefined;
        this.loadMySales();
      },
      error: (err) => {
        console.error('❌ Failed to update shipping:', err);
        this.toastMessage = 'Update failed!';
        this.showToast = true;
        setTimeout(() => this.showToast = false, 3000);
      }
    });
  }
  getTotalWithShipping(order: Order): number {
    const productPrice = order.price ?? 0;
    const shipping = order.shippingFee ?? 0;
    return +(productPrice + shipping).toFixed(2);
  }
  updateShipping(order: Order) {
    const update = this.shippingUpdates[order.id];

    this._order.updateStatus(order.id, {
      status: update.status,
      trackingNumber: update.trackingNumber,
      shippingProvider: update.shippingProvider
    }).subscribe({
      next: () => {
        this.toastMessage = 'Shipping updated successfully!';
        this.showToast = true;
        setTimeout(() => this.showToast = false, 3000);
        this.loadMySales(); // reload ด้วยค่าที่ถูกต้อง
      },
      error: (err) => {
        console.error('❌ Failed to update shipping:', err);
        this.toastMessage = 'Update failed!';
        this.showToast = true;
        setTimeout(() => this.showToast = false, 3000);
      }
    });
  }


  loadMySales() {
    const userId = this._user.currentUser?.id;
    if (!userId) {
      console.warn(' No user ID found');
      return;
    }
  
    this._order.getMySales(userId).subscribe({
      next: (res) => {
        console.log('✅ My Sales Fetched:', res); // เพิ่มตรงนี้
        this.orders = res;
        res.forEach(order => {
          this.shippingUpdates[order.id] = {
            status: order.status,
            trackingNumber: order.trackingNumber || '',
            shippingProvider: order.shippingProvider || ''
          };
        });
        this.applyFiltersAndSort();
      },
      error: (err) => console.error('❌ Failed to load sales:', err)
    });
  }
  applyFiltersAndSort() {
    let temp = this.selectedStatus ? this.orders.filter(o => o.status === this.selectedStatus) : [...this.orders];

    switch (this.sortOption) {
      case 'latest':
        temp.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        temp.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'high_price':
        temp.sort((a, b) => parseFloat(String(b.price)) - parseFloat(String(a.price)));
        break;
      case 'low_price':
        temp.sort((a, b) => parseFloat(String(a.price)) - parseFloat(String(b.price)));
        break;
    }

    this.filteredOrders = temp;

    this.page = 1;
    this.displayedOrders = [];
    this.loadMoreOrders();
  }



  filterByStatus(status: string) {
    this.selectedStatus = status;
    this.applyFiltersAndSort();
  }
  rejectPayment(orderId: number) {
    if (!confirm('Are you sure you want to reject this payment?')) return;

    this._order.updateStatus(orderId, { status: 'cancelled' }).subscribe({
      next: () => {
        this.toastMessage = 'Order rejected successfully';
        this.showToast = true;
        setTimeout(() => this.showToast = false, 3000);

        this.loadMySales(); // โหลดใหม่
      },
      error: (err) => {
        console.error('❌ Failed to reject payment:', err);
      }
    });
  }

  markAsPaid(orderId: number) {
    this._order.updateStatus(orderId, { status: 'paid' }).subscribe({
      next: () => {
        console.log(' Order updated to paid');
        this.loadMySales();
      },
      error: (err) => console.error(' Failed to update status:', err)
    });
  }
}

