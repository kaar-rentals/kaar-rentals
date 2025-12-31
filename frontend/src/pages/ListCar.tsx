import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Car, DollarSign, MapPin, X, Image as ImageIcon, Star, CheckCircle, AlertCircle, Loader2, Settings } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import BrandAutocomplete from '@/components/ui/BrandAutocomplete';
import CityAutocomplete from '@/components/ui/CityAutocomplete';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const ListCar = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [featureAddon, setFeatureAddon] = useState(false);
  const [pricing, setPricing] = useState<{
    isFirstListing: boolean;
    baseListingCost: number;
    featureCost: number;
    totalCost: number;
  } | null>(null);
  
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    category: '',
    year: '',
    price: '',
    engineCapacity: '',
    fuelType: '',
    transmission: '',
    mileage: '',
    seating: '',
    description: '',
    features: [] as string[],
    dealerName: '',
    whatsapp: '',
    location: '',
    email: '',
    phone: '',
    isDealership: false,
    owner_unique_id: '', // Admin-only: unique_id of the car owner
    owner_phone: '' // Admin-only: optional phone to set on owner if missing
  });
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);

  const availableFeatures = [
    'Leather Seats', 'Navigation System', 'Bluetooth', 'Sunroof', 'Heated Seats',
    '4MATIC AWD', 'Premium Audio', 'Panoramic Roof', 'Adaptive Cruise Control',
    'Virtual Cockpit', 'Wireless Charging', 'LED Headlights', 'Safety Sense',
    'Hands-Free Tailgate', 'Tri-Zone Climate Control'
  ];

  // Prefill user data when user is available
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
        phone: user.phone || '',
        whatsapp: user.phone || '',
        dealerName: user.name || ''
      }));
    }
  }, [user]);

  const handleFeatureChange = (feature: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, feature]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        features: prev.features.filter(f => f !== feature)
      }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(file.type);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      setError('Some files were rejected. Please upload only JPG, PNG, or GIF files under 10MB each.');
    }

    // Limit to 10 images total
    const newImages = [...images, ...validFiles].slice(0, 10);
    setImages(newImages);

    // Create previews
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews].slice(0, 10));
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[index]);
    
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Calculate pricing when form data changes
  useEffect(() => {
    const calculatePricing = async () => {
      if (!user || !token) return;
      
      try {
        // For now, we'll calculate client-side based on existing listings
        // In a real implementation, this would be done server-side
        const userCars = await apiService.getOwnerCars(token);
        const isFirstListing = userCars.length === 0;
        const baseListingCost = isFirstListing ? 0 : 100;
        const featureCost = featureAddon ? 200 : 0;
        const totalCost = baseListingCost + featureCost;
        
        setPricing({
          isFirstListing,
          baseListingCost,
          featureCost,
          totalCost
        });
      } catch (error) {
        console.error('Error calculating pricing:', error);
        // Default to paid listing if we can't determine
        setPricing({
          isFirstListing: false,
          baseListingCost: 100,
          featureCost: featureAddon ? 200 : 0,
          totalCost: 100 + (featureAddon ? 200 : 0)
        });
      }
    };

    calculatePricing();
  }, [user, token, featureAddon]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!user || !token) {
      setError('Please log in to list a car');
      setLoading(false);
      return;
    }

    if (!pricing) {
      setError('Please wait while we calculate pricing');
      setLoading(false);
      return;
    }

    try {
      // 1) Upload images via backend
      const uploadedUrls: string[] = [];
      
      if (images.length > 0) {
        try {
          for (const file of images) {
            const formData = new FormData();
            formData.append('image', file);
            
            const uploadResponse = await fetch(`${import.meta.env.VITE_API_URL || 'https://kaar-rentals-backend.onrender.com/api'}/upload`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
              },
              body: formData,
            });
            
            if (!uploadResponse.ok) {
              throw new Error('Failed to upload image');
            }
            
            const uploadData = await uploadResponse.json();
            uploadedUrls.push(uploadData.url || uploadData.imageUrl);
          }
        } catch (uploadError) {
          console.warn('Image upload failed, using placeholder images:', uploadError);
          uploadedUrls.push('/assets/bmw-sedan.jpg', '/assets/mercedes-suv.jpg', '/assets/audi-hatchback.jpg');
        }
      }

      // 2) Prepare listing draft data
      const categoryMapped = (formData.category || '').toLowerCase() === 'suv' ? 'SUV'
        : (formData.category || '').toLowerCase() === 'sedan' ? 'Sedan'
        : (formData.category || '').toLowerCase() === 'hatchback' ? 'Hatchback'
        : formData.category;

      const cityRaw = (formData.location.split(',')[0] || formData.location || '').trim();
      const cityTitle = cityRaw ? cityRaw.charAt(0).toUpperCase() + cityRaw.slice(1).toLowerCase() : '';

      const listingDraft = {
        brand: formData.brand,
        model: formData.model,
        category: categoryMapped,
        year: Number(formData.year),
        pricePerDay: Number(formData.price),
        // Provide safe defaults to satisfy backend ListingDraft schema requirements
        engineCapacity: formData.engineCapacity || '2.0L',
        fuelType: formData.fuelType || 'gasoline',
        transmission: formData.transmission || 'automatic',
        mileage: formData.mileage || 'N/A',
        seating: Math.max(1, Number(formData.seating) || 1),
        description: formData.description,
        features: formData.features,
        location: formData.location,
        city: cityTitle,
        images: uploadedUrls,
      };

      // 3) Check if user is admin - use admin endpoint
      const isAdmin = user?.is_admin || user?.role === 'admin';
      
      if (isAdmin) {
        // Admin can create listings directly
        if (!formData.owner_unique_id) {
          throw new Error('Please provide the owner unique ID');
        }
        
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://kaar-rentals-backend.onrender.com/api';
        const adminListingData = {
          ...listingDraft,
          owner_unique_id: formData.owner_unique_id,
          owner_phone: formData.owner_phone || undefined, // Only send if provided
          featured: featureAddon,
          status: 'available'
        };
        
        const response = await fetch(`${API_BASE_URL}/cars`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(adminListingData),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Failed to create listing' }));
          throw new Error(errorData.message || 'Failed to create listing');
        }
        
        const createdCar = await response.json();
        
        toast({
          title: "Listing Published!",
          description: "Your listing has been published successfully",
          variant: "default",
        });
        
        navigate(`/car/${createdCar._id}`);
      } else {
        // Regular user - use payment flow
        const paymentResult = await apiService.createListingPayment(listingDraft, featureAddon, token);

        if (paymentResult.freeListing) {
          // Free listing - published immediately
          toast({
            title: "Listing Published!",
            description: paymentResult.message,
            variant: "default",
          });
          
          // Navigate to the published car
          navigate(`/car/${paymentResult.carId}`);
        } else {
          // Paid listing - redirect to payment
          toast({
            title: "Redirecting to Payment",
            description: "Please complete payment to publish your listing",
            variant: "default",
          });
          
          // Redirect to Safepay checkout
          window.location.href = paymentResult.checkout_url;
        }
      }
      
    } catch (err: any) {
      console.error('Error submitting car listing:', err);
      setError(err.message || 'Failed to submit car listing');
      
      toast({
        title: "Submission Failed",
        description: err.message || 'Failed to submit car listing',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Check if user is admin
  const isAdminUser = user?.is_admin || user?.role === 'admin';

  // If not admin, show restricted message
  if (!isAdminUser) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-16">
          <section className="py-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-4">Listing Creation Restricted</h1>
              <p className="text-lg text-muted-foreground mb-6">
                Listing creation is restricted to admins. Please contact an administrator if you need to create a listing.
              </p>
              <Button onClick={() => navigate('/')} variant="outline">
                Go to Homepage
              </Button>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary via-primary-dark to-accent py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-bold text-white mb-4">List Your Car (Admin)</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Create a listing on behalf of a car owner
            </p>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <form onSubmit={handleSubmit} className="space-y-12">
              {/* Vehicle Information */}
              <div className="premium-card p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Car className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">Vehicle Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <BrandAutocomplete
                      value={formData.brand}
                      onChange={(value) => setFormData(prev => ({...prev, brand: value}))}
                      placeholder="e.g., BMW, Mercedes-Benz"
                      label="Brand"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model">Model *</Label>
                    <Input 
                      id="model" 
                      placeholder="e.g., 320i, GLC 300"
                      value={formData.model}
                      onChange={(e) => setFormData(prev => ({...prev, model: e.target.value}))}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({...prev, category: value}))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                      <SelectItem value="sedan">Sedan</SelectItem>
                      <SelectItem value="suv">SUV</SelectItem>
                      <SelectItem value="hatchback">Hatchback</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Year *</Label>
                    <Input 
                      id="year" 
                      type="number" 
                      placeholder="2023"
                      value={formData.year}
                      onChange={(e) => setFormData(prev => ({...prev, year: e.target.value}))}
                      required 
                    />
                  </div>
                  {/* Advanced Details Toggle */}
                  <div className="md:col-span-2 mb-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAdvancedFields(!showAdvancedFields)}
                      className="flex items-center gap-2"
                    >
                      {showAdvancedFields ? 'Hide' : 'Show'} Advanced Details
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>

                  {showAdvancedFields && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="engineCapacity">Engine Capacity</Label>
                        <Input 
                          id="engineCapacity" 
                          placeholder="e.g., 2.0L Turbo"
                          value={formData.engineCapacity}
                          onChange={(e) => setFormData(prev => ({...prev, engineCapacity: e.target.value}))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fuelType">Fuel Type</Label>
                        <Select value={formData.fuelType} onValueChange={(value) => setFormData(prev => ({...prev, fuelType: value}))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select fuel type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gasoline">Gasoline</SelectItem>
                            <SelectItem value="diesel">Diesel</SelectItem>
                            <SelectItem value="hybrid">Hybrid</SelectItem>
                            <SelectItem value="electric">Electric</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="transmission">Transmission</Label>
                        <Select value={formData.transmission} onValueChange={(value) => setFormData(prev => ({...prev, transmission: value}))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select transmission" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="automatic">Automatic</SelectItem>
                            <SelectItem value="manual">Manual</SelectItem>
                            <SelectItem value="cvt">CVT</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mileage">Mileage</Label>
                        <Input 
                          id="mileage" 
                          placeholder="e.g., 10 KM/L"
                          value={formData.mileage}
                          onChange={(e) => setFormData(prev => ({...prev, mileage: e.target.value}))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="seating">Seating Capacity</Label>
                        <Input 
                          id="seating" 
                          type="number" 
                          placeholder="5"
                          value={formData.seating}
                          onChange={(e) => setFormData(prev => ({...prev, seating: e.target.value}))}
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-6 space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Describe your vehicle's condition, special features, and any additional information..."
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                    required
                  />
                </div>
              </div>

              {/* Features */}
              <div className="premium-card p-8">
                <h3 className="text-xl font-semibold mb-6">Vehicle Features</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {availableFeatures.map((feature) => (
                    <div key={feature} className="flex items-center space-x-2">
                      <Checkbox 
                        id={feature}
                        checked={formData.features.includes(feature)}
                        onCheckedChange={(checked) => handleFeatureChange(feature, checked as boolean)}
                      />
                      <Label htmlFor={feature} className="text-sm">{feature}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div className="premium-card p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-accent/10 p-2 rounded-lg">
                    <DollarSign className="h-6 w-6 text-accent" />
                  </div>
                  <h2 className="text-2xl font-bold">Pricing</h2>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Daily Rental Price (PKR) *</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    placeholder="30000"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({...prev, price: e.target.value}))}
                    required 
                  />
                  <p className="text-sm text-muted-foreground">
                    Set a competitive daily rate in Pakistani Rupees. We'll help optimize pricing based on market analysis.
                  </p>
                </div>
              </div>

              {/* Dealer Information */}
              <div className="premium-card p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-secondary/10 p-2 rounded-lg">
                    <MapPin className="h-6 w-6 text-secondary" />
                  </div>
                  <h2 className="text-2xl font-bold">Contact Information</h2>
                </div>

                {/* Dealership Checkbox */}
                <div className="mb-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isDealership"
                      checked={formData.isDealership}
                      onCheckedChange={(checked) => setFormData(prev => ({...prev, isDealership: checked as boolean}))}
                    />
                    <Label htmlFor="isDealership" className="text-sm font-medium cursor-pointer">
                      I represent a dealership
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Check this if you're listing on behalf of a dealership
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {formData.isDealership && (
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="dealerName">Dealership Name *</Label>
                      <Input 
                        id="dealerName" 
                        placeholder="Premium Auto Dealership"
                        value={formData.dealerName}
                        onChange={(e) => setFormData(prev => ({...prev, dealerName: e.target.value}))}
                        required={formData.isDealership}
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <CityAutocomplete
                      value={formData.location}
                      onChange={(value) => setFormData(prev => ({...prev, location: value}))}
                      placeholder="Select city"
                      label="Location"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="contact@dealership.com"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      placeholder="0300-1234567"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
                      required 
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="whatsapp">WhatsApp Number *</Label>
                    <Input 
                      id="whatsapp" 
                      type="tel" 
                      placeholder="+92 (300) 765-4321"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData(prev => ({...prev, whatsapp: e.target.value}))}
                      required 
                    />
                  </div>
                </div>
              </div>

              {/* Photo Upload */}
              <div className="premium-card p-8">
                <h3 className="text-xl font-semibold mb-6">Vehicle Photos</h3>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-medium mb-3">Uploaded Photos ({imagePreviews.length}/10)</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Area */}
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="text-lg font-semibold mb-2">Upload Vehicle Photos</h4>
                  <p className="text-muted-foreground mb-4">
                    Add high-quality photos of your vehicle (exterior, interior, engine bay)
                  </p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={triggerFileInput}
                    disabled={images.length >= 10}
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Choose Files
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    Support: JPG, PNG, GIF (Max 10MB each, up to 10 photos)
                  </p>
                  {images.length >= 10 && (
                    <p className="text-sm text-orange-600 mt-2">
                      Maximum 10 photos reached
                    </p>
                  )}
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/gif"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* Admin Only Fields */}
              {(user?.is_admin || user?.role === 'admin') && (
                <div className="premium-card p-8 border-2 border-blue-200 bg-blue-50/50">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-blue-500/10 p-2 rounded-lg">
                      <Settings className="h-6 w-6 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold">Admin Settings</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="owner_unique_id">Owner Unique ID *</Label>
                      <Input 
                        id="owner_unique_id" 
                        placeholder="Enter the owner's unique ID (e.g., abc123xyz)"
                        value={formData.owner_unique_id}
                        onChange={(e) => setFormData(prev => ({...prev, owner_unique_id: e.target.value}))}
                        required 
                      />
                      <p className="text-sm text-muted-foreground">
                        Enter the unique ID of the user who owns this car. The listing will appear on their profile.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="owner_phone">Owner Phone (Optional)</Label>
                      <Input 
                        id="owner_phone" 
                        type="tel"
                        placeholder="+92 300 1234567"
                        value={formData.owner_phone}
                        onChange={(e) => setFormData(prev => ({...prev, owner_phone: e.target.value}))}
                      />
                      <p className="text-sm text-muted-foreground">
                        If the owner doesn't have a phone number set, this will be saved to their profile. Leave empty if owner already has a phone.
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="feature-addon-admin"
                        checked={featureAddon}
                        onCheckedChange={setFeatureAddon}
                      />
                      <Label htmlFor="feature-addon-admin" className="text-gray-700 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-amber-500" />
                          Feature this listing
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Get premium placement and 3x more views
                        </p>
                      </Label>
                    </div>
                  </div>
                </div>
              )}

              {/* Pricing Summary */}
              {pricing && !(user?.is_admin || user?.role === 'admin') && (
                <Card className="border-2 border-blue-200 bg-blue-50/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                      Pricing Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Base Listing Cost */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">
                        {pricing.isFirstListing ? 'First Listing (Free)' : 'Listing Fee'}
                      </span>
                      <span className="font-semibold">
                        PKR {pricing.baseListingCost}
                      </span>
                    </div>

                    {/* Feature Addon */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="feature-addon"
                          checked={featureAddon}
                          onCheckedChange={setFeatureAddon}
                        />
                        <Label htmlFor="feature-addon" className="text-gray-700 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-amber-500" />
                            Feature my car (+PKR 200)
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            Get premium placement and 3x more views
                          </p>
                        </Label>
                      </div>
                      <span className="font-semibold">
                        PKR {pricing.featureCost}
                      </span>
                    </div>

                    {/* Total */}
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">Total</span>
                        <span className="text-2xl font-bold text-blue-600">
                          PKR {pricing.totalCost}
                        </span>
                      </div>
                      {pricing.isFirstListing && (
                        <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          Your first listing is free!
                        </p>
                      )}
                      {pricing.totalCost > 0 && (
                        <p className="text-sm text-gray-500 mt-2">
                          Payment required to publish listing
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Submit */}
              <div className="text-center">
                <Button 
                  type="submit" 
                  size="lg"
                  className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary px-12"
                  disabled={loading || !pricing}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {pricing?.totalCost === 0 ? 'Publishing...' : 'Creating Payment...'}
                    </>
                  ) : (
                    pricing?.totalCost === 0 ? 'Publish Free Listing' : 'Proceed to Payment'
                  )}
                </Button>
                <p className="text-sm text-muted-foreground mt-4">
                  {pricing?.totalCost === 0 
                    ? 'Your listing will be published immediately for free!'
                    : 'Complete payment to publish your listing instantly.'
                  }
                </p>
              </div>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ListCar;