import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const token = localStorage.getItem('access_token');
  
  // สร้าง Router เพื่อใช้ในการนำทาง
  const router = new Router();

  if (token) {
    return true; // อนุญาตการเข้าถึง
  } else {
    // ถ้าไม่มี token ส่งผู้ใช้ไปที่หน้าเข้าสู่ระบบ
    router.navigate(['/log-in']);
    return false;
  }
};
