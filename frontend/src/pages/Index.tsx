import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import FeaturedCars from '@/components/home/FeaturedCars';
import Categories from '@/components/home/Categories';
import Pricing from '@/components/home/Pricing';
import AdBanner from '@/components/ads/AdBanner';
import { JsonLd } from '@/components/seo/JsonLd';
import { usePageSeo } from '@/lib/usePageSeo';
import { organizationSchema, websiteSchema } from '@/lib/schema';

const Index = () => {
  usePageSeo({
    title: 'Rent a Car in Pakistan | Drive Your Dreams | Kaar.Rentals',
    description:
      "Pakistan's car listing marketplace — browse self-drive rentals in Lahore, Karachi, Islamabad & all cities. List your car for rent. Contact owners via WhatsApp.",
    path: '/',
  });

  return (
    <div className="min-h-screen dark:bg-background">
      <JsonLd data={[organizationSchema(), websiteSchema()]} />
      <Header />
      <main className="pt-16 md:pt-20 home-page">
        <Hero />
        <FeaturedCars />
        <Categories />
        <Pricing />
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AdBanner className="my-4" />
          </div>
        </section>
        <nav aria-label="Popular cities" className="sr-only">
          <Link to="/rent-car-lahore">Rent a car in Lahore</Link>
          {' · '}
          <Link to="/rent-car-karachi">Rent a car in Karachi</Link>
          {' · '}
          <Link to="/rent-car-islamabad">Rent a car in Islamabad</Link>
          {' · '}
          <Link to="/list-car">List your car for rent</Link>
          {' · '}
          <Link to="/pricing">Car owner listing plans</Link>
        </nav>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
