import { Heart, ChevronLeft, ChevronRight, Shield, Crown, CheckCircle, Camera, Award, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Car } from '@/services/api';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useFavorites } from '@/contexts/FavoritesContext';

interface FeaturedCarCardProps {
  car: Car;
  variant?: 'grid' | 'list';
}

const FeaturedCarCard = ({ car, variant = 'grid' }: FeaturedCarCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const carId = String(car._id || car.id);
  const { isLiked, toggleLike } = useFavorites();
  const isFavorited = isLiked(carId);

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
    return car.image || '/placeholder-car.svg';
  };

  const isList = variant === 'list';
  const showViewCount = car.viewCount !== undefined;

  return (
    <Link
      to={`/car/${car._id || car.id}/details`}
      className="block group"
      aria-label={`View details for ${car.brand} ${car.model} - ${car.year} ${car.category}`}
    >
      <div
        className={cn(
          'bg-card text-card-foreground rounded-xl shadow-sm border group-hover:shadow-2xl transition-all duration-200 ease-out relative dark:bg-zinc-900 dark:border-zinc-800 dark:shadow-zinc-950/50',
          isList
            ? 'flex flex-col sm:flex-row overflow-hidden group-hover:scale-[1.01]'
            : 'overflow-hidden group-hover:scale-[1.02] group-hover:-translate-y-1',
          car.featured
            ? 'border-amber-200 ring-1 ring-amber-100 dark:border-amber-800/60 dark:ring-amber-900/40'
            : 'border-border'
        )}
      >
        <div className="absolute top-0 right-0 z-10 flex flex-col items-end gap-1">
          {(car.status === 'rented' || car.isRented) && (
            <div className="bg-red-600 text-white px-3 py-1 text-xs font-semibold rounded-bl-lg shadow-lg">
              Rented
            </div>
          )}
          {car.featured && (
            <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-white px-3 py-1 text-xs font-semibold rounded-bl-lg shadow-lg">
              <Crown className="h-3 w-3 inline mr-1" />
              Featured
            </div>
          )}
        </div>

        <div
          className={cn(
            'relative overflow-hidden bg-muted dark:bg-zinc-800',
            isList
              ? 'aspect-[16/9] sm:aspect-auto sm:w-72 md:w-80 flex-shrink-0 sm:min-h-[220px]'
              : 'aspect-[16/9]'
          )}
        >
          <img
            src={getCurrentImage()}
            alt={`${car.brand} ${car.model} ${car.year} - ${car.category} car for rent`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            role="img"
          />

          {car.images && car.images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-card/90 hover:bg-card dark:bg-zinc-900/90 dark:hover:bg-zinc-800 rounded-full p-2.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 shadow-lg focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label={`Previous image of ${car.brand} ${car.model}`}
                tabIndex={0}
              >
                <ChevronLeft className="h-4 w-4 text-foreground" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-card/90 hover:bg-card dark:bg-zinc-900/90 dark:hover:bg-zinc-800 rounded-full p-2.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 shadow-lg focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label={`Next image of ${car.brand} ${car.model}`}
                tabIndex={0}
              >
                <ChevronRight className="h-4 w-4 text-foreground" />
              </button>

              <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium">
                {currentImageIndex + 1}/{car.images.length}
              </div>
            </>
          )}

          <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
            <Badge className="bg-slate-900/90 text-white px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-semibold backdrop-blur-sm dark:bg-zinc-950/90">
              {car.brand}
            </Badge>
          </div>

          {car.images && car.images.length > 0 && (
            <div className="absolute top-3 left-[4.5rem] sm:top-4 sm:left-20 hidden sm:block">
              <div className="bg-green-500/90 text-white px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm flex items-center gap-1">
                <Camera className="h-3 w-3" />
                <span className="hidden sm:inline">Verified Photos</span>
              </div>
            </div>
          )}

          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void toggleLike(carId);
              }}
              className="bg-card/90 backdrop-blur-sm dark:bg-zinc-900/90 rounded-full p-2.5 hover:bg-card dark:hover:bg-zinc-800 transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label={
                isFavorited
                  ? `Remove ${car.brand} ${car.model} from favorites`
                  : `Add ${car.brand} ${car.model} to favorites`
              }
              tabIndex={0}
            >
              <Heart
                className={`h-4 w-4 ${isFavorited ? 'text-red-500 fill-current' : 'text-muted-foreground'}`}
              />
            </button>
            <Badge className="hidden sm:inline-flex bg-slate-900/90 text-white px-3 py-1.5 text-sm font-semibold backdrop-blur-sm dark:bg-zinc-950/90">
              {car.category}
            </Badge>
          </div>

          <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4">
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

        <div className={cn('space-y-4', isList ? 'flex-1 p-5 sm:p-6' : 'p-6')}>
          <div className={cn('space-y-3', isList && 'sm:flex sm:items-start sm:justify-between sm:gap-6')}>
            <div className="space-y-3 flex-1">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-foreground leading-tight">
                    {car.brand} {car.model}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {car.year || 'N/A'} • {car.engineCapacity || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
              {car.verified && (
                <Badge
                  variant="outline"
                  className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-400 dark:border-green-800"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified Owner
                </Badge>
              )}
              {car.featured && (
                <Badge
                  variant="outline"
                  className="text-xs bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800"
                >
                  <Award className="h-3 w-3 mr-1" />
                  Premium Listing
                </Badge>
              )}
              {car.owner && (
                <Badge
                  variant="outline"
                  className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800"
                >
                  <Shield className="h-3 w-3 mr-1" />
                  Trusted Seller
                </Badge>
              )}
            </div>
            </div>

            {isList && (
              <div className="sm:text-right sm:flex-shrink-0">
                <div className="text-xl font-bold text-foreground">
                  PKR {(car.pricePerDay || car.price || 0).toLocaleString()}
                  <span className="text-sm text-muted-foreground font-normal">/day</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {car.location || 'Location not specified'}
                </p>
              </div>
            )}
          </div>

          <div className={cn('grid gap-2', isList ? 'grid-cols-2 sm:grid-cols-4' : showViewCount ? 'grid-cols-4' : 'grid-cols-3')}>
            <div className="text-center">
              <div className="text-sm font-semibold text-foreground">{car.seating || 'N/A'}</div>
              <div className="text-xs text-muted-foreground">Seats</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-foreground">
                {(car.transmission || 'N/A').slice(0, 4)}
              </div>
              <div className="text-xs text-muted-foreground">Trans</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-foreground">{car.mileage || 'N/A'}</div>
              <div className="text-xs text-muted-foreground">Mileage</div>
            </div>
            {showViewCount && (
            <div className="text-center">
              <div className="text-sm font-semibold text-foreground flex items-center justify-center gap-0.5">
                <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                {car.viewCount!.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Views</div>
            </div>
            )}
          </div>

          {car.description && (
            <div className="text-sm text-muted-foreground leading-relaxed">
              <p className="line-clamp-2">{car.description}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {(car.features || []).slice(0, 3).map((feature, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs bg-muted text-foreground border-border hover:bg-muted/80 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700 dark:hover:bg-zinc-700 px-3 py-1"
              >
                {feature}
              </Badge>
            ))}
            {car.features && car.features.length > 3 && (
              <Badge
                variant="outline"
                className="text-xs bg-muted text-foreground border-border hover:bg-muted/80 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700 dark:hover:bg-zinc-700 px-3 py-1"
              >
                +{car.features.length - 3} more
              </Badge>
            )}
          </div>

          {!isList && (
          <div className="flex items-center justify-between pt-3 border-t border-border dark:border-zinc-800">
            <div>
              <div className="text-xl font-bold text-foreground">
                PKR {(car.pricePerDay || car.price || 0).toLocaleString()}
                <span className="text-sm text-muted-foreground font-normal">/day</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {car.location || 'Location not specified'}
              </p>
            </div>

            <div className="text-right">
              <div
                className={`text-xs font-semibold ${
                  car.isRented ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                }`}
              >
                {car.isRented ? 'Rented' : 'Available'}
              </div>
            </div>
          </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default FeaturedCarCard;
