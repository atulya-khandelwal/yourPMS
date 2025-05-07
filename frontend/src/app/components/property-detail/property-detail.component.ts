import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './property-detail.component.html',
  styleUrl: './property-detail.component.css'
})
export class PropertyDetailComponent implements OnInit {
  property: any;
  loading = true;
  error: string | null = null;
  propertyId: string | null = null;

  constructor(private toastr: ToastrService, private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    this.propertyId = this.route.snapshot.paramMap.get('id');
    if (!this.propertyId) {
      this.error = 'Property ID not found in URL';
      return;
    }

    this.fetchPropertyDetails();
  }

  get authHeaders() {
    const token = localStorage.getItem('access_token');
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  }

  fetchPropertyDetails(): void {
    this.loading = true;
    this.error = null;

    this.http.get(`${environment.apiUrl}/properties/${this.propertyId}/details`, this.authHeaders)
      .subscribe({
        next: (data) => {
          this.property = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to fetch property details';
          console.error(err);
          this.loading = false;
        }
      });
  }

  addUnit(floorId: number): void {
    this.http.post(`${environment.apiUrl}/units`, { floor_id: floorId }, this.authHeaders)
      .subscribe({
        next: () => {
          
          this.fetchPropertyDetails();
          this.toastr.success('Unit added successfully!');
        },
        error: (err) => {
          console.error('Failed to add unit:', err);
          this.toastr.error('Failed to add floor');
        }
      });
  }

  bookUnit(unitId: number): void {
    this.http.put(`${environment.apiUrl}/units/${unitId}/book`, {}, this.authHeaders)
      .subscribe({
        next: () => {
          this.fetchPropertyDetails();
        },
        error: (err) => {
          console.error('Failed to book unit:', err);
        }
      });
  }
}
