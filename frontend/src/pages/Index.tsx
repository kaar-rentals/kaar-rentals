import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import FeaturedCars from '@/components/home/FeaturedCars';
import Categories from '@/components/home/Categories';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        <Hero />
        <Categories />
        <FeaturedCars />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
