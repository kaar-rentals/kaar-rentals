import { Heart, Star, User, Fuel, Settings, ChevronLeft, ChevronRight, Shield, Crown, CheckCircle, Camera, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Car } from '@/services/api';
import { Link } from 'react-router-dom';
import { useState } from 'react';

interface FeaturedCarCardProps {
  car: Car;
}

const FeaturedCarCard = ({ car }: FeaturedCarCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

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

  return (
    <Link 
      to={`/car/${car._id || car.id}/details`}
      className="block group"
      aria-label={`View details for ${car.brand} ${car.model} - ${car.year} ${car.category}`}
    >
      <div className={`bg-white rounded-xl shadow-sm border overflow-hidden group-hover:shadow-2xl group-hover:scale-[1.02] group-hover:-translate-y-1 transition-all duration-200 ease-out relative ${
        car.featured 
          ? 'border-amber-200 ring-1 ring-amber-100' 
          : 'border-gray-100'
      }`}>
        {/* Featured Ribbon */}
        {car.featured && (
          <div className="absolute top-0 right-0 z-10">
            <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-white px-3 py-1 text-xs font-semibold rounded-bl-lg shadow-lg">
              <Crown className="h-3 w-3 inline mr-1" />
              Featured
            </div>
          </div>
        )}
        {/* Image Section - 16:9 Aspect Ratio */}
        <div className="relative aspect-[16/9] overflow-hidden">
          <img 
            src={getCurrentImage()} 
            alt={`${car.brand} ${car.model} ${car.year} - ${car.category} car for rent`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            role="img"
          />
          
          {/* Image Carousel Navigation */}
          {car.images && car.images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={`Previous image of ${car.brand} ${car.model}`}
                tabIndex={0}
              >
                <ChevronLeft className="h-4 w-4 text-gray-800" />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={`Next image of ${car.brand} ${car.model}`}
                tabIndex={0}
              >
                <ChevronRight className="h-4 w-4 text-gray-800" />
              </button>
              
              {/* Image Counter */}
              <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium">
                {currentImageIndex + 1}/{car.images.length}
              </div>
            </>
          )}
          
          {/* Brand Badge - Top Left */}
          <div className="absolute top-4 left-4">
            <Badge className="bg-slate-900/90 text-white px-3 py-1.5 text-sm font-semibold backdrop-blur-sm">
              {car.brand}
            </Badge>
          </div>

          {/* Photo Verification Marker */}
          {car.images && car.images.length > 0 && (
            <div className="absolute top-4 left-20">
              <div className="bg-green-500/90 text-white px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm flex items-center gap-1">
                <Camera className="h-3 w-3" />
                <span>Verified Photos</span>
              </div>
            </div>
          )}

          {/* Heart Icon and Category - Top Right */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsFavorited(!isFavorited);
              }}
              className="bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={isFavorited ? `Remove ${car.brand} ${car.model} from favorites` : `Add ${car.brand} ${car.model} to favorites`}
              tabIndex={0}
            >
              <Heart className={`h-4 w-4 ${isFavorited ? 'text-red-500 fill-current' : 'text-gray-700'}`} />
            </button>
            <Badge className="bg-slate-900/90 text-white px-3 py-1.5 text-sm font-semibold backdrop-blur-sm">
              {car.category}
            </Badge>
          </div>

          {/* Availability Status Badge - Bottom Left */}
          <div className="absolute bottom-4 left-4">
            <Badge 
              className={`px-3 py-1.5 text-sm font-semibold backdrop-blur-sm ${
                car.isRented 
                  ? 'bg-red-500/90 text-white' 
                  : 'bg-green-500/90 text-white'
              }`}
            >
              {car.isRented ? 'Rented' : 'Available'}
            </Badge>
          </div>
        </div>

        {/* Content Section - Premium Typography */}
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 leading-tight">
                  {car.brand} {car.model}
                </h3>
                <p className="text-sm text-slate-600 mt-1">{car.year || 'N/A'} • {car.engineCapacity || 'N/A'}</p>
              </div>
            </div>
            
            {/* Credibility Badges */}
            <div className="flex flex-wrap gap-2">
              {car.verified && (
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified Owner
                </Badge>
              )}
              {car.featured && (
                <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                  <Award className="h-3 w-3 mr-1" />
                  Premium Listing
                </Badge>
              )}
              {car.owner && (
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                  <Shield className="h-3 w-3 mr-1" />
                  Trusted Seller
                </Badge>
              )}
            </div>
          </div>

          {/* Primary Specifications */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-sm font-semibold text-slate-900">{car.seating || 'N/A'}</div>
              <div className="text-xs text-slate-500">Seats</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-slate-900">{(car.transmission || 'N/A').slice(0, 4)}</div>
              <div className="text-xs text-slate-500">Trans</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-slate-900">{car.mileage || 'N/A'}</div>
              <div className="text-xs text-slate-500">Mileage</div>
            </div>
          </div>

          {/* Description */}
          {car.description && (
            <div className="text-sm text-slate-600 leading-relaxed">
              <p className="line-clamp-2">
                {car.description}
              </p>
            </div>
          )}

          {/* Key Features */}
          <div className="flex flex-wrap gap-2">
            {(car.features || []).slice(0, 3).map((feature, index) => (
              <Badge key={index} variant="outline" className="text-xs bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 px-3 py-1">
                {feature}
              </Badge>
            ))}
            {car.features && car.features.length > 3 && (
              <Badge variant="outline" className="text-xs bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 px-3 py-1">
                +{car.features.length - 3} more
              </Badge>
            )}
          </div>

          {/* Price and Status */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div>
              <div className="text-xl font-bold text-slate-900">
                PKR {(car.pricePerDay || car.price || 0).toLocaleString()}
                <span className="text-sm text-slate-600 font-normal">/day</span>
              </div>
              <p className="text-xs text-slate-500">{car.location || 'Location not specified'}</p>
            </div>
            
            <div className="text-right">
              <div className={`text-xs font-semibold ${car.isRented ? 'text-red-600' : 'text-green-600'}`}>
                {car.isRented ? 'Rented' : 'Available'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default FeaturedCarCard;
