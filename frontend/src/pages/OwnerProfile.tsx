import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService, Car } from '@/services/api';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Car as CarIcon, 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign,
  MapPin,
  Calendar,
  Users,
  Fuel,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  Save
} from 'lucide-react';
import { Link } from 'react-router-dom';

const OwnerProfile = () => {
  const { user, token } = useAuth();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState<number>(0);

  useEffect(() => {
    if (user?.role !== 'owner' && user?.role !== 'admin') {
      window.location.href = '/';
      return;
    }
    loadCars();
  }, [user, token]);

  const loadCars = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const carsData = await apiService.getOwnerCars(token);
      setCars(carsData);
    } catch (error) {
      console.error('Error loading cars:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRentalStatus = async (carId: string) => {
    if (!token) return;
    
    try {
      const updatedCar = await apiService.toggleCarRentalStatus(carId, token);
      setCars(prev => prev.map(car => 
        car._id === carId ? updatedCar : car
      ));
    } catch (error) {
      console.error('Error toggling rental status:', error);
    }
  };

  const handleDeleteCar = async (carId: string) => {
    if (!token || !confirm('Are you sure you want to delete this car?')) return;
    
    try {
      await apiService.deleteCar(carId, token);
      setCars(prev => prev.filter(car => car._id !== carId));
    } catch (error) {
      console.error('Error deleting car:', error);
    }
  };

  const handleUpdatePrice = async (carId: string) => {
    if (!token) return;
    
    try {
      const updatedCar = await apiService.updateCarPrice(carId, newPrice, token);
      setCars(prev => prev.map(car => 
        car._id === carId ? updatedCar : car
      ));
      setEditingPrice(null);
      setNewPrice(0);
    } catch (error) {
      console.error('Error updating price:', error);
    }
  };

  const startEditingPrice = (carId: string, currentPrice: number) => {
    setEditingPrice(carId);
    setNewPrice(currentPrice);
  };

  if (user?.role !== 'owner' && user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You need to be a car owner to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your cars...</p>
        </div>
      </div>
    );
  }

  const activeCars = cars.filter(car => car.isActive);
  const rentedCars = cars.filter(car => car.isRented);
  const pendingCars = cars.filter(car => !car.isApproved);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">My Cars</h1>
            <p className="text-muted-foreground">Manage your car listings and rental status</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cars</CardTitle>
                <CarIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cars.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{activeCars.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Currently Rented</CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{rentedCars.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{pendingCars.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Add Car Button */}
          <div className="mb-8">
            <Link to="/list-car">
              <Button className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add New Car
              </Button>
            </Link>
          </div>

          {/* Cars List */}
          {cars.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CarIcon className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No cars listed yet</h3>
                <p className="text-muted-foreground mb-4">Start by adding your first car to the platform</p>
                <Link to="/list-car">
                  <Button>Add Your First Car</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {cars.map((car) => (
                <Card key={car._id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">
                          {car.brand} {car.model} ({car.year})
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {car.location}, {car.city}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        {editingPrice === car._id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={newPrice}
                              onChange={(e) => setNewPrice(Number(e.target.value))}
                              className="w-24"
                              min="0"
                            />
                            <Button
                              size="sm"
                              onClick={() => handleUpdatePrice(car._id)}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingPrice(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div className="text-2xl font-bold text-primary">
                            PKR {car.pricePerDay.toLocaleString()}/day
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => startEditingPrice(car._id, car.pricePerDay)}
                              className="ml-2"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        <div className="flex gap-2 mt-2">
                          <Badge variant={car.isApproved ? 'default' : 'secondary'}>
                            {car.isApproved ? 'Approved' : 'Pending'}
                          </Badge>
                          <Badge variant={car.isRented ? 'destructive' : 'outline'}>
                            {car.isRented ? 'Rented' : 'Available'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Fuel className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Fuel</p>
                          <p className="font-medium">{car.fuelType}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Transmission</p>
                          <p className="font-medium">{car.transmission}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Seating</p>
                          <p className="font-medium">{car.seating} persons</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Mileage</p>
                          <p className="font-medium">{car.mileage}</p>
                        </div>
                      </div>
                    </div>

                    <p className="text-muted-foreground mb-4">{car.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={car.isRented}
                            onCheckedChange={() => handleToggleRentalStatus(car._id)}
                            disabled={!car.isApproved}
                          />
                          <span className="text-sm">
                            {car.isRented ? 'Currently Rented' : 'Available for Rent'}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link to={`/car/${car._id}/details`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </Link>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteCar(car._id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OwnerProfile;

