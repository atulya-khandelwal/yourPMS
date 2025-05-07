import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule],
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {
  forgotForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  });

  successMessage = '';
  errorMessage = '';

  constructor(private http: HttpClient) {}

  onSubmit() {
    if (this.forgotForm.valid) {
      this.http.post(`${environment.apiUrl}/auth/forgot-password`, this.forgotForm.value)
        .subscribe({
          next: (res: any) => {
            this.successMessage = res.message;
            this.errorMessage = '';
          },
          error: err => {
            this.errorMessage = 'Something went wrong';
            this.successMessage = '';
          }
        });
    }
  }
}
