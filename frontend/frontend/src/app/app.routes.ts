import { Routes } from '@angular/router';
import { ProductComponent } from './components/product/product';
import { AuthComponent } from './components/auth/auth';
import { ProductDetailComponent } from './components/product-detail/product-detail';

export const routes: Routes = [
  { path: '',             component: ProductComponent },
  { path: 'login',        component: AuthComponent },
  { path: 'product/:id',  component: ProductDetailComponent },
  { path: '**',           redirectTo: '' }
];