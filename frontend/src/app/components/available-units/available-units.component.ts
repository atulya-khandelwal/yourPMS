import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-available-units',
  standalone: true,
  imports: [HttpClientModule],
  templateUrl: './available-units.component.html',
  styleUrls: ['./available-units.component.css']
})
export class AvailableUnitsComponent implements OnInit {
  availableUnits: any[] = [];
  propertyId: number = 0;
  loading: boolean = true;

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    // Get the propertyId from the URL
    this.propertyId = +this.route.snapshot.paramMap.get('propertyId')!;

    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('No token found');
      this.loading = false;
      return;
    }

    const headers = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };

    // Fetch available units for the property
    this.http.get<any[]>(`${environment.apiUrl}/units/available/${this.propertyId}`, headers).subscribe({
      next: (data) => {
        this.availableUnits = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching available units:', err);
        this.loading = false;
      }
    });
  }
}
