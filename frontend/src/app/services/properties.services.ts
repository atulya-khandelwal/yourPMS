import { Injectable } from '@angular/core';

export interface Property {
  id: number;
  name: string;
  address: string;
}

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  properties: Property[] = [];
  idCounter = 1;

  getProperties(): Property[] {
    return this.properties;
  }

  addProperty(name: string, address: string) {
    this.properties.push({ id: this.idCounter++, name, address });
  }
}
