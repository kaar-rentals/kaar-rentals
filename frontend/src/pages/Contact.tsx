import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const Contact = () => {
  const contactInfo = [
    {
      icon: MapPin,
      title: 'Visit Us',
      details: ['123 Luxury Avenue', 'Premium City, PC 12345', 'United States']
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: ['+1 (555) 123-4567', '+1 (555) 987-6543', 'Available 24/7']
    },
    {
      icon: Mail,
      title: 'Email Us',
      details: ['info@luxeride.com', 'support@luxeride.com', 'sales@luxeride.com']
    },
    {
      icon: Clock,
      title: 'Business Hours',
      details: ['Mon - Fri: 8:00 AM - 8:00 PM', 'Sat - Sun: 9:00 AM - 6:00 PM', 'Emergency: 24/7']
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
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
                Frequently Asked <span className="text-gradient">Questions</span>
              </h2>
            </div>

            <div className="space-y-6">
              {[
                {
                  question: "What documents do I need to rent a car?",
                  answer: "You'll need a valid driver's license, credit card, and ID. International customers may need an international driving permit."
                },
                {
                  question: "Can I modify or cancel my reservation?",
                  answer: "Yes, you can modify or cancel your reservation up to 24 hours before pickup time without penalty."
                },
                {
                  question: "Is insurance included in the rental price?",
                  answer: "Basic insurance is included. We offer additional coverage options for enhanced protection."
                },
                {
                  question: "Do you offer delivery and pickup services?",
                  answer: "Yes, we provide complimentary delivery and pickup within city limits for premium bookings."
                }
              ].map((faq, index) => (
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