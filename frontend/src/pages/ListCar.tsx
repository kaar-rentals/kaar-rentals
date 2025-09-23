import { useState } from 'react';
import { Upload, Car, DollarSign, MapPin } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

const ListCar = () => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Listing submission:', formData);
    alert('Car listing submitted successfully! We will review and contact you soon.');
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
                         <SelectItem value="Truck">Truck</SelectItem>
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
                    placeholder="2000"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({...prev, price: e.target.value}))}
                    required 
                  />
                  <p className="text-sm text-muted-foreground">
                    Set a competitive daily rate. We'll help optimize pricing based on market analysis.
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
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="text-lg font-semibold mb-2">Upload Vehicle Photos</h4>
                  <p className="text-muted-foreground mb-4">
                    Add high-quality photos of your vehicle (exterior, interior, engine bay)
                  </p>
                  <Button variant="outline">Choose Files</Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    Support: JPG, PNG (Max 10MB each, up to 10 photos)
                  </p>
                </div>
              </div>

              {/* Submit */}
              <div className="text-center">
                <Button 
                  type="submit" 
                  size="lg"
                  className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary px-12"
                >
                  Submit Listing
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