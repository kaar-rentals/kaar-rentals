import { Car, Truck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const Categories = () => {
  const categories = [
    {
      name: 'Sedans',
      icon: Car,
      description: 'Elegant and comfortable for business and leisure',
      count: '150+ vehicles',
      color: 'from-blue-500 to-blue-600',
      href: '/cars?category=sedan'
    },
    {
      name: 'SUVs',
      icon: Truck,
      description: 'Spacious and powerful for family adventures',
      count: '200+ vehicles',
      color: 'from-green-500 to-green-600',
      href: '/cars?category=suv'
    },
    {
      name: 'Hatchbacks',
      icon: Zap,
      description: 'Compact and efficient for city driving',
      count: '100+ vehicles',
      color: 'from-accent to-primary',
      href: '/cars?category=hatchback'
    }
  ];

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 fade-in">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Browse by <span className="text-gradient">Category</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find the perfect vehicle for your needs from our diverse collection 
            of premium cars across multiple categories.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 slide-up">
          {categories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <Link
                key={category.name}
                to={category.href}
                className="group block"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="premium-card p-8 text-center h-full group-hover:shadow-lg transition-all duration-300">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-r ${category.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-foreground mb-3">
                    {category.name}
                  </h3>
                  
                  <p className="text-muted-foreground mb-4">
                    {category.description}
                  </p>
                  
                  <div className="text-sm font-semibold text-primary">
                    {category.count}
                  </div>
                  
                  <div className="mt-6 text-primary group-hover:text-accent transition-colors duration-300">
                    Browse {category.name} →
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Categories;