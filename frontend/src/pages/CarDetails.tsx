import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Fuel, Settings, MapPin, Phone, MessageCircle, Mail, ChevronLeft, ChevronRight, Heart, AlertCircle, LogIn, X } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { apiService, Car } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cars, dealers } from '@/data/cars';

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [contactPhone, setContactPhone] = useState<string | null>(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
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

                    {/* Contact Owner Button */}
                    <div className="space-y-3">
                      <Button 
                        size="lg" 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                        onClick={async () => {
                          if (!user) {
                            setLoginModalOpen(true);
                            return;
                          }
                          
                          try {
                            const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://kaar-rentals-backend.onrender.com/api';
                            const response = await fetch(`${API_BASE_URL}/cars/${car._id || car.id}/contact`, {
                              headers: {
                                'Authorization': `Bearer ${token}`,
                              },
                            });
                            
                            if (response.status === 401) {
                              setLoginModalOpen(true);
                              return;
                            }
                            
                            if (response.status === 404) {
                              const errorData = await response.json().catch(() => ({ message: 'Owner phone not available' }));
                              toast({
                                title: "Contact Unavailable",
                                description: errorData.message || "Owner phone not available",
                                variant: "destructive",
                              });
                              return;
                            }
                            
                            if (!response.ok) {
                              throw new Error('Failed to fetch contact');
                            }
                            
                            const data = await response.json();
                            setContactPhone(data.phone);
                            setContactModalOpen(true);
                          } catch (err: any) {
                            toast({
                              title: "Error",
                              description: err.message || "Failed to fetch contact information",
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Contact Owner
                      </Button>
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
                {/* Car Title and Status */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h1 className="text-4xl font-bold text-gray-900">
                      {car.brand} {car.model}
                    </h1>
                    {car.status && (
                      <Badge 
                        variant={car.status === 'rented' ? 'destructive' : 'default'}
                        className={car.status === 'rented' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}
                      >
                        {car.status === 'rented' ? 'Rented' : 'Available'}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-gray-600 mb-4">
                    <span className="text-lg">{car.year}</span>
                    <span>•</span>
                    <span className="text-lg">{car.engineCapacity}</span>
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
                  {user && car.owner?.name ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-lg">
                            {car.owner.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg text-gray-900">{car.owner.name}</h4>
                        </div>
                      </div>
                      
                      {car.owner.location && (
                        <div className="flex items-center space-x-3">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-700">{car.owner.location}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4 text-center">
                      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
                      <p className="text-gray-600">
                        Sign in to view owner details
                      </p>
                      <Button 
                        className="w-full"
                        onClick={() => setLoginModalOpen(true)}
                      >
                        <LogIn className="h-4 w-4 mr-2" />
                        Sign in to view owner details
                      </Button>
                    </div>
                  )}
                </div>

                {/* Status Toggle - Owner/Admin Only */}
                {user && (user.is_admin || user.role === 'admin' || (car.owner && typeof car.owner === 'object' && (car.owner._id === user._id || car.owner.toString() === user._id))) && (
                  <div className="bg-white rounded-xl shadow-lg border p-6">
                    <h3 className="text-xl font-semibold mb-4 text-gray-900">Listing Status</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Current Status:</span>
                        <Badge 
                          variant={car.status === 'rented' ? 'destructive' : 'default'}
                          className={car.status === 'rented' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}
                        >
                          {car.status === 'rented' ? 'Rented' : 'Available'}
                        </Badge>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={async () => {
                          if (!token) {
                            toast({
                              title: "Authentication Required",
                              description: "Please sign in to update listing status",
                              variant: "destructive",
                            });
                            return;
                          }
                          try {
                            const newStatus = car.status === 'rented' ? 'available' : 'rented';
                            const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://kaar-rentals-backend.onrender.com/api';
                            const response = await fetch(`${API_BASE_URL}/cars/${car._id}/status`, {
                              method: 'PUT',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`,
                              },
                              body: JSON.stringify({ status: newStatus }),
                            });
                            if (response.ok) {
                              const updatedCar = await response.json();
                              setCar(updatedCar);
                              toast({
                                title: "Status Updated",
                                description: `Listing marked as ${newStatus}`,
                              });
                            } else {
                              throw new Error('Failed to update status');
                            }
                          } catch (err: any) {
                            toast({
                              title: "Update Failed",
                              description: err.message || "Failed to update listing status",
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        Change status to {car.status === 'rented' ? 'Available' : 'Rented'}
                      </Button>
                    </div>
                  </div>
                )}

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

      {/* Login Modal */}
      <Dialog open={loginModalOpen} onOpenChange={setLoginModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign In Required</DialogTitle>
            <DialogDescription>
              Please sign in to view the owner's contact information.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-2">
            <Button 
              className="w-full"
              onClick={() => {
                setLoginModalOpen(false);
                navigate('/auth?mode=login');
              }}
            >
              Go to Sign In
            </Button>
            <Button 
              variant="outline"
              className="w-full"
              onClick={() => setLoginModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contact Phone Modal */}
      <Dialog open={contactModalOpen} onOpenChange={setContactModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Owner Contact</DialogTitle>
            <DialogDescription>
              Contact the owner directly
            </DialogDescription>
          </DialogHeader>
          {contactPhone && (
            <div className="mt-4 space-y-4">
              <div className="text-center">
                <Phone className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                <p className="text-2xl font-bold">{contactPhone}</p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    const whatsapp = contactPhone.replace(/[^0-9]/g, '');
                    window.open(`https://wa.me/${whatsapp}`, '_blank');
                  }}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
                <Button 
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    window.open(`tel:${contactPhone}`, '_self');
                  }}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
              </div>
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => setContactModalOpen(false)}
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CarDetails;