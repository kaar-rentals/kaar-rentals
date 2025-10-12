import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, User, Fuel, Settings, MapPin, Phone, MessageCircle, Mail, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiService, Car } from '@/services/api';
import { cars, dealers } from '@/data/cars';

const CarDetails = () => {
  const { id } = useParams();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const dealer = dealers[0]; // For demo, using first dealer

  useEffect(() => {
    loadCar();
  }, [id]);

  const loadCar = async () => {
    try {
      setLoading(true);
      const carsData = await apiService.getCars();
      const foundCar = carsData.find(c => c._id === id || c.id === id);
      if (foundCar) {
        setCar(foundCar);
      } else {
        // Fallback to static data
        const staticCar = cars.find(c => c.id === id);
        if (staticCar) {
          setCar(staticCar as any);
        }
      }
    } catch (error) {
      console.error('Error loading car:', error);
      // Fallback to static data
      const staticCar = cars.find(c => c.id === id);
      if (staticCar) {
        setCar(staticCar as any);
      }
    } finally {
      setLoading(false);
    }
  };

  const nextImage = () => {
    if (car && car.images) {
      setCurrentImageIndex((prev) => (prev + 1) % car.images.length);
    }
  };

  const prevImage = () => {
    if (car && car.images) {
      setCurrentImageIndex((prev) => (prev - 1 + car.images.length) % car.images.length);
    }
  };

  const getCurrentImage = () => {
    if (!car) return '/placeholder-car.jpg';
    if (car.images && car.images.length > 0) {
      return car.images[currentImageIndex];
    }
    return car.image || '/placeholder-car.jpg';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading car details...</p>
        </div>
      </div>
    );
  }

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
                <div className="relative group">
                  <img 
                    src={getCurrentImage()} 
                    alt={`${car.brand} ${car.model}`}
                    className="w-full h-96 object-cover rounded-xl"
                  />
                  
                  {/* Navigation Arrows */}
                  {car.images && car.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronLeft className="h-6 w-6 text-gray-800" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronRight className="h-6 w-6 text-gray-800" />
                      </button>
                    </>
                  )}

                  {/* Image Counter */}
                  {car.images && car.images.length > 1 && (
                    <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {car.images.length}
                    </div>
                  )}

                  {/* Brand Badge */}
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-gray-900 text-white px-3 py-1 text-sm font-medium">
                      {car.brand}
                    </Badge>
                  </div>

                  {/* Heart Icon */}
                  <button 
                    onClick={() => setIsFavorited(!isFavorited)}
                    className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-colors"
                  >
                    <Heart className={`h-4 w-4 ${isFavorited ? 'text-red-500 fill-current' : 'text-white'}`} />
                  </button>
                </div>

                {/* Thumbnail Gallery */}
                {car.images && car.images.length > 1 && (
                  <div className="flex space-x-2 overflow-x-auto pb-2">
                    {car.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 ${
                          index === currentImageIndex ? 'border-primary' : 'border-gray-200'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${car.brand} ${car.model} view ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
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
                    PKR {(car.pricePerDay || car.price || 0).toLocaleString()}
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
                  <Link to={`/car/${car._id || car.id}/book`} className="flex-1">
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

              {/* Owner Information */}
              <div className="space-y-6">
                <div className="premium-card p-6">
                  <h3 className="text-xl font-semibold mb-4">Owner Details</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-lg">{car.owner?.name || dealer.name}</h4>
                      <div className="flex items-center space-x-1 mt-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm">4.8/5.0 (24 reviews)</span>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground text-sm">
                      {car.owner?.name ? 'Verified car owner' : dealer.description}
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{car.location || dealer.location}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{car.owner?.phone || dealer.phone}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{car.owner?.email || dealer.email}</span>
                      </div>
                    </div>

                    <div className="pt-4 space-y-2">
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          const phone = car.owner?.phone || dealer.phone;
                          const whatsapp = phone.replace(/[^0-9]/g, '');
                          window.open(`https://wa.me/${whatsapp}`, '_blank');
                        }}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        WhatsApp Owner
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          const phone = car.owner?.phone || dealer.phone;
                          window.open(`tel:${phone}`, '_self');
                        }}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Call Owner
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