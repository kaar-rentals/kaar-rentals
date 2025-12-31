import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Car, 
  Users, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Clock,
  Eye,
  UserCheck,
  UserX
} from 'lucide-react';

interface DashboardStats {
  totalCars: number;
  activeCars: number;
  pendingCars: number;
  totalUsers: number;
  totalOwners: number;
  totalBookings: number;
  totalRevenue: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'owner' | 'admin';
  membershipActive: boolean;
  createdAt: string;
}

const Admin = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingCars, setPendingCars] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin') {
      window.location.href = '/';
      return;
    }
    loadData();
  }, [user, token]);

  const loadData = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const [dashboardStats, pendingCarsData, usersData] = await Promise.all([
        apiService.getAdminDashboard(token),
        apiService.getPendingCars(token),
        apiService.getAllUsers(token)
      ]);
      
      setStats(dashboardStats);
      setPendingCars(pendingCarsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveCar = async (carId: string) => {
    if (!token) return;
    
    try {
      await apiService.approveCar(carId, token);
      setPendingCars(prev => prev.filter(car => car._id !== carId));
      if (stats) {
        setStats(prev => prev ? { ...prev, pendingCars: prev.pendingCars - 1, activeCars: prev.activeCars + 1 } : null);
      }
    } catch (error) {
      console.error('Error approving car:', error);
    }
  };

  const handleRejectCar = async (carId: string) => {
    if (!token) return;
    
    try {
      await apiService.rejectCar(carId, token);
      setPendingCars(prev => prev.filter(car => car._id !== carId));
      if (stats) {
        setStats(prev => prev ? { ...prev, pendingCars: prev.pendingCars - 1 } : null);
      }
    } catch (error) {
      console.error('Error rejecting car:', error);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    if (!token) return;
    
    try {
      await apiService.updateUserRole(userId, newRole, token);
      setUsers(prev => prev.map(user => 
        user._id === userId ? { ...user, role: newRole as any } : user
      ));
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your platform and users</p>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Cars</CardTitle>
                  <Car className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalCars}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.activeCars} active, {stats.pendingCars} pending
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalOwners} car owners
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalBookings}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">PKR {stats.totalRevenue.toLocaleString()}</div>
                </CardContent>
              </Card>
            </div>
          )}

          <Tabs defaultValue="pending-cars" className="space-y-6">
            <TabsList>
              <TabsTrigger value="pending-cars">Pending Cars</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
            </TabsList>

            <TabsContent value="pending-cars" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Pending Car Approvals</h2>
                <Badge variant="outline">{pendingCars.length} pending</Badge>
              </div>

              {pendingCars.length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-8">
                    <p className="text-muted-foreground">No pending cars to review</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {pendingCars.map((car) => (
                    <Card key={car._id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-xl">
                              {car.brand} {car.model} ({car.year})
                            </CardTitle>
                            <CardDescription>
                              Listed by {car.owner?.name} • {car.city}
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary">
                              PKR {car.pricePerDay.toLocaleString()}/day
                            </div>
                            <Badge variant="outline">{car.category}</Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Engine</p>
                            <p className="font-medium">{car.engineCapacity}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Fuel</p>
                            <p className="font-medium">{car.fuelType}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Transmission</p>
                            <p className="font-medium">{car.transmission}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Seating</p>
                            <p className="font-medium">{car.seating} persons</p>
                          </div>
                        </div>
                        <p className="text-muted-foreground mb-4">{car.description}</p>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleApproveCar(car._id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button 
                            onClick={() => handleRejectCar(car._id)}
                            variant="destructive"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">User Management</h2>
                <Badge variant="outline">{users.length} total users</Badge>
              </div>

              <div className="grid gap-4">
                {users.map((user) => (
                  <Card key={user._id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{user.name}</h3>
                          <p className="text-muted-foreground">{user.email}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                              {user.role}
                            </Badge>
                            {user.membershipActive && (
                              <Badge variant="outline">Active Member</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {user.role !== 'admin' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateUserRole(user._id, 'owner')}
                                disabled={user.role === 'owner'}
                              >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Make Owner
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateUserRole(user._id, 'user')}
                                disabled={user.role === 'user'}
                              >
                                <UserX className="h-4 w-4 mr-2" />
                                Make User
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;

