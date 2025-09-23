import { useState } from 'react';
import { Search, Filter, Grid, List } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CarCard from '@/components/cars/CarCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cars } from '@/data/cars';

const Cars = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredCars = cars.filter(car => {
    const matchesSearch = car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         car.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || car.category.toLowerCase() === selectedCategory;
    const matchesPrice = priceRange === 'all' || 
                        (priceRange === 'budget' && car.price < 250) ||
                        (priceRange === 'mid' && car.price >= 250 && car.price < 350) ||
                        (priceRange === 'luxury' && car.price >= 350);
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary via-primary-dark to-accent py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-bold text-white mb-4">Our Fleet</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Explore our extensive collection of premium vehicles
            </p>
          </div>
        </section>

        {/* Filters Section */}
        <section className="py-8 bg-muted/30 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by brand or model..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-4 items-center">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="sedan">Sedans</SelectItem>
                    <SelectItem value="suv">SUVs</SelectItem>
                    <SelectItem value="hatchback">Hatchbacks</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Price Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="budget">Under $250</SelectItem>
                    <SelectItem value="mid">$250 - $350</SelectItem>
                    <SelectItem value="luxury">$350+</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Toggle */}
                <div className="flex border border-border rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none border-l border-border"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            <div className="flex gap-2 mt-4">
              {selectedCategory !== 'all' && (
                <Badge variant="secondary" className="capitalize">
                  {selectedCategory}
                  <button 
                    onClick={() => setSelectedCategory('all')}
                    className="ml-2 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {priceRange !== 'all' && (
                <Badge variant="secondary">
                  {priceRange === 'budget' ? 'Under $250' : 
                   priceRange === 'mid' ? '$250-$350' : '$350+'}
                  <button 
                    onClick={() => setPriceRange('all')}
                    className="ml-2 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
          </div>
        </section>

        {/* Results Section */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-semibold">
                {filteredCars.length} Vehicle{filteredCars.length !== 1 ? 's' : ''} Available
              </h2>
            </div>

            {filteredCars.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-muted-foreground mb-4">
                  <Filter className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-xl font-semibold mb-2">No vehicles found</h3>
                  <p>Try adjusting your search criteria or filters</p>
                </div>
                <Button onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setPriceRange('all');
                }}>
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <div className={`grid gap-8 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {filteredCars.map((car) => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Cars;