import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { CartComponent } from './pages/cart/cart.component';
import { NgModule } from '@angular/core';
import { authGuard } from './auth.guard';
import { ProfileComponent } from './pages/profile/profile.component';
import { OrderHistoryComponent } from './pages/order-history/order-history.component';
import { MyItemComponent } from './pages/my-item/my-item.component';
import { MySalesComponent } from './pages/my-sales/my-sales.component';
import { MyProductComponent } from './pages/my-product/my-product.component';
import { BankAccountComponent } from './pages/bank-account/bank-account.component';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';
import { AdminReportComponent } from './pages/admin-report/admin-report.component';


export const routes: Routes = [
    { path: '', redirectTo: '/log-in', pathMatch: 'full' },
    { path: 'home', component: HomeComponent, canActivate: [authGuard] },
    { path: 'log-in', component: LoginComponent },
    { path: 'sign-up', component: SignupComponent },
    { path: 'cart', component: CartComponent },
    { path: 'profile', component: ProfileComponent },
    { path: 'order-history', component: OrderHistoryComponent },
    { path: 'my-item', component: MyItemComponent },
    { path: 'my-sales', component: MySalesComponent },
    { path: 'my-product', component: MyProductComponent },
    { path: 'bank-account', component: BankAccountComponent },
    { path: 'privacy-policy', component: PrivacyPolicyComponent},
    { path: 'admin-report', component: AdminReportComponent},
    {
        path: 'inbox',
        loadComponent: () => import('./pages/chat-inbox/chat-inbox.component').then(m => m.ChatInboxComponent),
      },
    {
        path: 'chat/:id',
        loadComponent: () => import('./pages/chat-page/chat-page.component').then(m => m.ChatPageComponent),
    },

];
@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})

export class AppRoutingModule { }
