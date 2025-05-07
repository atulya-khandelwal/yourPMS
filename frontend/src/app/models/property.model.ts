// src/app/shared/models/property.model.ts
export interface Property {
  id: number;
  user_id: number;
  name: string;
  address: string;
  property_number: number;
    created_at: string;
}
  
  export interface Floor {
    id: string;
    property_id: string;
    property?: Property; // Add this
    floor_number: number;
    created_at: string;
    units?: Unit[];
  }
  
  export interface Unit {
    id: string;
    floor_id: string;
    floor?: Floor; // Add this
    unit_number: string;
    status: 'available' | 'booked';
    created_at: string;
}
  
export interface DecodedToken {
  user_id: string;
  // include other fields if needed like email, exp, etc.
}