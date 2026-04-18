import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { BrowseComponent } from './pages/browse/browse.component';
import { SellComponent } from './pages/sell/sell.component';
import { BuyerDashboardComponent } from './pages/dashboard/buyer-dashboard/buyer-dashboard.component';
import { SellerDashboardComponent } from './pages/dashboard/seller-dashboard/seller-dashboard.component';
import { AdminDashboardComponent } from './pages/dashboard/admin-dashboard/admin-dashboard.component';
import { ContactComponent } from './pages/contact/contact.component';
import { AboutComponent } from './pages/about/about.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'browse', component: BrowseComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'about', component: AboutComponent },
  {
    path: 'sell',
    component: SellComponent,
    canActivate: [authGuard],
  },
  {
    path: 'dashboard/buyer',
    component: BuyerDashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: 'dashboard/seller',
    component: SellerDashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: 'dashboard/admin',
    component: AdminDashboardComponent,
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: '' },
];
