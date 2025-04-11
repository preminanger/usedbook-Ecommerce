import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../services/user.service';
import { NavbarComponent } from "../../layout/navbar/navbar.component";
import { FooterComponent } from "../../layout/footer/footer.component";

@Component({
  selector: 'app-chat-inbox',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './chat-inbox.component.html',
})
export class ChatInboxComponent implements OnInit {
  inboxList: any[] = [];
  currentUserId!: number;

  constructor(private http: HttpClient, private _user: UserService,private router: Router) {}

  ngOnInit(): void {
    const user = this._user.getCurrentUser();
    if (!user) {
      alert('กรุณาเข้าสู่ระบบ');
      return;
    }
    this.currentUserId = user.id;

    // ดึงรายการแชททั้งหมด
    this.http
      .get<any[]>(`http://localhost:3000/message/inbox/${this.currentUserId}`)
      .subscribe((res) => {
        this.inboxList = res;
      });
  }
  goToChat(userId: number) {
    this.router.navigate(['/chat', userId]);
  }
}
