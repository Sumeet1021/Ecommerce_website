import { Component } from '@angular/core';
import { ProductComponent } from './components/product/product';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ProductComponent],
  template: `<app-product></app-product>`
})
export class AppComponent {}