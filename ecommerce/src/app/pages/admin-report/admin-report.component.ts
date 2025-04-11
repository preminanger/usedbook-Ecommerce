// admin-report.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReportService } from '../../services/report.service';
import { UserService } from '../../services/user.service';
import { NavbarComponent } from "../../layout/navbar/navbar.component";

@Component({
  selector: 'app-admin-report',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './admin-report.component.html',
  styleUrls: ['./admin-report.component.scss']
})
export class AdminReportComponent implements OnInit {
  reports: any[] = [];
  
  constructor(private reportService: ReportService, private userService: UserService) {}

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports() {
    this.reportService.getReports().subscribe({
      next: (res) => {
        console.log('📦 Reports loaded:', res); // <- ดูตรงนี้
        this.reports = res;
      },
      error: (err) => {
        console.error('❌ Failed to load reports:', err);
      }
    });
  }

  blacklistUser(userId: number) {
    if (!confirm('Are you sure you want to blacklist this user?')) return;

    this.reportService.blacklistUser(userId).subscribe({
      next: () => {
        alert('✅ User has been blacklisted');
        this.loadReports();
      },
      error: (err) => {
        console.error('❌ Failed to blacklist user:', err);
      }
    });
  }
}
