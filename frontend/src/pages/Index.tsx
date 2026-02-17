import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import FeaturedCars from '@/components/home/FeaturedCars';
import Categories from '@/components/home/Categories';
import AdBanner from '@/components/ads/AdBanner';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        <Hero />
        <Categories />
        {/* Home page AdSense banner (configure slot via env: VITE_ADSENSE_SLOT_HOME) */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AdBanner className="my-4" />
          </div>
        </section>
        <FeaturedCars />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
