import { Link } from 'react-router-dom';
import { Phone, Mail, Facebook, Instagram, MessageCircle } from 'lucide-react';
import { contactConfig } from '@/config/contact';
import BrandLogoLink from '@/components/layout/BrandLogo';

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground dark:bg-card dark:text-card-foreground border-t border-border transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <BrandLogoLink variant="footer" />
            <p className="text-primary-foreground/70 dark:text-muted-foreground">
              Premium car rental service offering luxury vehicles with exceptional customer experience.
            </p>
            <div className="flex flex-wrap gap-2">
              <a
                href="https://www.facebook.com/share/16sg1pXed3/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 w-11 items-center justify-center rounded-md hover:text-accent transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/kaar.rentals/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 w-11 items-center justify-center rounded-md hover:text-accent transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={contactConfig.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 w-11 items-center justify-center rounded-md hover:text-accent transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
              <a
                href="https://www.tiktok.com/@kaar.rentals"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 w-11 items-center justify-center rounded-md hover:text-accent transition-colors"
                aria-label="TikTok"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/cars" className="inline-flex min-h-10 items-center hover:text-accent transition-colors">Browse Cars</Link></li>
              <li><Link to="/about" className="inline-flex min-h-10 items-center hover:text-accent transition-colors">About Us</Link></li>
              <li><Link to="/list-car" className="inline-flex min-h-10 items-center hover:text-accent transition-colors">List Your Car</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Categories</h3>
            <ul className="space-y-3">
              <li><Link to="/cars?category=sedan" className="inline-flex min-h-10 items-center hover:text-accent transition-colors">Sedans</Link></li>
              <li><Link to="/cars?category=suv" className="inline-flex min-h-10 items-center hover:text-accent transition-colors">SUVs</Link></li>
              <li><Link to="/cars?category=hatchback" className="inline-flex min-h-10 items-center hover:text-accent transition-colors">Hatchbacks</Link></li>
              <li><Link to="/contact" className="inline-flex min-h-10 items-center hover:text-accent transition-colors">Support</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-accent" />
                <a href={`tel:${contactConfig.phone}`} className="text-sm hover:text-accent transition-colors">{contactConfig.phone}</a>
              </div>
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-4 w-4 text-accent" />
                <a href={contactConfig.whatsapp} target="_blank" rel="noopener noreferrer" className="text-sm hover:text-accent transition-colors">{contactConfig.whatsappNumber}</a>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-accent" />
                <a href="mailto:kaar.rentals@gmail.com" className="text-sm hover:text-accent transition-colors">kaar.rentals@gmail.com</a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 dark:border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-primary-foreground/70 dark:text-muted-foreground">
            © 2026 Kaar.Rentals. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy-policy" className="text-sm text-primary-foreground/70 dark:text-muted-foreground hover:text-accent transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="text-sm text-primary-foreground/70 dark:text-muted-foreground hover:text-accent transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
