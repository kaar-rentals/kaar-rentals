import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, CreditCard, User, MapPin, ArrowLeft } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cars } from '@/data/cars';

const BookCar = () => {
  const { id } = useParams();
  const car = cars.find(c => c.id === id);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    pickupDate: '',
    returnDate: '',
    licenseNumber: '',
    address: '',
    city: '',
    zipCode: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Booking submission:', formData);
    alert('Booking request submitted successfully! We will contact you to confirm details.');
  };

  if (!car) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Car not found</h1>
          <Link to="/cars">
            <Button>Browse Cars</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Calculate days and total price
  const calculateTotal = () => {
    if (formData.pickupDate && formData.returnDate) {
      const pickup = new Date(formData.pickupDate);
      const returnDate = new Date(formData.returnDate);
      const days = Math.ceil((returnDate.getTime() - pickup.getTime()) / (1000 * 3600 * 24));
      return days > 0 ? days * car.price : 0;
    }
    return 0;
  };

  const totalPrice = calculateTotal();
  const days = formData.pickupDate && formData.returnDate ? 
    Math.ceil((new Date(formData.returnDate).getTime() - new Date(formData.pickupDate).getTime()) / (1000 * 3600 * 24)) : 0;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        {/* Header */}
        <section className="bg-gradient-to-r from-primary via-primary-dark to-accent py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link to="/cars" className="inline-flex items-center text-white hover:text-accent transition-colors mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cars
            </Link>
            <h1 className="text-4xl font-bold text-white">Book Your Rental</h1>
            <p className="text-xl text-white/90 mt-2">
              {car.brand} {car.model} • ${car.price}/day
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Booking Form */}
              <div className="lg:col-span-2">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Personal Information */}
                  <div className="premium-card p-8">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <h2 className="text-2xl font-bold">Personal Information</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input 
                          id="firstName" 
                          value={formData.firstName}
                          onChange={(e) => setFormData(prev => ({...prev, firstName: e.target.value}))}
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input 
                          id="lastName" 
                          value={formData.lastName}
                          onChange={(e) => setFormData(prev => ({...prev, lastName: e.target.value}))}
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input 
                          id="email" 
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input 
                          id="phone" 
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
                          required 
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="licenseNumber">Driver's License Number *</Label>
                        <Input 
                          id="licenseNumber" 
                          value={formData.licenseNumber}
                          onChange={(e) => setFormData(prev => ({...prev, licenseNumber: e.target.value}))}
                          required 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Rental Dates */}
                  <div className="premium-card p-8">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="bg-accent/10 p-2 rounded-lg">
                        <Calendar className="h-6 w-6 text-accent" />
                      </div>
                      <h2 className="text-2xl font-bold">Rental Period</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="pickupDate">Pickup Date *</Label>
                        <Input 
                          id="pickupDate" 
                          type="date"
                          value={formData.pickupDate}
                          onChange={(e) => setFormData(prev => ({...prev, pickupDate: e.target.value}))}
                          min={new Date().toISOString().split('T')[0]}
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="returnDate">Return Date *</Label>
                        <Input 
                          id="returnDate" 
                          type="date"
                          value={formData.returnDate}
                          onChange={(e) => setFormData(prev => ({...prev, returnDate: e.target.value}))}
                          min={formData.pickupDate || new Date().toISOString().split('T')[0]}
                          required 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="premium-card p-8">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="bg-secondary/10 p-2 rounded-lg">
                        <MapPin className="h-6 w-6 text-secondary" />
                      </div>
                      <h2 className="text-2xl font-bold">Address Information</h2>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="address">Street Address *</Label>
                        <Input 
                          id="address" 
                          value={formData.address}
                          onChange={(e) => setFormData(prev => ({...prev, address: e.target.value}))}
                          required 
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="city">City *</Label>
                          <Input 
                            id="city" 
                            value={formData.city}
                            onChange={(e) => setFormData(prev => ({...prev, city: e.target.value}))}
                            required 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="zipCode">Zip Code *</Label>
                          <Input 
                            id="zipCode" 
                            value={formData.zipCode}
                            onChange={(e) => setFormData(prev => ({...prev, zipCode: e.target.value}))}
                            required 
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    size="lg"
                    className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary"
                  >
                    Confirm Booking
                  </Button>
                </form>
              </div>

              {/* Booking Summary */}
              <div className="space-y-6">
                {/* Car Summary */}
                <div className="premium-card p-6">
                  <h3 className="text-xl font-semibold mb-4">Booking Summary</h3>
                  <div className="space-y-4">
                    <img 
                      src={car.image} 
                      alt={`${car.brand} ${car.model}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <div>
                      <h4 className="font-semibold">{car.brand} {car.model}</h4>
                      <p className="text-muted-foreground text-sm">{car.category} • {car.year}</p>
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="premium-card p-6">
                  <h3 className="text-xl font-semibold mb-4">Price Breakdown</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Daily Rate</span>
                      <span>PKR {car.price.toLocaleString()}</span>
                    </div>
                    {days > 0 && (
                      <>
                        <div className="flex justify-between">
                          <span>Number of Days</span>
                          <span>{days}</span>
                        </div>
                        <div className="border-t border-border pt-3">
                          <div className="flex justify-between font-semibold">
                            <span>Subtotal</span>
                            <span>PKR {totalPrice.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Taxes & Fees</span>
                          <span>PKR {Math.round(totalPrice * 0.15).toLocaleString()}</span>
                        </div>
                        <div className="border-t border-border pt-3">
                          <div className="flex justify-between text-lg font-bold">
                            <span>Total</span>
                            <span>PKR {(totalPrice + Math.round(totalPrice * 0.15)).toLocaleString()}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Included Features */}
                <div className="premium-card p-6">
                  <h3 className="text-lg font-semibold mb-4">Included Features</h3>
                  <ul className="space-y-2 text-sm">
                    {car.features.slice(0, 5).map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BookCar;