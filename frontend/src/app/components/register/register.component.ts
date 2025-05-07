import { JsonPipe } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient,HttpClientModule  } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, HttpClientModule, JsonPipe, RouterLink, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  submitted = false;
  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private router: Router
  ) {}
  
  registerForm: FormGroup = new FormGroup({
    name: new FormControl("", [Validators.required, Validators.minLength(1)]),
    email: new FormControl("", [Validators.required, Validators.minLength(1), Validators.email]),
    password: new FormControl("", [Validators.required, Validators.minLength(8), Validators.maxLength(100),  Validators.pattern(
      '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{};:"\\\\|,.<>\\/?]).{8,}$'
    )]),
  });

  get name() {
    return this.registerForm.get('name');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }


  formValue: any

  onRegister() {
    console.log('Registering user...', this.registerForm.value);
    console.log('Form Valid:', this.registerForm.valid);
    if (this.registerForm.valid) {
      const formData = this.registerForm.value;
  
      this.http.post<any>(`${environment.apiUrl}/auth/register`, formData).subscribe({
        next: (response) => {
          if (response.success && response.accessToken && response.refreshToken) {
            localStorage.setItem('access_token', response.accessToken);
            localStorage.setItem('refresh_token', response.refreshToken);
            console.log('Tokens stored:', {
              access: response.accessToken,
              refresh: response.refreshToken,
            });
            this.router.navigate(['/properties']); // or any protected route
          } else {
            console.warn('Registration succeeded but token(s) missing');
          }
        },
        error: (error) => {
          console.error('Registration error:', error);
        }
      });
    } else {
      console.log('Form is invalid');
      this.registerForm.markAllAsTouched();
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
  
}
