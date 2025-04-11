// report.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getReports(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/reports`);
  }

  blacklistUser(userId: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/user/blacklist/${userId}`, {});
  }

  deleteReport(reportId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/report/${reportId}`);
  }
}
