import { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ListingCard from '@/components/ListingCard';
import FilterBar from '@/components/FilterBar';
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
        <div style={{ padding: "1rem", maxWidth: "1200px", margin: "0 auto" }}>
          <FilterBar onApply={q => { setQuery(q); setPage(1); }} />
          
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
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "1rem",
                marginTop: "2rem"
              }}>
                {cars.map(c => <ListingCard key={c._id} car={c} isAuthenticated={isAuthenticated} />)}
              </div>
              
              <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "1rem",
                marginTop: "2rem"
              }}>
                <button 
                  disabled={page === 1} 
                  onClick={() => setPage(p => p - 1)}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: page === 1 ? "#e5e7eb" : "#3b82f6",
                    color: page === 1 ? "#9ca3af" : "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: page === 1 ? "not-allowed" : "pointer"
                  }}
                >
                  Prev
                </button>
                <span style={{ fontSize: "1rem", fontWeight: "500" }}>Page {page}</span>
                <button 
                  onClick={() => setPage(p => p + 1)}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer"
                  }}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cars;