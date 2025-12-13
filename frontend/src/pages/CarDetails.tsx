import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, User, Fuel, Settings, MapPin, Phone, MessageCircle, Mail, ChevronLeft, ChevronRight, Heart, AlertCircle } from 'lucide-react';
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
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const dealer = dealers[0]; // For demo, using first dealer

  useEffect(() => {
    loadCar();
  }, [id]);

  const loadCar = async () => {
    try {
      setLoading(true);
      setError(null);

      // Prefer fetching a single car by id from the API
      if (id) {
        try {
          const apiCar = await apiService.getCarById(id);
          if (apiCar) {
            setCar(apiCar);
            return;
          }
        } catch (e) {
          // Continue to fallback paths below
        }
      }

      // Fallback: load all cars and try to find it when endpoint not available
      try {
        const maybeCars = await apiService.getCars();
        const carsArray = Array.isArray(maybeCars)
          ? maybeCars
          : (Array.isArray((maybeCars as any)?.data) ? (maybeCars as any).data : []);
        const foundCar = carsArray.find((c: any) => c?._id === id || c?.id === id);
        if (foundCar) {
          setCar(foundCar);
          return;
        }
      } catch (e) {
        // Ignore and proceed to static fallback
      }

      // Static data fallback
      const staticCar = cars.find(c => c.id === id);
      if (staticCar) {
        setCar(staticCar as any);
      } else {
        setError('Listing not found');
      }
    } catch (error) {
      console.error('Error loading car:', error);
      setError('Failed to load listing. Please try again later.');
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

  if (error || !car) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mb-6">
            <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2 text-gray-900">
              {error || 'Listing not found'}
            </h1>
            <p className="text-gray-600 mb-6">
              {error === 'Listing not found' 
                ? 'The car listing you\'re looking for doesn\'t exist or may have been removed.'
                : 'Something went wrong while loading the listing details.'
              }
            </p>
          </div>
          <div className="space-x-4">
            <Link to="/cars">
              <Button>Browse All Cars</Button>
            </Link>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-16">
        {/* Breadcrumb */}
        <section className="py-4 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link to="/cars" className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cars
            </Link>
          </div>
        </section>

        {/* Car Details - Full Width Layout */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Image Gallery - 2/3 width */}
              <div className="lg:col-span-2 space-y-4">
                <div className="relative group">
                  <img 
                    src={getCurrentImage()} 
                    alt={`${car.brand} ${car.model}`}
                    className="w-full h-[500px] object-cover rounded-xl cursor-pointer"
                    onClick={() => {
                      // Open fullscreen image view
                      const newWindow = window.open(getCurrentImage(), '_blank');
                      if (newWindow) {
                        newWindow.document.write(`
                          <html>
                            <head><title>${car.brand} ${car.model}</title></head>
                            <body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;">
                              <img src="${getCurrentImage()}" style="max-width:100%;max-height:100vh;object-fit:contain;" />
                            </body>
                          </html>
                        `);
                      }
                    }}
                  />
                  
                  {/* Navigation Arrows */}
                  {car.images && car.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg"
                      >
                        <ChevronLeft className="h-6 w-6 text-gray-800" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg"
                      >
                        <ChevronRight className="h-6 w-6 text-gray-800" />
                      </button>
                    </>
                  )}

                  {/* Image Counter */}
                  {car.images && car.images.length > 1 && (
                    <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {car.images.length}
                    </div>
                  )}

                  {/* Brand Badge */}
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-gray-900 text-white px-4 py-2 text-sm font-medium">
                      {car.brand}
                    </Badge>
                  </div>

                  {/* Heart Icon */}
                  <button 
                    onClick={() => setIsFavorited(!isFavorited)}
                    className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-3 hover:bg-white transition-colors shadow-lg"
                  >
                    <Heart className={`h-5 w-5 ${isFavorited ? 'text-red-500 fill-current' : 'text-gray-700'}`} />
                  </button>
                </div>

                {/* Thumbnail Gallery */}
                {car.images && car.images.length > 1 && (
                  <div className="flex space-x-3 overflow-x-auto pb-2">
                    {car.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-24 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          index === currentImageIndex ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
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

              {/* Car Information - 1/3 width */}
              <div className="space-y-6">
                {/* Sticky Booking Card */}
                <div className="sticky top-24 bg-white rounded-xl shadow-lg border p-6">
                  <div className="space-y-4">
                    {/* Price */}
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        PKR {(car.pricePerDay || car.price || 0).toLocaleString()}
                        <span className="text-lg text-gray-600 font-normal">/day</span>
                      </div>
                      <p className="text-sm text-gray-600">Best price guaranteed</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <Link to={`/car/${car._id || car.id}/book`} className="block">
                        <Button 
                          size="lg" 
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                        >
                          Book Now
                        </Button>
                      </Link>
                      <Button size="lg" variant="outline" className="w-full">
                        Contact Owner
                      </Button>
                    </div>

                    {/* Quick Contact */}
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600 mb-2">Quick Contact</p>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => {
                            const phone = car.owner?.phone || '03090017510';
                            const whatsapp = phone.replace(/[^0-9]/g, '');
                            window.open(`https://wa.me/${whatsapp}`, '_blank');
                          }}
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          WhatsApp
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => {
                            const phone = car.owner?.phone || '03090017510';
                            window.open(`tel:${phone}`, '_self');
                          }}
                        >
                          <Phone className="h-4 w-4 mr-1" />
                          Call
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Car Information Section */}
        <section className="py-8 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Car Info - 2/3 width */}
              <div className="lg:col-span-2 space-y-8">
                {/* Car Title and Rating */}
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    {car.brand} {car.model}
                  </h1>
                  <div className="flex items-center space-x-4 text-gray-600 mb-4">
                    <span className="text-lg">{car.year}</span>
                    <span>•</span>
                    <span className="text-lg">{car.engineCapacity}</span>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-5 w-5 text-yellow-400 fill-current" />
                      <span className="font-medium">4.8 (124 reviews)</span>
                    </div>
                  </div>
                  <p className="text-lg text-gray-700 leading-relaxed">{car.description}</p>
                </div>

                {/* Quick Specs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <User className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <div className="font-semibold text-gray-900">{car.seating} Seats</div>
                    <div className="text-sm text-gray-600">Passengers</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <Fuel className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <div className="font-semibold text-gray-900">{car.mileage}</div>
                    <div className="text-sm text-gray-600">Fuel Economy</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <Settings className="h-8 w-8 mx-auto mb-2 text-accent" />
                    <div className="font-semibold text-gray-900">{car.transmission}</div>
                    <div className="text-sm text-gray-600">Transmission</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="h-8 w-8 mx-auto mb-2 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 font-bold text-sm">{car.category}</span>
                    </div>
                    <div className="font-semibold text-gray-900">{car.category}</div>
                    <div className="text-sm text-gray-600">Vehicle Type</div>
                  </div>
                </div>

                {/* Features & Specifications */}
                <div className="space-y-8">
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
              </div>

              {/* Owner Information - 1/3 width */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-lg border p-6">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">Owner Details</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-lg">
                          {(car.owner?.name || dealer.name).charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg text-gray-900">{car.owner?.name || dealer.name}</h4>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">4.8/5.0 (24 reviews)</span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm">
                      {car.owner?.name ? 'Verified car owner' : 'Trusted dealership'}
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{car.location || dealer.location}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{car.owner?.phone || dealer.phone}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{car.owner?.email || dealer.email}</span>
                      </div>
                    </div>

                    <div className="pt-4 space-y-2">
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
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
                        className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
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