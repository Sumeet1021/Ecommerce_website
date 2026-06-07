import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  description: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, HttpClientModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  products: Product[] = [];
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  // Form fields
  newProduct = {
    name: '',
    price: null as number | null,
    image: '',
    description: ''
  };

  imagePreview = '';
  isSubmitting = false;

  private apiUrl = 'http://localhost:5000/api/products';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.http.get<Product[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.products = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  onImageUrlChange(): void {
    this.imagePreview = this.newProduct.image;
  }

  addProduct(): void {
    const { name, price, image, description } = this.newProduct;

    if (!name || !price || !image || !description) {
      this.showError('Saare fields fill karo!');
      return;
    }

    this.isSubmitting = true;

    this.http.post<any>(this.apiUrl, { name, price, image, description }).subscribe({
      next: () => {
        this.showSuccess(`"${name}" successfully add ho gaya! ✅`);
        this.resetForm();
        this.loadProducts();
        this.isSubmitting = false;
      },
      error: (err) => {
        this.showError('Product add nahi hua. Backend check karo.');
        this.isSubmitting = false;
      }
    });
  }

  deleteProduct(id: string, name: string): void {
    if (!confirm(`"${name}" delete karna chahte ho?`)) return;

    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this.products = this.products.filter(p => p._id !== id);
        this.showSuccess(`"${name}" delete ho gaya!`);
      },
      error: () => {
        this.showError('Delete nahi hua. Try again.');
      }
    });
  }

  resetForm(): void {
    this.newProduct = { name: '', price: null, image: '', description: '' };
    this.imagePreview = '';
  }

  showSuccess(msg: string): void {
    this.successMessage = msg;
    this.errorMessage = '';
    setTimeout(() => this.successMessage = '', 3500);
  }

  showError(msg: string): void {
    this.errorMessage = msg;
    this.successMessage = '';
    setTimeout(() => this.errorMessage = '', 3500);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  }
}