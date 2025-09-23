import { Shield, Award, Users, MapPin } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const About = () => {
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

  const stats = [
    { number: '10,000+', label: 'Happy Customers' },
    { number: '500+', label: 'Premium Vehicles' },
    { number: '50+', label: 'Locations' },
    { number: '15+', label: 'Years Experience' }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary via-primary-dark to-accent py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-bold text-white mb-4">About LuxeRide</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Pioneering premium car rental experiences since 2008
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
                  Founded in 2008, LuxeRide began with a simple vision: to make luxury car rentals 
                  accessible, reliable, and exceptional. What started as a small collection of premium 
                  vehicles has grown into one of the most trusted names in automotive rental services.
                </p>
                <p className="text-lg text-muted-foreground">
                  Today, we proudly serve thousands of customers worldwide, offering an extensive 
                  fleet of meticulously maintained vehicles from the world's most prestigious brands. 
                  Our commitment to excellence has earned us industry recognition and, more importantly, 
                  the trust of our valued customers.
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">{stat.number}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              ))}
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