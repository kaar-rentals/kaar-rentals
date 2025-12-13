import { useState, useEffect } from 'react';
import { Filter, ArrowRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FeaturedCarCard from '@/components/cars/FeaturedCarCard';
import FilterBar from '@/components/FilterBar';
import { Button } from '@/components/ui/button';
import { Car } from '@/services/api';

const Cars = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState({});
  const [page, setPage] = useState(1);
  const token = localStorage.getItem("token");
  const isAuthenticated = !!token;

  useEffect(() => {
    loadCars();
  }, [query, page, token]);

  const loadCars = async () => {
    try {
      setLoading(true);
      const qs = new URLSearchParams({ ...query, page, limit: 12 }).toString();
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`${import.meta.env.VITE_API_URL}/cars?${qs}`, { headers });
      const json = await res.json();
      setCars(json.cars || []);
    } catch (error) {
      console.error('Error loading cars:', error);
      setCars([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
            {/* Hero Section - Premium Styling */}
            <section className="relative py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
              
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
                <div className="mb-6">
                  <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-4">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                    Premium Fleet Collection
                  </span>
                </div>
                
                <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                  Discover Your
                  <span className="block bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent">
                    Perfect Ride
                  </span>
                </h1>
                
                <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-8">
                  Handpicked premium vehicles from verified owners. Each car is carefully selected 
                  for quality, performance, and reliability to ensure an exceptional rental experience.
                </p>
                
                {/* Trust Indicators */}
                <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    </div>
                    <span>Verified Owners</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    </div>
                    <span>Premium Quality</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-accent-light rounded-full flex items-center justify-center">
                      <span className="w-2 h-2 bg-accent rounded-full"></span>
                    </div>
                    <span>24/7 Support</span>
                  </div>
                </div>
              </div>
            </section>

        {/* Filters Section - Minimal Design */}
        <section className="py-6 bg-white/80 backdrop-blur-sm border-b border-slate-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FilterBar onApply={q => { setQuery(q); setPage(1); }} />
          </div>
        </section>

        {/* Results Section - Photography Focus */}
        <section className="py-16 bg-gradient-to-b from-white to-slate-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">
                  {loading ? 'Discovering Premium Vehicles...' : `${cars.length} Premium Vehicle${cars.length !== 1 ? 's' : ''}`}
                </h2>
                <p className="text-slate-600">
                  {loading ? 'Please wait while we load our curated collection' : 'Carefully selected for quality and performance'}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading cars...</p>
              </div>
            ) : cars.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-muted-foreground mb-4">
                  <Filter className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-xl font-semibold mb-2">No vehicles found</h3>
                  <p>Try adjusting your search criteria or filters</p>
                </div>
              </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                      {cars
                        .sort((a, b) => {
                          // Sort featured cars to the top
                          if (a.featured && !b.featured) return -1;
                          if (!a.featured && b.featured) return 1;
                          return 0;
                        })
                        .map((car) => (
                          <FeaturedCarCard key={car._id} car={car} />
                        ))}
                    </div>
                
                {/* Pagination */}
                <div className="flex justify-center items-center gap-4">
                  <Button 
                    disabled={page === 1} 
                    onClick={() => setPage(p => p - 1)}
                    variant="outline"
                  >
                    Previous
                  </Button>
                  <span className="text-sm font-medium">Page {page}</span>
                  <Button 
                    onClick={() => setPage(p => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Cars;