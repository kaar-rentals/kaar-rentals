import { ArrowRight, Star, Users, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import heroBg from '@/assets/hero-bg.jpg';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-white space-y-8 fade-in">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                Drive Your
                <span className="block text-accent">Dreams</span>
              </h1>
              <p className="text-xl text-white/90 max-w-lg">
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
                  className="border-white text-white hover:bg-white hover:text-primary font-semibold px-8 py-4 text-lg"
                >
                  List Your Car
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-accent/20 rounded-full mb-2 mx-auto">
                  <Car className="h-6 w-6 text-accent" />
                </div>
                <div className="text-2xl font-bold">500+</div>
                <div className="text-sm text-white/80">Premium Cars</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-accent/20 rounded-full mb-2 mx-auto">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <div className="text-2xl font-bold">10K+</div>
                <div className="text-sm text-white/80">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-accent/20 rounded-full mb-2 mx-auto">
                  <Star className="h-6 w-6 text-accent" />
                </div>
                <div className="text-2xl font-bold">4.9</div>
                <div className="text-sm text-white/80">Rating</div>
              </div>
            </div>
          </div>

          {/* Right side - Optional feature showcase */}
          <div className="hidden lg:block slide-up">
            <div className="relative">
              <div className="premium-card p-6 bg-white/10 backdrop-blur-sm border-white/20">
                <h3 className="text-white text-xl font-semibold mb-4">Why Choose LuxeRide?</h3>
                <ul className="space-y-3 text-white/90">
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
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;