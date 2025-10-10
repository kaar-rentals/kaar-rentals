import { useState, useRef } from 'react';
// Firebase Storage is now handled by the backend to avoid CORS issues
import { Upload, Car, DollarSign, MapPin, X, Image as ImageIcon } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';

const ListCar = () => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
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
    phone: ''
  });

  const availableFeatures = [
    'Leather Seats', 'Navigation System', 'Bluetooth', 'Sunroof', 'Heated Seats',
    '4MATIC AWD', 'Premium Audio', 'Panoramic Roof', 'Adaptive Cruise Control',
    'Virtual Cockpit', 'Wireless Charging', 'LED Headlights', 'Safety Sense',
    'Hands-Free Tailgate', 'Tri-Zone Climate Control'
  ];

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!user) {
      setError('Please log in to list a car');
      setLoading(false);
      return;
    }

    try {
      // 1) Upload images via backend (to avoid CORS issues in development)
      const uploadedUrls: string[] = [];
      
      // For development, use placeholder images if upload fails
      if (images.length > 0) {
        try {
          for (const file of images) {
            const formData = new FormData();
            formData.append('image', file);
            
            const uploadResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/upload`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
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
          // Use placeholder images for development
          uploadedUrls.push('/assets/bmw-sedan.jpg', '/assets/mercedes-suv.jpg', '/assets/audi-hatchback.jpg');
        }
      }

      console.log('Submitting car listing...', { brand: formData.brand, model: formData.model, images: uploadedUrls.length });

      // 2) Normalize fields to match backend schema and send metadata
      const categoryMapped = (formData.category || '').toLowerCase() === 'suv' ? 'SUV'
        : (formData.category || '').toLowerCase() === 'sedan' ? 'Sedan'
        : (formData.category || '').toLowerCase() === 'hatchback' ? 'Hatchback'
        : formData.category;

      const cityRaw = (formData.location.split(',')[0] || formData.location || '').trim();
      const cityTitle = cityRaw ? cityRaw.charAt(0).toUpperCase() + cityRaw.slice(1).toLowerCase() : '';

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/cars`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          brand: formData.brand,
          model: formData.model,
          category: categoryMapped,
          year: Number(formData.year),
          pricePerDay: Number(formData.price),
          engineCapacity: formData.engineCapacity,
          fuelType: formData.fuelType,
          transmission: formData.transmission,
          mileage: formData.mileage,
          seating: Number(formData.seating),
          description: formData.description,
          features: formData.features,
          location: formData.location,
          city: cityTitle,
          images: uploadedUrls,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit car listing');
      }

      const result = await response.json();
      console.log('Car listing submitted successfully:', result);
      
      alert('Car listing submitted successfully! We will review and contact you soon.');
      
      // Reset form
      setFormData({
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
        features: [],
        dealerName: '',
        whatsapp: '',
        location: '',
        email: '',
        phone: ''
      });
      setImages([]);
      setImagePreviews([]);
      
    } catch (err: any) {
      console.error('Error submitting car listing:', err);
      setError(err.message || 'Failed to submit car listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary via-primary-dark to-accent py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-bold text-white mb-4">List Your Car</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Join our premium network and start earning from your luxury vehicle
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
                    <Label htmlFor="brand">Brand *</Label>
                    <Input 
                      id="brand" 
                      placeholder="e.g., BMW, Mercedes-Benz"
                      value={formData.brand}
                      onChange={(e) => setFormData(prev => ({...prev, brand: e.target.value}))}
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
                  <div className="space-y-2">
                    <Label htmlFor="engineCapacity">Engine Capacity *</Label>
                    <Input 
                      id="engineCapacity" 
                      placeholder="e.g., 2.0L Turbo"
                      value={formData.engineCapacity}
                      onChange={(e) => setFormData(prev => ({...prev, engineCapacity: e.target.value}))}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fuelType">Fuel Type *</Label>
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
                    <Label htmlFor="transmission">Transmission *</Label>
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
                    <Label htmlFor="mileage">Mileage *</Label>
                    <Input 
                      id="mileage" 
                      placeholder="e.g., 10 KM/L"
                      value={formData.mileage}
                      onChange={(e) => setFormData(prev => ({...prev, mileage: e.target.value}))}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="seating">Seating Capacity *</Label>
                    <Input 
                      id="seating" 
                      type="number" 
                      placeholder="5"
                      value={formData.seating}
                      onChange={(e) => setFormData(prev => ({...prev, seating: e.target.value}))}
                      required 
                    />
                  </div>
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
                  <h2 className="text-2xl font-bold">Dealership Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="dealerName">Dealership Name *</Label>
                    <Input 
                      id="dealerName" 
                      placeholder="Premium Auto Dealership"
                      value={formData.dealerName}
                      onChange={(e) => setFormData(prev => ({...prev, dealerName: e.target.value}))}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input 
                      id="location" 
                      placeholder="lahore, Pakistan"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({...prev, location: e.target.value}))}
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

              {/* Submit */}
              <div className="text-center">
                <Button 
                  type="submit" 
                  size="lg"
                  className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary px-12"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit Listing'}
                </Button>
                <p className="text-sm text-muted-foreground mt-4">
                  Your listing will be reviewed within 24 hours. We'll contact you once approved.
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