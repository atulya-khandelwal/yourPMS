import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Property } from '../../models/property.model';
import { jwtDecode } from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './properties.component.html',
  styleUrl: './properties.component.css'
})
export class PropertiesComponent implements OnInit {
  properties: Property[] = [];
  loading: boolean = true;

  constructor(private toastr: ToastrService, private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('No token found');
      return;
    }

    let userId: string;
    try {
      const decoded: any = jwtDecode(token);
      userId = decoded.userId; // Or decoded.user_id, depending on your backend token
    } catch (err) {
      console.error('Failed to decode token', err);
      return;
    }

    const headers = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };

    // Fetch all properties for user
    this.http.get<Property[]>(`${environment.apiUrl}/properties/all-properties?userId=${userId}`, headers).subscribe({
      next: (res) => {
        this.properties = res;
        this.loading = false;
        
      },
      error: () => {
        console.error('Failed to load properties');
        this.loading = false;
      }
    });
  }

  addProperty(): void {
    this.router.navigate(['/add-property']);
  }

  addFloor(propertyId: number): void {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('No token found');
      return;
    }

    const headers = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };

    const payload = {
      property_id: propertyId
    };

    this.http.post(`${environment.apiUrl}/floors`, payload, headers).subscribe({
      next: (res) => {
        console.log('Floor added:', res);
        this.toastr.success('Floor added successfully!');
        // Optional: reload properties or show success message
      },
      error: (err) => {
        console.error('Error adding floor:', err);
        this.toastr.error('Failed to add floor');
      }
    });
  }

  seeDetails(propertyId: number): void {
    this.router.navigate(['/property-detail', propertyId]);
  }

  seeAvailableUnits(propertyId: number): void {
    this.router.navigate(['/available-units', propertyId]);
  }

  logout(): void {
    this.router.navigate(['/logout']);
  }
}
