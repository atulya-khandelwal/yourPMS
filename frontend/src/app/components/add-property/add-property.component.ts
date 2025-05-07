import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import {jwtDecode} from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-property',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule],
  templateUrl: './add-property.component.html',
  styleUrls: ['./add-property.component.css']
})
export class AddPropertyComponent {
  
  propertyForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(1)]),
    address: new FormControl('', [Validators.required, Validators.minLength(1)])
  });

  constructor(private toastr: ToastrService, private router: Router, private http: HttpClient) { }
  

  onSave(): void {
    if (this.propertyForm.valid) {
      const formValue = this.propertyForm.value;
      console.log('Property Form Value:', formValue);

      // Assuming the user_id is available (you can get it from the authenticated user data)
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.error('No token found');
        return;
      }

      let userId: string;
      try {
        const decoded: any = jwtDecode(token);
        userId = decoded.userId; // Change if your token uses a different key
      } catch (err) {
        console.error('Failed to decode token', err);
        return;
      }

      const propertyData = {
        ...formValue,
        user_id: userId // Assuming user_id is passed to the API
      };

      const headers = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      // Send the property data to the backend API
      this.http.post<any>(`${environment.apiUrl}/properties`, propertyData, headers)
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.toastr.success('Property added successfully!');
              this.router.navigate(['/properties']); // Redirect to the property detail page
            } else {
              this.toastr.error('Failed to add Property');
              console.error('Failed to add property:', response.message);
            }
            // Redirect to the properties list page after successful addition
            
          },
          error: (err) => {
            console.error('Failed to add property:', err);
          }
        });
    } else {
      console.error('Form is invalid');
    }
  }
}
