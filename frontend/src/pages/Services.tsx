import { Clock, Shield, Star, Headphones, MapPin, CreditCard } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';

const Services = () => {
  const services = [
    {
      icon: Clock,
      title: '24/7 Availability',
      description: 'Round-the-clock service for pickups, drop-offs, and customer support.',
      features: ['Instant booking confirmation', 'Flexible pickup times', 'Emergency assistance']
    },
    {
      icon: Shield,
      title: 'Comprehensive Insurance',
      description: 'Full coverage protection for peace of mind during your rental period.',
      features: ['Collision damage waiver', 'Theft protection', 'Third-party liability']
    },
    {
      icon: Star,
      title: 'Premium Maintenance',
      description: 'All vehicles undergo rigorous maintenance and quality checks.',
      features: ['Regular service intervals', 'Professional detailing', 'Safety inspections']
    },
    {
      icon: Headphones,
      title: 'Dedicated Support',
      description: 'Expert customer service team ready to assist with any questions.',
      features: ['Live chat support', 'Phone assistance', 'On-site help']
    },
    {
      icon: MapPin,
      title: 'Multiple Locations',
      description: 'Convenient pickup and drop-off points across major cities.',
      features: ['Airport locations', 'City center hubs', 'Hotel partnerships']
    },
    {
      icon: CreditCard,
      title: 'Flexible Payment',
      description: 'Multiple payment options with transparent pricing.',
      features: ['Credit/debit cards', 'Digital wallets', 'Corporate accounts']
    }
  ];

  const packages = [
    {
      name: 'Essential',
      price: 'From $199/day',
      description: 'Perfect for short trips and city driving',
      features: [
        'Standard insurance coverage',
        'Basic roadside assistance',
        '24/7 customer support',
        'Fuel policy options'
      ],
      popular: false
    },
    {
      name: 'Premium',
      price: 'From $299/day',
      description: 'Enhanced experience with luxury vehicles',
      features: [
        'Comprehensive insurance',
        'Priority roadside assistance',
        'Dedicated account manager',
        'Complimentary fuel service',
        'Free additional driver'
      ],
      popular: true
    },
    {
      name: 'Elite',
      price: 'From $499/day',
      description: 'Ultimate luxury with white-glove service',
      features: [
        'Full premium insurance',
        'Concierge roadside service',
        'Personal relationship manager',
        'Delivery & collection service',
        'Unlimited additional drivers',
        'Exclusive vehicle access'
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary via-primary-dark to-accent py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-bold text-white mb-4">Our Services</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Comprehensive solutions for all your luxury car rental needs
            </p>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                What We <span className="text-gradient">Offer</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                End-to-end services designed to make your rental experience seamless and enjoyable
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => {
                const IconComponent = service.icon;
                return (
                  <div key={index} className="premium-card p-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-primary to-accent mb-4">
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                    <p className="text-muted-foreground mb-4">{service.description}</p>
                    <ul className="space-y-2">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center space-x-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Service Packages */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Service <span className="text-gradient">Packages</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Choose the perfect package for your rental needs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {packages.map((pkg, index) => (
                <div key={index} className={`premium-card p-6 relative ${pkg.popular ? 'ring-2 ring-accent scale-105' : ''}`}>
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-accent text-accent-foreground px-4 py-1 rounded-full text-sm font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                    <div className="text-3xl font-bold text-primary mb-2">{pkg.price}</div>
                    <p className="text-muted-foreground">{pkg.description}</p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {pkg.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-accent rounded-full"></div>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className={`w-full ${pkg.popular ? 'bg-accent hover:bg-accent/90' : 'bg-primary hover:bg-primary-dark'}`}
                  >
                    Choose {pkg.name}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Ready to Experience <span className="text-gradient">Excellence?</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Get in touch with our team to discuss your specific requirements
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-primary to-primary-dark">
                Get Started
              </Button>
              <Button size="lg" variant="outline">
                Contact Sales
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Services;