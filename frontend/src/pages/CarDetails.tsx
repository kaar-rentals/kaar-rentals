import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, User, Fuel, Settings, MapPin, Phone, MessageCircle, Mail } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cars, dealers } from '@/data/cars';

const CarDetails = () => {
  const { id } = useParams();
  const car = cars.find(c => c.id === id);
  const dealer = dealers[0]; // For demo, using first dealer

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

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        {/* Breadcrumb */}
        <section className="py-6 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link to="/cars" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cars
            </Link>
          </div>
        </section>

        {/* Car Details */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Image Gallery */}
              <div className="space-y-4">
                <div className="relative">
                  <img 
                    src={car.image} 
                    alt={`${car.brand} ${car.model}`}
                    className="w-full h-96 object-cover rounded-xl"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-primary text-primary-foreground">
                      {car.category}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2">
                      <img 
                        src={car.logo} 
                        alt={car.brand}
                        className="h-8 w-8 object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Car Information */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-4xl font-bold text-foreground mb-2">
                    {car.brand} {car.model}
                  </h1>
                  <div className="flex items-center space-x-4 text-muted-foreground mb-4">
                    <span>{car.year}</span>
                    <span>•</span>
                    <span>{car.engineCapacity}</span>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span>4.8 (124 reviews)</span>
                    </div>
                  </div>
                  <p className="text-lg text-muted-foreground">{car.description}</p>
                </div>

                {/* Price */}
                <div className="bg-gradient-card p-6 rounded-xl">
                  <div className="text-3xl font-bold text-primary mb-2">
                    PKR {car.price.toLocaleString()}
                    <span className="text-lg text-muted-foreground font-normal">/day</span>
                  </div>
                  <p className="text-muted-foreground">Best price guaranteed</p>
                </div>

                {/* Quick Specs */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 premium-card">
                    <User className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="font-semibold">{car.seating} Seats</div>
                  </div>
                  <div className="text-center p-4 premium-card">
                    <Fuel className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="font-semibold">{car.mileage}</div>
                  </div>
                  <div className="text-center p-4 premium-card">
                    <Settings className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="font-semibold">{car.transmission}</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <Link to={`/car/${car.id}/book`} className="flex-1">
                    <Button 
                      size="lg" 
                      className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary"
                    >
                      Book Now
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline" className="flex-1">
                    Test Drive
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Information */}
        <section className="py-12 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Features & Specifications */}
              <div className="lg:col-span-2 space-y-8">
                {/* Features */}
                <div className="premium-card p-8">
                  <h2 className="text-2xl font-bold mb-6">Features & Equipment</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {car.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-accent rounded-full"></div>
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Specifications */}
                <div className="premium-card p-8">
                  <h2 className="text-2xl font-bold mb-6">Specifications</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Engine</span>
                        <span className="font-semibold">{car.engineCapacity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fuel Type</span>
                        <span className="font-semibold">{car.fuelType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Transmission</span>
                        <span className="font-semibold">{car.transmission}</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Year</span>
                        <span className="font-semibold">{car.year}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Mileage</span>
                        <span className="font-semibold">{car.mileage}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Seating</span>
                        <span className="font-semibold">{car.seating} persons</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dealer Information */}
              <div className="space-y-6">
                <div className="premium-card p-6">
                  <h3 className="text-xl font-semibold mb-4">Dealership Details</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-lg">{dealer.name}</h4>
                      <div className="flex items-center space-x-1 mt-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm">{dealer.rating}/5.0</span>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground text-sm">{dealer.description}</p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{dealer.location}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{dealer.phone}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{dealer.email}</span>
                      </div>
                    </div>

                    <div className="pt-4 space-y-2">
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => window.open(`https://wa.me/${dealer.whatsapp.replace(/[^0-9]/g, '')}`, '_blank')}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        WhatsApp
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Phone className="h-4 w-4 mr-2" />
                        Call Now
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Additional Services */}
                <div className="premium-card p-6">
                  <h3 className="text-lg font-semibold mb-4">Additional Services</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                      <span>Free delivery within city</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                      <span>24/7 roadside assistance</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                      <span>Comprehensive insurance</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                      <span>Flexible cancellation</span>
                    </li>
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

export default CarDetails;