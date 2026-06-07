import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {
  activeTab: 'login' | 'signup' = 'login';

  loginEmail = '';
  loginPassword = '';
  loginError = '';
  loginLoading = false;
  showLoginPass = false;

  signupName = '';
  signupEmail = '';
  signupPassword = '';
  signupError = '';
  signupLoading = false;
  showSignupPass = false;

  private api = 'http://localhost:5000/api/auth';

  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

  switchTab(tab: 'login' | 'signup'): void {
    this.activeTab = tab;
    this.loginError = '';
    this.signupError = '';
  }

  async onLogin(): Promise<void> {
    this.loginError = '';

    if (!this.loginEmail || !this.loginPassword) {
      this.loginError = 'Please fill in all fields.';
      return;
    }

    this.loginLoading = true;

    try {
const res  = await fetch(`${this.api}/login`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: this.loginEmail, password: this.loginPassword })
});

// ✅ SAFE JSON PARSE (YAHI ADD KARNA HAI)
let data: any = {};
try {
  data = await res.json();
} catch (e) {
  console.error('JSON parse error:', e);
}

      if (!res.ok) {
        this.loginError = data.message || 'Login failed.';
        this.loginLoading = false;
        this.cdr.detectChanges(); // 🔥 FIX
        return;
      }

      // ✅ store data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('welcomeMsg', `Welcome back, ${data.user.name.split(' ')[0]}! 🎉`);

      this.loginLoading = false;

      // ✅ ADD THIS (success feedback)
      alert(`Welcome ${data.user.name.split(' ')[0]} 🎉 Login Successful`);

      // ✅ redirect
      this.router.navigate(['/']);

    } catch (err) {
      console.error(err);

      this.loginError = 'Could not connect to server.';
      this.loginLoading = false;
    }
  }

  async onSignup(): Promise<void> {
    this.signupError = '';

    if (!this.signupName || !this.signupEmail || !this.signupPassword) {
      this.signupError = 'Please fill in all fields.';
      return;
    }

    if (this.signupPassword.length < 6) {
      this.signupError = 'Password must be at least 6 characters.';
      return;
    }

    this.signupLoading = true;

    try {
     const res  = await fetch(`${this.api}/signup`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: this.signupName, email: this.signupEmail, password: this.signupPassword })
});

// ✅ SAFE JSON PARSE
let data: any = {};
try {
  data = await res.json();
} catch (e) {
  console.error('JSON parse error:', e);
}

      if (!res.ok) {
        this.signupError = data.message || 'Signup failed.';
        this.signupLoading = false;
        this.cdr.detectChanges();
        return;
      }

      // ✅ store data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('welcomeMsg', `Account created! Welcome, ${data.user.name.split(' ')[0]}! 🎉`);

      this.signupLoading = false;

      // ✅ ADD THIS (success feedback)
      alert(`Account created successfully 🎉 Welcome ${data.user.name.split(' ')[0]}`);

      // ✅ redirect
      this.router.navigate(['/']);

    } catch (err) {
      console.error(err);

      this.signupError = 'Could not connect to server.';
      this.signupLoading = false;
    }
  }

  goToStore(): void {
    this.router.navigate(['/']);
  }
}