import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

interface Product {
  _id: string; name: string; price: number; originalPrice: number;
  images: string[]; description: string; fullDescription: string;
  category: string; brand: string; rating: number; reviews: number;
  features: string[]; specs: { [key: string]: string }; inStock: boolean;
}

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {

  product: Product | null = null;
  relatedProducts: Product[] = [];
  isLoading = true;
  activeImage = 0;
  quantity = 1;
  toastMessage = ''; toastIcon = '✅'; showToast = false;
  private toastTimer: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.loadProduct(params['id']);
    });
  }

  loadProduct(id: string): void {
    this.zone.run(() => {
      this.isLoading   = true;
      this.activeImage = 0;
      this.quantity    = 1;
      this.product     = null;
    });
    window.scrollTo(0, 0);

    fetch(`http://localhost:5000/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        this.zone.run(() => {
          this.product   = data;
          this.isLoading = false;
        });
        this.loadRelated(data.category, data._id);
      })
      .catch(err => {
        console.error('Error:', err);
        this.zone.run(() => { this.isLoading = false; });
      });
  }

  loadRelated(category: string, currentId: string): void {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then((all: Product[]) => {
        this.zone.run(() => {
          this.relatedProducts = all
            .filter(p => p.category === category && p._id !== currentId)
            .slice(0, 4);
        });
      })
      .catch(() => {});
  }

  get discount(): number {
    if (!this.product?.originalPrice) return 0;
    return Math.round((1 - this.product.price / this.product.originalPrice) * 100);
  }

  getStars(rating: number): boolean[] {
    return Array(5).fill(0).map((_, i) => i < Math.floor(rating));
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', maximumFractionDigits: 0
    }).format(price);
  }

  addToCart(): void {
    if (!this.product) return;
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const ex = cart.find((i: any) => i._id === this.product!._id);
    if (ex) ex.quantity += this.quantity;
    else cart.push({ ...this.product, quantity: this.quantity });
    localStorage.setItem('cart', JSON.stringify(cart));
    this.showToastMsg(`"${this.product.name}" added to cart!`, '🛒');
  }

  buyNow(): void {
    if (!localStorage.getItem('user')) { this.router.navigate(['/login']); return; }
    this.addToCart();
    this.showToastMsg('Added! Going back to store...', '✅');
    setTimeout(() => this.router.navigate(['/']), 1500);
  }

  goBack(): void { this.router.navigate(['/']); }
  goToProduct(id: string): void { this.router.navigate(['/product', id]); }

  showToastMsg(msg: string, icon = '✅'): void {
    clearTimeout(this.toastTimer);
    this.toastMessage = msg; this.toastIcon = icon; this.showToast = true;
    this.toastTimer = setTimeout(() => this.zone.run(() => this.showToast = false), 3500);
  }
}