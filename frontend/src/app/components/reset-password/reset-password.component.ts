import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule],
  templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent implements OnInit {
  resetForm = new FormGroup({
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
  });

  token = '';
  message = '';
  error = '';

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
  }

  onSubmit() {
    if (this.resetForm.valid) {
      const payload = {
        password: this.resetForm.value.password,
        token: this.token
      };

      this.http.post(`${environment.apiUrl}/auth/reset-password`, payload)
        .subscribe({
          next: (res: any) => {
            this.message = res.message;
            this.error = '';
            setTimeout(() => this.router.navigate(['/login']), 3000);
          },
          error: err => {
            this.error = err.error?.error || 'Password reset failed';
            this.message = '';
          }
        });
    }
  }
}
