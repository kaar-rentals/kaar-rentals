import { useState, useEffect } from 'react';
import { Edit, ToggleLeft, ToggleRight, AlertCircle, CheckCircle, X, TrendingUp, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Car, apiService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

interface MyListedCarsProps {
  userId?: string;
}

const MyListedCars = ({ userId }: MyListedCarsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<{ carId: string; newStatus: boolean } | null>(null);

  useEffect(() => {
    loadMyCars();
    loadPendingListings();
  }, [userId, user]);

  const loadMyCars = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view your listed cars');
        return;
      }

      try {
        // Try to get user's cars from dedicated endpoint
        const myCars = await apiService.getOwnerCars(token);
        setCars(myCars);
      } catch (apiError) {
        console.warn('Owner cars endpoint failed, falling back to filtering all cars:', apiError);
        
        // Fallback: Get all cars and filter by owner
        const allCars = await apiService.getCars();
        const currentUserId = userId || user?.id || user?._id;
        const myCars = allCars.filter((car: Car) => 
          car.owner?._id === currentUserId || 
          car.owner?.id === currentUserId ||
          car.ownerId === currentUserId
        );
        setCars(myCars);
      }
    } catch (err) {
      console.error('Error loading my cars:', err);
      setError('Failed to load your listed cars. Please try again.');
      toast({
        title: "Error",
        description: "Failed to load your listed cars. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPendingListings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const result = await apiService.getPendingListings(token);
      // You can add pending listings to state if needed
      console.log('Pending listings:', result);
    } catch (error) {
      console.error('Error loading pending listings:', error);
    }
  };

  const toggleCarStatus = async (carId: string, newStatus: boolean) => {
    try {
      setUpdating(carId);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to update car status');
        toast({
          title: "Authentication Required",
          description: "Please log in to update car status",
          variant: "destructive",
        });
        return;
      }

      // Optimistic update
      setCars(prevCars => 
        prevCars.map(car => 
          car._id === carId ? { ...car, isRented: newStatus } : car
        )
      );

      // API call to update car status
      await apiService.updateCarRentalStatus(carId, newStatus, token);

      // Show success toast
      toast({
        title: "Status Updated",
        description: `Car has been marked as ${newStatus ? 'rented' : 'available'}`,
        variant: "default",
      });

      // Reload to get updated data from server
      await loadMyCars();
    } catch (err: any) {
      console.error('Error updating car status:', err);
      
      // Show specific error message
      const errorMessage = err.message || 'Failed to update car status. Please try again.';
      setError(errorMessage);
      
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Revert optimistic update
      await loadMyCars();
    } finally {
      setUpdating(null);
      setShowConfirm(null);
    }
  };

  const handleToggleClick = (carId: string, currentStatus: boolean) => {
    setShowConfirm({ carId, newStatus: !currentStatus });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">My Listed Cars</h2>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">My Listed Cars</h2>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={loadMyCars} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Listed Cars</h2>
        <Link to="/list-car">
          <Button>List New Car</Button>
        </Link>
      </div>

      {/* Premium Promotion Banner */}
      <Card className="bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 border-amber-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-amber-900">Boost Your Listings</h3>
                <p className="text-sm text-amber-700">Get 3x more views with Premium promotion</p>
              </div>
            </div>
            <Button 
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
              onClick={() => {
                toast({
                  title: "Premium Promotion",
                  description: "Contact us at premium@kaar-rentals.com to learn about our promotion packages!",
                  variant: "default",
                });
              }}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Learn More
            </Button>
          </div>
        </CardContent>
      </Card>

      {cars.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-500 mb-4">
              <AlertCircle className="h-12 w-12 mx-auto mb-2" />
              <h3 className="text-lg font-semibold mb-2">No cars listed yet</h3>
              <p className="text-sm">Start earning by listing your car for rent</p>
            </div>
            <Link to="/list-car">
              <Button>List Your First Car</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {cars.map((car) => (
            <Card key={car._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {car.brand} {car.model}
                      </h3>
                      <Badge 
                        variant={car.isRented ? "destructive" : "default"}
                        className={car.isRented ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}
                      >
                        {car.isRented ? 'Rented' : 'Available'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {car.year} • {car.category} • PKR {car.pricePerDay?.toLocaleString()}/day
                    </p>
                    <p className="text-xs text-gray-500">{car.location}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Link to={`/car/${car._id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
                    
                    {/* Promote Listing Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 text-amber-700 hover:from-amber-100 hover:to-orange-100 hover:border-amber-300"
                      onClick={() => {
                        toast({
                          title: "Promote Listing",
                          description: "Premium promotion feature coming soon! Contact us to learn more.",
                          variant: "default",
                        });
                      }}
                    >
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Promote
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleClick(car._id, car.isRented || false)}
                      disabled={updating === car._id}
                      className={car.isRented ? "text-red-600 border-red-200 hover:bg-red-50" : "text-green-600 border-green-200 hover:bg-green-50"}
                    >
                      {updating === car._id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                      ) : car.isRented ? (
                        <>
                          <ToggleLeft className="h-4 w-4 mr-1" />
                          Mark Available
                        </>
                      ) : (
                        <>
                          <ToggleRight className="h-4 w-4 mr-1" />
                          Mark Rented
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Confirm Status Change
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Are you sure you want to mark this car as{' '}
                <span className="font-semibold">
                  {showConfirm.newStatus ? 'rented' : 'available'}
                </span>?
              </p>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirm(null)}
                  disabled={updating === showConfirm.carId}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => toggleCarStatus(showConfirm.carId, showConfirm.newStatus)}
                  disabled={updating === showConfirm.carId}
                  className={showConfirm.newStatus ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
                >
                  {updating === showConfirm.carId ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    'Confirm'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MyListedCars;
