import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Heart, Star, User, Fuel, Settings, MapPin, Phone, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Car } from '@/services/api';
import { Link } from 'react-router-dom';

interface FullScreenCarModalProps {
  car: Car;
  isOpen: boolean;
  onClose: () => void;
  initialImageIndex?: number;
}

const FullScreenCarModal = ({ car, isOpen, onClose, initialImageIndex = 0 }: FullScreenCarModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(initialImageIndex);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    setCurrentImageIndex(initialImageIndex);
  }, [initialImageIndex]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const nextImage = () => {
    if (car.images && car.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % car.images.length);
    }
  };

  const prevImage = () => {
    if (car.images && car.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + car.images.length) % car.images.length);
    }
  };

  const getCurrentImage = () => {
    if (car.images && car.images.length > 0) {
      return car.images[currentImageIndex];
    }
    return car.image || '/placeholder-car.jpg';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal Content */}
      <div className="relative w-full h-full max-w-7xl max-h-[90vh] mx-4 bg-white rounded-xl overflow-hidden shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Close modal"
        >
          <X className="h-6 w-6 text-gray-800" />
        </button>

        {/* Content */}
        <div className="flex flex-col lg:flex-row h-full">
          {/* Image Section */}
          <div className="flex-1 relative bg-gray-100">
            <img 
              src={getCurrentImage()} 
              alt={`${car.brand} ${car.model} ${car.year} - ${car.category} car for rent`}
              className="w-full h-full object-cover"
            />
            
            {/* Image Navigation */}
            {car.images && car.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6 text-gray-800" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6 text-gray-800" />
                </button>
                
                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {currentImageIndex + 1} / {car.images.length}
                </div>
              </>
            )}

            {/* Thumbnail Gallery */}
            {car.images && car.images.length > 1 && (
              <div className="absolute bottom-4 left-4 right-20 flex space-x-2 overflow-x-auto pb-2">
                {car.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
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

          {/* Details Section */}
          <div className="w-full lg:w-96 bg-white p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Header */}
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {car.brand} {car.model}
                    </h2>
                    <p className="text-gray-600">{car.year} • {car.category}</p>
                  </div>
                  <button 
                    onClick={() => setIsFavorited(!isFavorited)}
                    className="bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Heart className={`h-5 w-5 ${isFavorited ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
                  </button>
                </div>


                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-green-100 text-green-800">
                    {car.isRented ? 'Rented' : 'Available'}
                  </Badge>
                  {car.verified && (
                    <Badge className="bg-blue-100 text-blue-800">
                      Verified
                    </Badge>
                  )}
                  {car.featured && (
                    <Badge className="bg-amber-100 text-amber-800">
                      Featured
                    </Badge>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-gray-900">
                  PKR {(car.pricePerDay || car.price || 0).toLocaleString()}
                  <span className="text-lg text-gray-600 font-normal">/day</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Best price guaranteed</p>
              </div>

              {/* Specifications */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="text-sm font-medium">{car.seating} Seats</div>
                    <div className="text-xs text-gray-500">Capacity</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Fuel className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="text-sm font-medium">{car.mileage}</div>
                    <div className="text-xs text-gray-500">Mileage</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-accent" />
                  <div>
                    <div className="text-sm font-medium">{car.transmission}</div>
                    <div className="text-xs text-gray-500">Transmission</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-red-600" />
                  <div>
                    <div className="text-sm font-medium">{car.location}</div>
                    <div className="text-xs text-gray-500">Location</div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {car.description && (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{car.description}</p>
                </div>
              )}

              {/* Features */}
              {car.features && car.features.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {car.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Owner Info */}
              {car.owner && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Owner</h3>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {car.owner.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">{car.owner.name}</div>
                      <div className="text-sm text-gray-500">{car.owner.email}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 pt-4 border-t">
                <Link to={`/car/${car._id}/book`} className="block">
                  <Button className="w-full" size="lg">
                    Book Now
                  </Button>
                </Link>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      const phone = car.owner?.phone || '03090017510';
                      const whatsapp = phone.replace(/[^0-9]/g, '');
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
                      const phone = car.owner?.phone || '03090017510';
                      window.open(`tel:${phone}`, '_self');
                    }}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullScreenCarModal;
