import { Component, OnInit, NgZone } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { ViewChild, ElementRef } from '@angular/core';

interface Product {
  _id: string; name: string; price: number; originalPrice: number;
  images: string[]; image?: string; description: string; fullDescription: string;
  category: string; brand: string; rating: number; reviews: number;
  features: string[]; specs: { [key: string]: string }; inStock: boolean;
}
interface CartItem extends Product { quantity: number; }
interface User { id: string; name: string; email: string; }
interface Order {
  id: string; date: string; items: CartItem[];
  total: number; status: 'Delivered' | 'Processing' | 'Shipped';
}

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {
@ViewChild('emailInput') emailInput!: ElementRef;
@ViewChild('passInput') passInput!: ElementRef;
  // ── Views ────────────────────────────────────────────────
  currentView: 'list' | 'detail' | 'login' | 'admin' | 'orders' = 'list';

  // ── Products ─────────────────────────────────────────────
  products: Product[]   = [];
  isLoading             = true;
  errorMessage          = '';

  // ── Search & Filter ───────────────────────────────────────
  searchQuery      = '';
  selectedCategory = 'All';
  selectedSort     = 'default';
  priceMax         = 200000;

  get categories(): string[] {
    const cats = [...new Set(this.products.map(p => p.category))];
    return ['All', ...cats];
  }

  get filteredProducts(): Product[] {
    let list = [...this.products];
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }
    if (this.selectedCategory !== 'All') list = list.filter(p => p.category === this.selectedCategory);
    list = list.filter(p => p.price <= this.priceMax);
    switch (this.selectedSort) {
      case 'price-low':  list.sort((a, b) => a.price - b.price); break;
      case 'price-high': list.sort((a, b) => b.price - a.price); break;
      case 'rating':     list.sort((a, b) => b.rating - a.rating); break;
      case 'discount':   list.sort((a, b) => this.getDiscount(b) - this.getDiscount(a)); break;
    }
    return list;
  }

  clearFilters(): void {
    this.searchQuery = ''; this.selectedCategory = 'All';
    this.selectedSort = 'default'; this.priceMax = 200000;
  }

  // ── Detail ───────────────────────────────────────────────
  selectedProduct: Product | null = null;
  relatedProducts: Product[]      = [];
  activeImage                     = 0;
  detailQuantity                  = 1;

  // ── Cart ─────────────────────────────────────────────────
  cartItems: CartItem[] = [];
  isCartOpen            = false;

  // ── Auth ─────────────────────────────────────────────────
  currentUser: User | null      = null;
  activeTab: 'login' | 'signup' = 'login';
  loginEmail    = ''; loginPassword  = ''; loginError  = ''; loginLoading  = false;
  signupName    = ''; signupEmail    = ''; signupPassword = ''; signupError = ''; signupLoading = false;
  showLoginPass = false; showSignupPass = false;

  // ── Orders ───────────────────────────────────────────────
  orders: Order[] = [];

  // ── Admin ────────────────────────────────────────────────
  adminForm = {
    name: '', price: 0, originalPrice: 0, image: '', description: '',
    fullDescription: '', category: '', brand: '', rating: 4.5,
    reviews: 0, inStock: true, features: '', specs: ''
  };
  adminLoading  = false; adminError  = ''; adminSuccess  = '';
  adminProducts: Product[] = []; adminLoading2 = false;

  // ── Toast ─────────────────────────────────────────────────
  toastMessage = ''; toastIcon = '✅'; showToast = false;
  private toastTimer: any;

  // ── NgZone added to fix change detection ─────────────────
  constructor(private http: HttpClient, private zone: NgZone, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadUser();
    this.loadCartFromStorage();
    this.loadOrders();
    this.fetchProducts();
    const w = localStorage.getItem('welcomeMsg');
    if (w) { localStorage.removeItem('welcomeMsg'); setTimeout(() => this.showToastMsg(w, '👋'), 400); }
  }

  // ── User ─────────────────────────────────────────────────
  loadUser(): void {
    try { const s = localStorage.getItem('user'); if (s) this.currentUser = JSON.parse(s); } catch {}
  }

  // ── Cart ─────────────────────────────────────────────────
  loadCartFromStorage(): void {
    try { const s = localStorage.getItem('cart'); this.cartItems = s ? JSON.parse(s) : []; } catch { this.cartItems = []; }
  }
  saveCartToStorage(): void { localStorage.setItem('cart', JSON.stringify(this.cartItems)); }

  // ── Orders ───────────────────────────────────────────────
  loadOrders(): void {
    try { const s = localStorage.getItem('orders'); this.orders = s ? JSON.parse(s) : []; } catch { this.orders = []; }
  }
  saveOrder(): void {
    const order: Order = {
      id: 'ORD' + Date.now(),
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      items: [...this.cartItems], total: this.cartTotal, status: 'Processing'
    };
    this.orders = [order, ...this.orders];
    localStorage.setItem('orders', JSON.stringify(this.orders));
  }

  // ── Products — NgZone.run fixes Issue #2 (products not showing) ──
  fetchProducts(): void {
    this.isLoading = true;
    this.http.get<Product[]>('http://localhost:5000/api/products').subscribe({
      next: (data) => {
        this.zone.run(() => {
          this.products  = [...data];
          this.isLoading = false;
          this.cdr.detectChanges(); // 🔥 ADD THIS
        });
      },
      error: () => {
        this.zone.run(() => {
          this.errorMessage = 'Could not load products.';
          this.isLoading    = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  // ── Navigate ─────────────────────────────────────────────
  showDetail(p: Product): void {
    this.selectedProduct = p; this.activeImage = 0; this.detailQuantity = 1;
    this.currentView = 'detail';
    this.relatedProducts = this.products.filter(x => x.category === p.category && x._id !== p._id).slice(0, 4);
    window.scrollTo(0, 0);
  }
  goHome(): void    { this.currentView = 'list';  window.scrollTo(0, 0); }
  goToLogin(): void { this.loginError = ''; this.signupError = ''; this.currentView = 'login'; window.scrollTo(0, 0); }
  goToDetail(p: Product): void { this.showDetail(p); }
  goToOrders(): void { if (!this.currentUser) { this.goToLogin(); return; } this.currentView = 'orders'; window.scrollTo(0, 0); }
  goToAdmin(): void { this.currentView = 'admin'; this.adminError = ''; this.adminSuccess = ''; this.fetchAdminProducts(); window.scrollTo(0, 0); }

  // ── Detail Helpers ────────────────────────────────────────
  get discount(): number {
    if (!this.selectedProduct?.originalPrice) return 0;
    return Math.round((1 - this.selectedProduct.price / this.selectedProduct.originalPrice) * 100);
  }
  getStars(rating: number): boolean[] { return Array(5).fill(0).map((_, i) => i < Math.floor(rating)); }
  addToCartFromDetail(): void {
    if (!this.selectedProduct) return;
    this.addToCartItem(this.selectedProduct, this.detailQuantity);
    this.showToastMsg(`"${this.selectedProduct.name}" added to cart!`, '🛒');
  }
  buyNow(): void {
    if (!this.currentUser) { this.goToLogin(); return; }
    this.addToCartFromDetail();
    this.showToastMsg('Added! Going back to store...', '✅');
    setTimeout(() => this.goHome(), 1500);
  }

  // ── Cart Helpers ──────────────────────────────────────────
  getFirstImage(p: Product): string { return p.images?.length > 0 ? p.images[0] : (p.image || 'https://via.placeholder.com/400'); }
  getDiscount(p: Product): number {
    if (!p.originalPrice || p.originalPrice <= p.price) return 0;
    return Math.round((1 - p.price / p.originalPrice) * 100);
  }
  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
  }
  addToCartClick(event: Event, p: Product): void { event.stopPropagation(); this.addToCartItem(p, 1); this.showToastMsg(`"${p.name}" added to cart!`, '🛒'); }
  addToCartItem(p: Product, qty: number): void {
    const ex = this.cartItems.find(i => i._id === p._id);
    if (ex) { ex.quantity += qty; this.cartItems = [...this.cartItems]; }
    else this.cartItems = [...this.cartItems, { ...p, quantity: qty }];
    this.saveCartToStorage();
  }
  removeFromCart(id: string): void { this.cartItems = this.cartItems.filter(i => i._id !== id); this.saveCartToStorage(); }
  changeQty(item: CartItem, delta: number): void {
    item.quantity += delta;
    if (item.quantity <= 0) this.removeFromCart(item._id);
    else { this.cartItems = [...this.cartItems]; this.saveCartToStorage(); }
  }
  get cartCount(): number { return this.cartItems.reduce((s, i) => s + i.quantity, 0); }
  get cartTotal(): number { return this.cartItems.reduce((s, i) => s + i.price * i.quantity, 0); }
  openCart(): void  { this.isCartOpen = true; }
  closeCart(): void { this.isCartOpen = false; }
  clearCart(): void { this.cartItems = []; this.saveCartToStorage(); this.showToastMsg('Cart cleared.', '🗑️'); }
  placeOrder(): void {
    if (!this.currentUser) { this.goToLogin(); return; }
    this.saveOrder();
    this.showToastMsg('Order placed! Thank you 🎉', '✅');
    this.cartItems = []; this.saveCartToStorage(); this.isCartOpen = false;
  }
  logout(): void {
    
    localStorage.removeItem('token'); localStorage.removeItem('user');
    this.currentUser = null;
    // ✅ CLEAR LOGIN FORM
  this.loginEmail = '';
  this.loginPassword = '';
if (this.emailInput) this.emailInput.nativeElement.value = '';
if (this.passInput) this.passInput.nativeElement.value = '';
  // ✅ CLEAR SIGNUP FORM
  this.signupName = '';
  this.signupEmail = '';
  this.signupPassword = '';

  // ✅ FORCE UI UPDATE
  this.cdr.detectChanges();

  // ✅ OPTIONAL (best UX)
  this.currentView = 'login';
  
     this.showToastMsg('Logged out successfully.', '👋');
  }

  // ── Auth — NgZone.run fixes Issue #1 (spinner stuck) ─────
  switchTab(tab: 'login' | 'signup'): void { this.activeTab = tab; this.loginError = ''; this.signupError = ''; }

  onLogin(): void {
    this.loginError = '';
    if (!this.loginEmail || !this.loginPassword) { this.loginError = 'Please fill in all fields.'; return; }
    this.loginLoading = true;
    this.http.post<any>('http://localhost:5000/api/auth/login', {
      email: this.loginEmail, password: this.loginPassword
    }).subscribe({
      next: (data) => {
this.zone.run(() => {
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  this.currentUser = data.user;
  this.signupName = '';
this.signupEmail = '';
this.signupPassword = '';
this.cdr.detectChanges(); // 🔥 IMPORTANT

  this.loginLoading = false;

  setTimeout(() => {
    this.currentView = 'list';
    window.scrollTo(0, 0);
    this.cdr.detectChanges(); // 🔥 IMPORTANT
  }, 0);

  this.showToastMsg(`✅ Welcome back, ${data.user.name.split(' ')[0]}!`, '👋');
});
      },
      error: (err) => {
        this.zone.run(() => {
          this.loginError   = err.error?.message || 'Login failed. Please try again.';
          this.loginLoading = false;
        });
      }
    });
  }

  onSignup(): void {
    this.signupError = '';
    if (!this.signupName || !this.signupEmail || !this.signupPassword) { this.signupError = 'Please fill in all fields.'; return; }
    if (this.signupPassword.length < 6) { this.signupError = 'Password must be at least 6 characters.'; return; }
    this.signupLoading = true;
    this.http.post<any>('http://localhost:5000/api/auth/signup', {
      name: this.signupName, email: this.signupEmail, password: this.signupPassword
    }).subscribe({
      next: (data) => {
this.zone.run(() => {
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  this.currentUser = data.user;
  this.signupName = '';
this.signupEmail = '';
this.signupPassword = '';

  this.signupLoading = false;

  setTimeout(() => {
    this.currentView = 'list';
    window.scrollTo(0, 0);
    this.cdr.detectChanges(); // 🔥 IMPORTANT
  }, 0);

  this.showToastMsg(`🎉 Account created! Welcome, ${data.user.name.split(' ')[0]}!`, '🎉');
});
      },
      error: (err) => {
        this.zone.run(() => {
          this.signupError   = err.error?.message || 'Signup failed. Please try again.';
          this.signupLoading = false;
        });
      }
    });
  }

  // ── Admin ─────────────────────────────────────────────────
  fetchAdminProducts(): void {
    this.adminLoading2 = true;
    this.http.get<Product[]>('http://localhost:5000/api/products').subscribe({
      next: (data) => {
        this.zone.run(() => {
          this.adminProducts = [...data];
          this.adminLoading2 = false;
        });
      },
      error: () => { this.zone.run(() => { this.adminLoading2 = false; }); }
    });
  }

  async addProduct(): Promise<void> {
    this.adminError = ''; this.adminSuccess = '';
    const f = this.adminForm;
    if (!f.name || !f.price || !f.image || !f.category || !f.brand) {
      this.adminError = 'Please fill Name, Price, Image URL, Category and Brand.'; return;
    }
    this.adminLoading = true;
    const featuresArr = f.features.split('\n').map(s => s.trim()).filter(Boolean);
    let specsObj: any = {};
    try { f.specs.split('\n').forEach(line => { const [k, ...v] = line.split(':'); if (k && v.length) specsObj[k.trim()] = v.join(':').trim(); }); } catch {}
    const body = {
      name: f.name, price: +f.price, originalPrice: +f.originalPrice || +f.price,
      images: [f.image], description: f.description, fullDescription: f.fullDescription || f.description,
      category: f.category, brand: f.brand, rating: +f.rating, reviews: +f.reviews,
      features: featuresArr, specs: specsObj, inStock: f.inStock
    };
    try {
      const res  = await fetch('http://localhost:5000/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { this.adminError = data.message || 'Failed to add product.'; this.adminLoading = false; return; }
      this.adminSuccess = `"${data.name}" added successfully!`;
      this.adminLoading = false;
      this.adminForm = { name: '', price: 0, originalPrice: 0, image: '', description: '', fullDescription: '', category: '', brand: '', rating: 4.5, reviews: 0, inStock: true, features: '', specs: '' };
      this.fetchAdminProducts(); this.fetchProducts();
    } catch { this.adminError = 'Could not connect to server.'; this.adminLoading = false; }
  }

  async deleteProduct(id: string, name: string): Promise<void> {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) { this.showToastMsg(`"${name}" deleted.`, '🗑️'); this.fetchAdminProducts(); this.fetchProducts(); }
    } catch { this.showToastMsg('Could not delete product.', '❌'); }
  }

  // ── Toast ─────────────────────────────────────────────────
  showToastMsg(msg: string, icon = '✅'): void {
    clearTimeout(this.toastTimer);
    this.toastMessage = msg; this.toastIcon = icon; this.showToast = true;
    this.toastTimer = setTimeout(() => this.zone.run(() => this.showToast = false), 3500);
  }
}