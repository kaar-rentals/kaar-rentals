export interface Car {
  id: string;
  brand: string;
  model: string;
  category: 'SUV' | 'Sedan' | 'Hatchback';
  price: number;
  image: string;
  logo: string;
  features: string[];
  engineCapacity: string;
  fuelType: string;
  transmission: string;
  year: number;
  mileage: string;
  seating: number;
  description: string;
}

export interface Dealer {
  id: string;
  name: string;
  whatsapp: string;
  location: string;
  email: string;
  phone: string;
  rating: number;
  description: string;
}

export interface BookingForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  pickupDate: string;
  returnDate: string;
  licenseNumber: string;
  address: string;
  city: string;
  zipCode: string;
}

export interface ListingForm {
  brand: string;
  model: string;
  category: 'SUV' | 'Sedan' | 'Hatchback';
  year: number;
  price: number;
  engineCapacity: string;
  fuelType: string;
  transmission: string;
  mileage: string;
  seating: number;
  features: string[];
  description: string;
  images: string[];
  dealerInfo: {
    name: string;
    whatsapp: string;
    location: string;
    email: string;
    phone: string;
  };
}