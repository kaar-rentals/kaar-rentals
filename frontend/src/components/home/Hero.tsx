import { useEffect, useState } from 'react';
import { ArrowRight, Star, Users, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { apiUrl } from '@/lib/apiBase';
import heroBg from '@/assets/hero-bg.jpg';

const StatIcon = ({ children }: { children: React.ReactNode }) => (
  <div className="home-stat-icon flex items-center justify-center w-12 h-12 rounded-full mb-2 mx-auto bg-zinc-500/90 dark:bg-zinc-700/80 border border-accent/50 shadow-sm">
    {children}
  </div>
);

const Hero = () => {
  const [carCount, setCarCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    // All approved public listings (not featured-only)
    fetch(apiUrl('/api/cars?limit=1'))
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!cancelled) {
          setCarCount(typeof json?.total === 'number' ? json.total : 0);
        }
      })
      .catch(() => {
        if (!cancelled) setCarCount(0);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const carCountLabel =
    carCount === null ? '…' : carCount > 0 ? `${carCount}+` : '0';

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/70 to-transparent dark:from-background/95 dark:via-background/85 dark:to-background/50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-foreground space-y-8 fade-in">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                Drive Your
                <span className="block text-accent">Dreams</span>
              </h1>
              <p className="text-xl text-foreground/80 max-w-lg">
                Experience luxury car rental like never before. Premium vehicles, exceptional service, unbeatable prices.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/cars">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-4 text-lg">
                  Browse Cars
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/list-car">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-foreground text-foreground hover:bg-foreground hover:text-background dark:border-accent dark:text-accent dark:hover:bg-accent dark:hover:text-accent-foreground font-semibold px-8 py-4 text-lg"
                >
                  List Your Car
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8">
              <div className="text-center">
                <StatIcon>
                  <Car className="h-6 w-6 text-accent" />
                </StatIcon>
                <div className="text-2xl font-bold text-foreground">{carCountLabel}</div>
                <div className="text-sm text-foreground/70">Available Cars</div>
              </div>
              <div className="text-center">
                <StatIcon>
                  <Users className="h-6 w-6 text-accent" />
                </StatIcon>
                <div className="text-2xl font-bold text-foreground">1K+</div>
                <div className="text-sm text-foreground/70">Happy Customers</div>
              </div>
              <div className="text-center">
                <StatIcon>
                  <Star className="h-6 w-6 text-accent fill-accent" />
                </StatIcon>
                <div className="text-2xl font-bold text-foreground">4.9</div>
                <div className="text-sm text-foreground/70">Rating</div>
              </div>
            </div>
          </div>

          {/* Right side - Optional feature showcase */}
          <div className="hidden lg:block slide-up">
            <div className="relative">
              <div className="premium-card p-6 bg-background/90 backdrop-blur-sm border-border">
                <h3 className="text-foreground text-xl font-semibold mb-4">Why Choose Kaar.Rentals?</h3>
                <ul className="space-y-3 text-foreground/80">
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span>Premium luxury vehicles</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span>24/7 customer support</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span>Flexible rental periods</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span>Competitive pricing</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-foreground dark:text-accent animate-bounce">
        <div className="w-6 h-10 border-2 border-foreground/30 dark:border-accent/40 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-foreground/60 dark:bg-accent/70 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;