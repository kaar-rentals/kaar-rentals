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
        {/* Hero Section */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Our <span className="text-gradient">Fleet</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover our handpicked selection of premium vehicles, each offering 
              the perfect blend of luxury, performance, and reliability.
            </p>
          </div>
        </section>

        {/* Filters Section */}
        <section className="py-8 bg-muted/30 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FilterBar onApply={q => { setQuery(q); setPage(1); }} />
          </div>
        </section>

        {/* Results Section */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-semibold">
                {loading ? 'Loading...' : `${cars.length} Vehicle${cars.length !== 1 ? 's' : ''} Available`}
              </h2>
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