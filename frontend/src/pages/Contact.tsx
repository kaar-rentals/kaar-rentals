import { MapPin, Phone, Mail, Clock, MessageCircle, Facebook, Instagram } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { contactConfig } from '@/config/contact';
import { usePageSeo } from '@/lib/usePageSeo';
import { JsonLd } from '@/components/seo/JsonLd';
import { faqPageSchema } from '@/lib/schema';

const CONTACT_FAQS = [
  {
    question: 'What documents do I need to rent a car in Pakistan?',
    answer:
      'Valid CNIC and driving license are required. Contact the car owner directly on WhatsApp to confirm documents and rental terms — Kaar.Rentals does not process bookings.',
  },
  {
    question: 'How do I list my car for rent on Kaar.Rentals?',
    answer:
      'Choose a listing plan (Basic, Standard, Premium, or Lifetime), contact us on WhatsApp with your car details, and go live after approval. Renters contact you directly on WhatsApp — you keep full control of rental terms.',
  },
  {
    question: 'How does booking work?',
    answer:
      'There is no platform booking. Browse listings, then message or call the owner on WhatsApp to arrange pickup, dates, and payment directly.',
  },
  {
    question: 'Which cities do you cover?',
    answer:
      'Listings across Pakistan including Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Peshawar, and Multan. Owners can list in any city; renters search by location.',
  },
  {
    question: 'What listing plans are available for car owners?',
    answer:
      'Basic (PKR 1,499/mo, 1–2 cars), Standard (PKR 2,999/mo), Premium (PKR 4,999/mo), and Lifetime (PKR 5,999 one-time per car). See our pricing page or contact us on WhatsApp to get started.',
  },
];

const Contact = () => {
  usePageSeo({
    title: 'Contact Kaar.Rentals | Car Rental Support Pakistan',
    description:
      'Contact Kaar.Rentals for car listing support, renter enquiries & help across Pakistan. WhatsApp, phone & email — 24/7.',
    path: '/contact',
  });

  const contactInfo = [
    {
      icon: Phone,
      title: 'Call Us',
      details: [contactConfig.phone, contactConfig.businessHours, 'Direct line to our team']
    },
    {
      icon: Mail,
      title: 'Email Us',
      details: [contactConfig.email, contactConfig.responseTime, 'Support & inquiries']
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      details: [contactConfig.whatsappNumber, 'Instant messaging', 'Quick booking support']
    },
    ...(contactConfig.showAddresses ? [{
      icon: MapPin,
      title: 'Visit Us',
      details: contactConfig.addresses
    }] : [])
  ];

  return (
    <div className="min-h-screen">
      <JsonLd data={faqPageSchema(CONTACT_FAQS)} />
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary via-primary-dark to-accent py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-bold text-white mb-4">Contact Us</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Get in touch with our team for personalized assistance
            </p>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div className="premium-card p-8">
                <h2 className="text-3xl font-bold text-foreground mb-6">Send us a Message</h2>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="John" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Doe" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="john@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="How can we help you?" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Tell us more about your inquiry..."
                      rows={5}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary"
                  >
                    Send Message
                  </Button>
                </form>
              </div>

              {/* Contact Information */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-foreground mb-6">Get in Touch</h2>
                  <p className="text-lg text-muted-foreground mb-8">
                    We're here to help with any questions about our services, 
                    vehicle availability, or special requirements you may have.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {contactInfo.map((info, index) => {
                    const IconComponent = info.icon;
                    return (
                      <div key={index} className="premium-card p-6">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-primary to-accent mb-4">
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold mb-3">{info.title}</h3>
                        <div className="space-y-1">
                          {info.details.map((detail, detailIndex) => (
                            <p key={detailIndex} className="text-muted-foreground text-sm">
                              {detail}
                            </p>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Social Media Links */}
                <div className="premium-card p-6">
                  <h3 className="text-xl font-semibold mb-4">Follow Us</h3>
                  <p className="text-muted-foreground mb-6">
                    Stay connected with us on social media for updates, special offers, and more!
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <a 
                      href="https://www.facebook.com/share/16sg1pXed3/?mibextid=wwXIfr" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Facebook className="h-5 w-5" />
                      <span>Facebook</span>
                    </a>
                    <a 
                      href="https://www.instagram.com/kaar.rentals/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                    >
                      <Instagram className="h-5 w-5" />
                      <span>Instagram</span>
                    </a>
                    <a 
                      href={contactConfig.whatsapp} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <MessageCircle className="h-5 w-5" />
                      <span>WhatsApp</span>
                    </a>
                    <a 
                      href="https://www.tiktok.com/@kaar.rentals" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                      </svg>
                      <span>TikTok</span>
                    </a>
                  </div>
                </div>

                {/* Map Placeholder */}
                <div className="premium-card p-0 overflow-hidden">
                  <div className="h-64 bg-gradient-to-r from-muted to-muted-foreground/20 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-muted-foreground mb-4 mx-auto" />
                      <p className="text-muted-foreground">Interactive Map</p>
                      <p className="text-sm text-muted-foreground">Location and directions</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Frequently Asked <span className="text-accent">Questions</span>
              </h2>
            </div>

            <div className="space-y-6">
              {CONTACT_FAQS.map((faq, index) => (
                <div key={index} className="premium-card p-6">
                  <h3 className="text-lg font-semibold mb-3">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;