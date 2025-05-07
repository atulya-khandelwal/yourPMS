import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, HttpClientModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  loginForm: FormGroup = new FormGroup({
    email: new FormControl("", [Validators.required, Validators.email]),
    password: new FormControl("", [Validators.required])
  });

  onLogin() {
    if (this.loginForm.valid) {
      const formData = this.loginForm.value;

      this.http.post<any>(`${environment.apiUrl}/auth/login`, formData).subscribe({
        next: (response) => {
          if (response.success && response.accessToken && response.refreshToken) {
            localStorage.setItem('access_token', response.accessToken);
            localStorage.setItem('refresh_token', response.refreshToken);
            console.log('Login successful, tokens stored');
            this.router.navigate(['/dashboard']); // or wherever
          } else {
            console.warn('Login succeeded but tokens missing');
          }
        },
        error: (err) => {
          console.error('Login failed:', err);
        }
      });
    } else {
      console.log('Form is invalid');
    }
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
