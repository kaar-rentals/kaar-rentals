import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Car as CarIcon,
  Edit2,
  Eye,
  Loader2,
  MessageCircle,
  Star,
  Upload,
  X,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { apiService, Car } from '@/services/api';
import { normalizeCar } from '@/lib/normalizeCar';

type CarWithMeta = Car & {
  viewCount?: number;
  inquiries?: Array<{
    name?: string;
    phone?: string;
    email?: string;
    message?: string;
    createdAt?: string;
  }>;
};

const OwnerListingsManager = () => {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [cars, setCars] = useState<CarWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const [editCar, setEditCar] = useState<CarWithMeta | null>(null);
  const [editForm, setEditForm] = useState({
    brand: '',
    model: '',
    year: '',
    category: 'Sedan',
    description: '',
    location: '',
    city: '',
    price: '',
    priceType: 'daily',
    engineCapacity: '',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    mileage: '',
    seating: '5',
    features: '',
  });
  const [editImages, setEditImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [expandedInquiries, setExpandedInquiries] = useState<string | null>(null);

  const isPremium =
    user?.membershipPlan === 'premium' ||
    user?.membershipActive ||
    user?.role === 'admin';

  const loadCars = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const list = await apiService.getOwnerCars(token);
      setCars(list as CarWithMeta[]);
    } catch (err) {
      console.error(err);
      toast({
        title: 'Could not load listings',
        description: 'Please refresh or sign in again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    loadCars();
  }, [loadCars]);

  const listingStatus = (car: CarWithMeta) =>
    car.status || (car.isRented ? 'rented' : 'available');

  const handleStatusToggle = async (car: CarWithMeta) => {
    if (!token) return;
    const current = listingStatus(car);
    const next = current === 'rented' ? 'available' : 'rented';
    setStatusUpdating(car._id);
    try {
      const updated = await apiService.updateCarRentalStatus(
        car._id,
        next === 'rented',
        token
      );
      setCars((prev) =>
        prev.map((c) =>
          c._id === car._id ? (normalizeCar(updated as unknown as Record<string, unknown>) as CarWithMeta) : c
        )
      );
      toast({
        title: 'Status updated',
        description: `Listing is now ${next === 'rented' ? 'Rented' : 'Available'}`,
      });
    } catch (err: unknown) {
      toast({
        title: 'Update failed',
        description: err instanceof Error ? err.message : 'Try again',
        variant: 'destructive',
      });
    } finally {
      setStatusUpdating(null);
    }
  };

  const openEdit = (car: CarWithMeta) => {
    setEditCar(car);
    setEditForm({
      brand: car.brand,
      model: car.model,
      year: String(car.year),
      category: car.category,
      description: car.description,
      location: car.location,
      city: car.city,
      price: String(car.pricePerDay || car.price || ''),
      priceType: car.priceType || 'daily',
      engineCapacity: car.engineCapacity,
      fuelType: car.fuelType,
      transmission: car.transmission,
      mileage: car.mileage,
      seating: String(car.seating),
      features: (car.features || []).join(', '),
    });
    setEditImages(car.images || []);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length || !token) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const url = await apiService.uploadImage(file, token);
        urls.push(url);
      }
      setEditImages((prev) => [...prev, ...urls]);
      toast({ title: 'Photos added', description: `${urls.length} image(s) uploaded` });
    } catch {
      toast({ title: 'Upload failed', variant: 'destructive' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSaveEdit = async () => {
    if (!editCar || !token) return;
    setSaving(true);
    try {
      const updated = await apiService.updateCar(
        editCar._id,
        {
          brand: editForm.brand,
          model: editForm.model,
          year: Number(editForm.year),
          category: editForm.category as Car['category'],
          description: editForm.description,
          location: editForm.location,
          city: editForm.city,
          pricePerDay: Number(editForm.price),
          priceType: editForm.priceType as 'daily' | 'monthly',
          engineCapacity: editForm.engineCapacity,
          fuelType: editForm.fuelType,
          transmission: editForm.transmission,
          mileage: editForm.mileage,
          seating: Number(editForm.seating),
          features: editForm.features
            .split(',')
            .map((f) => f.trim())
            .filter(Boolean),
          images: editImages,
        },
        token
      );
      setCars((prev) =>
        prev.map((c) =>
          c._id === editCar._id
            ? (normalizeCar(updated as unknown as Record<string, unknown>) as CarWithMeta)
            : c
        )
      );
      setEditCar(null);
      toast({ title: 'Listing updated', description: 'Your car details were saved.' });
    } catch (err: unknown) {
      toast({
        title: 'Save failed',
        description: err instanceof Error ? err.message : 'Try again',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFeaturedToggle = async (car: CarWithMeta) => {
    if (!token || !isPremium) {
      toast({
        title: 'Premium required',
        description: 'Upgrade to Premium to feature listings.',
        variant: 'destructive',
      });
      return;
    }
    try {
      const updated = await apiService.toggleCarFeatured(car._id, !car.featured, token);
      setCars((prev) =>
        prev.map((c) => (c._id === car._id ? { ...c, featured: updated.featured } : c))
      );
      toast({ title: car.featured ? 'Removed from featured' : 'Marked as featured' });
    } catch (err: unknown) {
      toast({
        title: 'Failed',
        description: err instanceof Error ? err.message : 'Could not update',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-3" />
        <p className="text-muted-foreground text-sm">Loading your listings...</p>
      </div>
    );
  }

  if (cars.length === 0) {
    return (
      <div className="text-center py-10">
        <CarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground mb-4">No listings yet</p>
        <Button asChild>
          <Link to="/list-car">List your first car</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="premium-card p-4 text-center">
          <p className="text-2xl font-bold">{cars.length}</p>
          <p className="text-xs text-muted-foreground">Total listings</p>
        </div>
        <div className="premium-card p-4 text-center">
          <p className="text-2xl font-bold text-green-600">
            {cars.filter((c) => listingStatus(c) === 'available').length}
          </p>
          <p className="text-xs text-muted-foreground">Available</p>
        </div>
        <div className="premium-card p-4 text-center">
          <p className="text-2xl font-bold text-red-600">
            {cars.filter((c) => listingStatus(c) === 'rented').length}
          </p>
          <p className="text-xs text-muted-foreground">Rented</p>
        </div>
        <div className="premium-card p-4 text-center">
          <p className="text-2xl font-bold">
            {cars.reduce((sum, c) => sum + (c.viewCount || 0), 0)}
          </p>
          <p className="text-xs text-muted-foreground">Total views</p>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block overflow-x-auto premium-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="p-4">Vehicle</th>
              <th className="p-4">Price</th>
              <th className="p-4">Views</th>
              <th className="p-4">Inquiries</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cars.map((car) => {
              const status = listingStatus(car);
              const inquiryCount = car.inquiries?.length || 0;
              return (
                <tr key={car._id} className="border-b last:border-0">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={car.images?.[0] || '/placeholder-car.svg'}
                        alt=""
                        className="w-14 h-10 object-cover rounded"
                      />
                      <div>
                        <p className="font-semibold">
                          {car.brand} {car.model} ({car.year})
                        </p>
                        <p className="text-xs text-muted-foreground">{car.city}</p>
                        {car.featured && (
                          <Badge className="mt-1 text-xs bg-accent/20 text-accent-foreground">
                            Featured
                          </Badge>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    PKR {(car.pricePerDay || 0).toLocaleString()}
                    {car.priceType === 'monthly' ? '/mo' : '/day'}
                  </td>
                  <td className="p-4">
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" /> {car.viewCount || 0}
                    </span>
                  </td>
                  <td className="p-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setExpandedInquiries(
                          expandedInquiries === car._id ? null : car._id
                        )
                      }
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {inquiryCount}
                    </Button>
                  </td>
                  <td className="p-4">
                    <Badge
                      className={
                        status === 'rented'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }
                    >
                      {status === 'rented' ? 'Rented' : 'Available'}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(car)}>
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      {isPremium && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFeaturedToggle(car)}
                        >
                          <Star className={`h-3 w-3 ${car.featured ? 'fill-accent text-accent' : ''}`} />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        className={
                          status === 'rented'
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-red-600 hover:bg-red-700'
                        }
                        disabled={statusUpdating === car._id}
                        onClick={() => handleStatusToggle(car)}
                      >
                        {statusUpdating === car._id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : status === 'rented' ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" /> Mark Available
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" /> Mark Rented
                          </>
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden grid gap-4">
        {cars.map((car) => {
          const status = listingStatus(car);
          return (
            <div key={car._id} className="premium-card p-4 space-y-4">
              <div className="flex gap-3">
                <img
                  src={car.images?.[0] || '/placeholder-car.svg'}
                  alt=""
                  className="w-24 h-20 object-cover rounded-lg shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold truncate">
                    {car.brand} {car.model}
                  </h3>
                  <p className="text-sm text-muted-foreground">{car.city}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge
                      className={
                        status === 'rented'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }
                    >
                      {status === 'rented' ? 'Rented' : 'Available'}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Eye className="h-3 w-3" /> {car.viewCount || 0} views
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" /> {car.inquiries?.length || 0}{' '}
                      inquiries
                    </span>
                  </div>
                </div>
              </div>

              <p className="font-semibold">
                PKR {(car.pricePerDay || 0).toLocaleString()}
                {car.priceType === 'monthly' ? '/month' : '/day'}
              </p>

              <Button
                size="lg"
                className={`w-full ${
                  status === 'rented'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
                disabled={statusUpdating === car._id}
                onClick={() => handleStatusToggle(car)}
              >
                {statusUpdating === car._id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : status === 'rented' ? (
                  'Mark as Available'
                ) : (
                  'Mark as Rented'
                )}
              </Button>

              <div className="flex gap-2">
                <Button className="flex-1" variant="outline" onClick={() => openEdit(car)}>
                  <Edit2 className="h-4 w-4 mr-2" /> Edit details
                </Button>
                <Button className="flex-1" variant="outline" asChild>
                  <Link to={`/car/${car._id}`}>View</Link>
                </Button>
              </div>

              {car.inquiries && car.inquiries.length > 0 && (
                <div className="border-t pt-3 space-y-2">
                  <p className="text-sm font-semibold">Recent inquiries</p>
                  {car.inquiries.slice(-3).map((inq, i) => (
                    <div key={i} className="text-xs bg-muted/50 p-2 rounded">
                      <p className="font-medium">{inq.name || 'Guest'}</p>
                      {inq.phone && <p>{inq.phone}</p>}
                      {inq.message && <p className="text-muted-foreground">{inq.message}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Expanded inquiries panel (desktop) */}
      {expandedInquiries && (
        <div className="premium-card p-4">
          <h4 className="font-semibold mb-3">Inquiries</h4>
          {cars
            .find((c) => c._id === expandedInquiries)
            ?.inquiries?.map((inq, i) => (
              <div key={i} className="text-sm border-b py-2 last:border-0">
                <p className="font-medium">{inq.name}</p>
                {inq.phone && <p>Phone: {inq.phone}</p>}
                {inq.email && <p>Email: {inq.email}</p>}
                <p className="text-muted-foreground">{inq.message}</p>
              </div>
            )) || <p className="text-muted-foreground text-sm">No inquiries yet</p>}
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={!!editCar} onOpenChange={(open) => !open && setEditCar(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit listing</DialogTitle>
            <DialogDescription>Update car details, photos, and pricing.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Brand</Label>
                <Input
                  value={editForm.brand}
                  onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                />
              </div>
              <div>
                <Label>Model</Label>
                <Input
                  value={editForm.model}
                  onChange={(e) => setEditForm({ ...editForm, model: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Year</Label>
                <Input
                  type="number"
                  value={editForm.year}
                  onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
                />
              </div>
              <div>
                <Label>City</Label>
                <Input
                  value={editForm.city}
                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Location</Label>
              <Input
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Price (PKR)</Label>
                <Input
                  type="number"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                />
              </div>
              <div>
                <Label>Price type</Label>
                <select
                  className="w-full h-10 border rounded-md px-2 text-sm"
                  value={editForm.priceType}
                  onChange={(e) => setEditForm({ ...editForm, priceType: e.target.value })}
                >
                  <option value="daily">Per day</option>
                  <option value="monthly">Per month</option>
                </select>
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                rows={3}
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              />
            </div>
            <div>
              <Label>Features (comma-separated)</Label>
              <Input
                value={editForm.features}
                onChange={(e) => setEditForm({ ...editForm, features: e.target.value })}
              />
            </div>
            <div>
              <Label>Photos</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {editImages.map((url, idx) => (
                  <div key={idx} className="relative">
                    <img src={url} alt="" className="w-16 h-16 object-cover rounded" />
                    <button
                      type="button"
                      className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-0.5"
                      onClick={() => setEditImages((imgs) => imgs.filter((_, i) => i !== idx))}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <label className="mt-2 inline-flex items-center gap-2 cursor-pointer text-sm text-primary">
                <Upload className="h-4 w-4" />
                {uploading ? 'Uploading...' : 'Add photos'}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  disabled={uploading}
                  onChange={handleImageUpload}
                />
              </label>
            </div>
            <Button className="w-full" onClick={handleSaveEdit} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OwnerListingsManager;
