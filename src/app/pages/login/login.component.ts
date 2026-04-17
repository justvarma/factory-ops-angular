import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { LucideAngularModule, LogIn, Lock, User, AlertCircle } from 'lucide-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './login.component.html',
  styles: []
})
export class LoginComponent {
  private http = inject(HttpClient);
  private router = inject(Router);

  email = '';
  password = '';
  error = '';
  loading = false;

  readonly LogIn = LogIn;
  readonly Lock = Lock;
  readonly User = User;
  readonly AlertCircle = AlertCircle;

  onSubmit() {
    this.loading = true;
    this.error = '';
    
    this.http.post('/api/auth/login', { email: this.email, password: this.password })
      .subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.error = err.error?.error || 'Invalid credentials';
          this.loading = false;
        }
      });
  }
}
