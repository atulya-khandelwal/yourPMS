import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.css'
})
export class LogoutComponent implements OnInit {
  private auth = inject(AuthService);
  private http = inject(HttpClient);
  private router = inject(Router);

  ngOnInit(): void {
    const refreshToken = this.auth.getRefreshToken();

    if (refreshToken) {
      this.http.post(`${environment.apiUrl}/auth/logout`, { refreshToken }).subscribe({
        next: () => {
          this.auth.logout();
          this.router.navigate(['/login']);
        },
        error: () => {
          // Even if logout API fails, still clear and redirect
          this.auth.logout();
          this.router.navigate(['/login']);
        }
      });
    } else {
      // No token, just logout
      this.auth.logout();
      this.router.navigate(['/login']);
    }
  }
}
