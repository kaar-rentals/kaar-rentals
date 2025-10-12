import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService, Car } from '@/services/api';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MyListedCars from '@/components/MyListedCars';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Car as CarIcon, 
  DollarSign,
  MapPin,
  Calendar,
  Users,
  Fuel,
  Settings,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

const OwnerProfile = () => {
  const { user } = useAuth();

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
                <div className="text-2xl font-bold">-</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">-</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Currently Rented</CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">-</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">-</div>
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

          {/* My Listed Cars Component */}
          <MyListedCars userId={user?.id || user?._id} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OwnerProfile;

