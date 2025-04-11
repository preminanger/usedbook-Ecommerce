import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

export interface Message {
  id: number;
  content: string;
  sender: any;
  receiver: any;
  timestamp: Date;
  isRead: boolean;
}
@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor(private http: HttpClient) { }
  
  sendMessage(body: {
    content: string;
    senderId: number;
    receiverId: number;
  }): Observable<Message> {
    return this.http.post<Message>(environment.api_url + '/message/send', body);
  }

  getConversation(userId: number, otherUserId: number): Observable<Message[]> {
    return this.http.get<Message[]>(
      `${environment.api_url}/message/conversation/${userId}/${otherUserId}`
    );
  }
  getInbox(userId: number): Observable<any[]> {
    return this.http.get<any[]>(environment.api_url + `/message/inbox/${userId}`);
  }
  
}
