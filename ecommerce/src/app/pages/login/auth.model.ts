import { User } from "../../services/user.service";

// auth.model.ts
export interface LoginResponse {
    access_token: string; // หรือคุณสามารถเพิ่ม properties อื่น ๆ ที่ต้องการ
    token: string;
    data: User
  }
  