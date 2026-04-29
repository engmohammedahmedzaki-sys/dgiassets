import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { BrowseComponent } from './pages/browse/browse.component';
import { SellComponent } from './pages/sell/sell.component';
import { DashboardComponent } from './pages/dashboard/main-dashboard/dashboard.component';
import { ContactComponent } from './pages/contact/contact.component';
import { AboutComponent } from './pages/about/about.component';
import { ProjectDetailComponent } from './pages/project-detail/project-detail.component';
import { authGuard } from './guards/auth.guard';
import { DealRoomComponent } from './pages/deal-room/deal-room.component';
import { PaymentCallbackComponent } from './pages/payment/payment-callback.component';
import { GoogleCallbackComponent } from './pages/auth/google-callback/google-callback.component';
import { SelectRoleComponent } from './pages/auth/select-role/select-role.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'browse', component: BrowseComponent },
  { path: 'projects/:id', component: ProjectDetailComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'about', component: AboutComponent },
  {
    path: 'sell',
    component: SellComponent,
    canActivate: [authGuard],
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: 'deals/:id',
    component: DealRoomComponent,
    canActivate: [authGuard],
  },
  {
    path: 'payment/callback',
    component: PaymentCallbackComponent,
    canActivate: [authGuard],
  },
  {
    path: 'auth/google-callback',
    component: GoogleCallbackComponent,
  },
  {
    path: 'auth/select-role',
    component: SelectRoleComponent,
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: '' },
];
