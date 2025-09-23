import { Car, Dealer } from '@/types/car';
import bmwSedanImg from '@/assets/bmw-sedan.jpg';
import mercedesSuvImg from '@/assets/mercedes-suv.jpg';
import audiHatchbackImg from '@/assets/audi-hatchback.jpg';
import toyotaSedanImg from '@/assets/toyota-sedan.jpg';
import hondaSuvImg from '@/assets/honda-suv.jpg';

export const dealers: Dealer[] = [
  {
    id: 'dealer-1',
    name: 'Premium Auto Dealership',
    whatsapp: '+1-555-0123',
    location: 'Downtown Manhattan, NY',
    email: 'contact@premiumauto.com',
    phone: '+1-555-0123',
    rating: 4.8,
    description: 'Luxury car specialists with over 20 years of experience in premium automotive sales.'
  },
  {
    id: 'dealer-2',
    name: 'Elite Motors',
    whatsapp: '+1-555-0456',
    location: 'Beverly Hills, CA',
    email: 'info@elitemotors.com',
    phone: '+1-555-0456',
    rating: 4.9,
    description: 'Your trusted partner for high-end vehicles and exceptional customer service.'
  }
];

export const cars: Car[] = [
  {
    id: 'bmw-320i',
    brand: 'BMW',
    model: '320i',
    category: 'Sedan',
    price: 299,
    image: bmwSedanImg,
    logo: 'https://logoeps.com/wp-content/uploads/2013/03/bmw-vector-logo.png',
    features: ['Leather Seats', 'Navigation System', 'Bluetooth', 'Sunroof', 'Heated Seats'],
    engineCapacity: '2.0L Turbo',
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    year: 2023,
    mileage: '28 MPG',
    seating: 5,
    description: 'Experience luxury and performance with the BMW 320i. Perfect balance of comfort and driving dynamics.'
  },
  {
    id: 'mercedes-glc',
    brand: 'Mercedes-Benz',
    model: 'GLC 300',
    category: 'SUV',
    price: 399,
    image: mercedesSuvImg,
    logo: 'https://logoeps.com/wp-content/uploads/2013/03/mercedes-benz-vector-logo.png',
    features: ['4MATIC AWD', 'Premium Audio', 'Panoramic Roof', 'Adaptive Cruise Control', 'Ambient Lighting'],
    engineCapacity: '2.0L Turbo',
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    year: 2023,
    mileage: '25 MPG',
    seating: 5,
    description: 'The Mercedes-Benz GLC 300 combines elegance with capability. Premium SUV for the discerning driver.'
  },
  {
    id: 'audi-a3',
    brand: 'Audi',
    model: 'A3 Sportback',
    category: 'Hatchback',
    price: 249,
    image: audiHatchbackImg,
    logo: 'https://logoeps.com/wp-content/uploads/2013/03/audi-vector-logo.png',
    features: ['Virtual Cockpit', 'Bang & Olufsen Audio', 'Quattro AWD', 'LED Headlights', 'Wireless Charging'],
    engineCapacity: '2.0L TFSI',
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    year: 2023,
    mileage: '30 MPG',
    seating: 5,
    description: 'Compact luxury with Audi A3 Sportback. Advanced technology meets sophisticated design.'
  },
  {
    id: 'toyota-camry',
    brand: 'Toyota',
    model: 'Camry Hybrid',
    category: 'Sedan',
    price: 199,
    image: toyotaSedanImg,
    logo: 'https://logoeps.com/wp-content/uploads/2013/03/toyota-vector-logo.png',
    features: ['Hybrid Engine', 'Safety Sense 2.0', 'JBL Audio', 'Wireless Android Auto', 'LED Lighting'],
    engineCapacity: '2.5L Hybrid',
    fuelType: 'Hybrid',
    transmission: 'CVT',
    year: 2023,
    mileage: '52 MPG',
    seating: 5,
    description: 'Efficiency meets reliability with the Toyota Camry Hybrid. Perfect for eco-conscious drivers.'
  },
  {
    id: 'honda-pilot',
    brand: 'Honda',
    model: 'Pilot Elite',
    category: 'SUV',
    price: 349,
    image: hondaSuvImg,
    logo: 'https://logoeps.com/wp-content/uploads/2013/03/honda-vector-logo.png',
    features: ['3-Row Seating', 'Honda Sensing', 'Premium Audio', 'Hands-Free Tailgate', 'Tri-Zone Climate'],
    engineCapacity: '3.5L V6',
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    year: 2023,
    mileage: '23 MPG',
    seating: 8,
    description: 'Family-friendly Honda Pilot Elite offers space, comfort, and advanced safety features.'
  }
];