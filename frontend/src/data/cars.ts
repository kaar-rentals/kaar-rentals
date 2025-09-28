interface Car {
  _id: string;
  brand: string;
  model: string;
  year: number;
  category: 'Sedan' | 'SUV' | 'Hatchback';
  pricePerDay: number;
  images: string[];
  location: string;
  city: string;
  engineCapacity: string;
  fuelType: string;
  transmission: string;
  mileage: string;
  seating: number;
  features: string[];
  description: string;
  isActive: boolean;
  isRented: boolean;
  isApproved: boolean;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  paymentId: string;
  owner: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Dealer {
  id: string;
  name: string;
  whatsapp: string;
  location: string;
  email: string;
  phone: string;
  rating: number;
  description: string;
}
import bmwSedanImg from '@/assets/bmw-sedan.jpg';
import mercedesSuvImg from '@/assets/mercedes-suv.jpg';
import audiHatchbackImg from '@/assets/audi-hatchback.jpg';
import toyotaSedanImg from '@/assets/toyota-sedan.jpg';
import hondaSuvImg from '@/assets/honda-suv.jpg';

export const dealers: Dealer[] = [
  {
    id: 'dealer-1',
    name: 'Premium Auto Dealership',
    whatsapp: '+923090017510',
    location: 'DHA Phase 5, Karachi',
    email: 'kaar.rentals@gmail.com',
    phone: '03090017510',
    rating: 4.8,
    description: 'Luxury car specialists with over 20 years of experience in premium automotive sales.'
  },
  {
    id: 'dealer-2',
    name: 'Elite Motors',
    whatsapp: '+923090017510',
    location: 'Gulberg, Lahore',
    email: 'kaar.rentals@gmail.com',
    phone: '03090017510',
    rating: 4.9,
    description: 'Your trusted partner for high-end vehicles and exceptional customer service.'
  }
];

export const cars: Car[] = [
  {
    _id: 'bmw-320i',
    brand: 'BMW',
    model: '320i',
    category: 'Sedan',
    pricePerDay: 45000,
    images: [bmwSedanImg],
    location: 'DHA Phase 5, Karachi',
    city: 'Karachi',
    features: ['Leather Seats', 'Navigation System', 'Bluetooth', 'Sunroof', 'Heated Seats'],
    engineCapacity: '2.0L Turbo',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    year: 2023,
    mileage: '12 km/L',
    seating: 5,
    description: 'Experience luxury and performance with the BMW 320i. Perfect balance of comfort and driving dynamics.',
    isActive: true,
    isRented: false,
    isApproved: true,
    paymentStatus: 'PAID',
    paymentId: 'static-1',
    owner: {
      _id: 'owner-1',
      name: 'Premium Auto Dealership',
      email: 'kaar.rentals@gmail.com',
      phone: '03090017510'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'mercedes-glc',
    brand: 'Mercedes-Benz',
    model: 'GLC 300',
    category: 'SUV',
    pricePerDay: 60000,
    images: [mercedesSuvImg],
    location: 'Gulberg, Lahore',
    city: 'Lahore',
    features: ['4MATIC AWD', 'Premium Audio', 'Panoramic Roof', 'Adaptive Cruise Control', 'Ambient Lighting'],
    engineCapacity: '2.0L Turbo',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    year: 2023,
    mileage: '10.5 km/L',
    seating: 5,
    description: 'The Mercedes-Benz GLC 300 combines elegance with capability. Premium SUV for the discerning driver.',
    isActive: true,
    isRented: false,
    isApproved: true,
    paymentStatus: 'PAID',
    paymentId: 'static-2',
    owner: {
      _id: 'owner-2',
      name: 'Elite Motors',
      email: 'kaar.rentals@gmail.com',
      phone: '03090017510'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'audi-a3',
    brand: 'Audi',
    model: 'A3 Sportback',
    category: 'Hatchback',
    pricePerDay: 37500,
    images: [audiHatchbackImg],
    location: 'DHA Phase 5, Karachi',
    city: 'Karachi',
    features: ['Virtual Cockpit', 'Bang & Olufsen Audio', 'Quattro AWD', 'LED Headlights', 'Wireless Charging'],
    engineCapacity: '2.0L TFSI',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    year: 2023,
    mileage: '13 km/L',
    seating: 5,
    description: 'Compact luxury with Audi A3 Sportback. Advanced technology meets sophisticated design.',
    isActive: true,
    isRented: false,
    isApproved: true,
    paymentStatus: 'PAID',
    paymentId: 'static-3',
    owner: {
      _id: 'owner-1',
      name: 'Premium Auto Dealership',
      email: 'kaar.rentals@gmail.com',
      phone: '03090017510'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'toyota-camry',
    brand: 'Toyota',
    model: 'Camry Hybrid',
    category: 'Sedan',
    pricePerDay: 30000,
    images: [toyotaSedanImg],
    location: 'Gulberg, Lahore',
    city: 'Lahore',
    features: ['Hybrid Engine', 'Safety Sense 2.0', 'JBL Audio', 'Wireless Android Auto', 'LED Lighting'],
    engineCapacity: '2.5L Hybrid',
    fuelType: 'Hybrid',
    transmission: 'CVT',
    year: 2023,
    mileage: '22 km/L',
    seating: 5,
    description: 'Efficiency meets reliability with the Toyota Camry Hybrid. Perfect for eco-conscious drivers.',
    isActive: true,
    isRented: false,
    isApproved: true,
    paymentStatus: 'PAID',
    paymentId: 'static-4',
    owner: {
      _id: 'owner-2',
      name: 'Elite Motors',
      email: 'kaar.rentals@gmail.com',
      phone: '03090017510'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: 'honda-pilot',
    brand: 'Honda',
    model: 'Pilot Elite',
    category: 'SUV',
    pricePerDay: 52500,
    images: [hondaSuvImg],
    location: 'DHA Phase 5, Karachi',
    city: 'Karachi',
    features: ['3-Row Seating', 'Honda Sensing', 'Premium Audio', 'Hands-Free Tailgate', 'Tri-Zone Climate'],
    engineCapacity: '3.5L V6',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    year: 2023,
    mileage: '9.5 km/L',
    seating: 8,
    description: 'Family-friendly Honda Pilot Elite offers space, comfort, and advanced safety features.',
    isActive: true,
    isRented: false,
    isApproved: true,
    paymentStatus: 'PAID',
    paymentId: 'static-5',
    owner: {
      _id: 'owner-1',
      name: 'Premium Auto Dealership',
      email: 'kaar.rentals@gmail.com',
      phone: '03090017510'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];