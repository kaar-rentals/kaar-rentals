import { useEffect, useState, useRef } from 'react';
import { Shield, Award, Users, MapPin } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';

const About = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    users_count: 0,
    listings_count: 0,
    featured_count: 0
  });
  const [hasAnimated, setHasAnimated] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch stats from API
    const fetchStats = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://kaar-rentals-backend.onrender.com/api';
        const response = await fetch(`${API_BASE_URL}/stats`);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  // Count-up animation function
  const animateCount = (el: HTMLElement, target: number) => {
    let start = 0;
    const duration = 1200; // ms
    const startTime = performance.now();

    function frame(now: number) {
      const progress = Math.min((now - startTime) / duration, 1);
      el.textContent = Math.floor(progress * target).toString();
      if (progress < 1) {
        requestAnimationFrame(frame);
      }
    }
    requestAnimationFrame(frame);
  };

  // Intersection Observer for animation trigger
  useEffect(() => {
    if (hasAnimated || !statsRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            
            // Animate each counter
            const counters = entry.target.querySelectorAll('[data-counter]');
            counters.forEach((counter, index) => {
              const target = index === 0 ? stats.users_count : 
                           index === 1 ? stats.listings_count : 
                           stats.featured_count;
              animateCount(counter as HTMLElement, target);
            });
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(statsRef.current);

    return () => observer.disconnect();
  }, [stats, hasAnimated]);

  const values = [
    {
      icon: Shield,
      title: 'Trust & Safety',
      description: 'Your safety is our priority. All vehicles undergo rigorous inspection and maintenance.'
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'We strive for excellence in every aspect of our service, from vehicles to customer experience.'
    },
    {
      icon: Users,
      title: 'Customer First',
      description: 'Our customers are at the heart of everything we do. Your satisfaction is our success.'
    },
    {
      icon: MapPin,
      title: 'Accessibility',
      description: 'Wide network of locations and flexible pickup/drop-off options for your convenience.'
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary via-primary-dark to-accent py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-bold text-white mb-4">About Kaar.Rentals</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Reliable Rides Anytime
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-4xl font-bold text-foreground">
                  Our <span className="text-gradient">Story</span>
                </h2>
                <p className="text-lg text-muted-foreground">
                At Kaar Rentals, we make car hiring simple, reliable, and affordable. Whether you need a vehicle for a business trip, a weekend getaway, or daily use, we offer a wide range of well-maintained cars to suit your needs.
                </p>
                <p className="text-lg text-muted-foreground">
                Our goal is to provide a seamless rental experience with transparent pricing, flexible options, and 24/7 customer support. From economy rides to premium vehicles, every car is carefully inspected to ensure comfort and safety.
                </p>
                <p className="text-lg text-muted-foreground">
                  With easy online booking, quick confirmations, and doorstep delivery options, we’re redefining convenience in car rentals.
                </p>
              </div>
              <div className="premium-card p-8">
                <h3 className="text-2xl font-semibold mb-6">Our Mission</h3>
                <p className="text-muted-foreground mb-6">
                  To provide unparalleled automotive experiences that exceed expectations, 
                  combining luxury, reliability, and exceptional service in every interaction.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span>Premium vehicle selection</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span>Exceptional customer service</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span>Transparent and fair pricing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                By the <span className="text-gradient">Numbers</span>
              </h2>
            </div>
            <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2" data-counter>
                  {hasAnimated ? stats.users_count : 0}
                </div>
                <div className="text-muted-foreground">Users</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2" data-counter>
                  {hasAnimated ? stats.listings_count : 0}
                </div>
                <div className="text-muted-foreground">Listings</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2" data-counter>
                  {hasAnimated ? stats.featured_count : 0}
                </div>
                <div className="text-muted-foreground">Featured</div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Our <span className="text-gradient">Values</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                The principles that guide everything we do
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => {
                const IconComponent = value.icon;
                return (
                  <div key={index} className="premium-card p-6 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-primary to-accent mb-4">
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;