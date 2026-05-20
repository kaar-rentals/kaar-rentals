import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Pricing from '@/components/home/Pricing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { buildWhatsAppUrl, buildPlanWhatsAppMessage } from '@/lib/whatsapp';

const PricingPage = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    plan: 'Standard',
    cars: 'Up to 5 cars',
    name: user?.name || '',
    phone: '',
    message: '',
  });

  useEffect(() => {
    document.title = 'Pricing Plans – Kaar.Rentals';
    if (user?.name) {
      setForm((f) => ({ ...f, name: user.name }));
    }
  }, [user?.name]);

  const sendViaWhatsApp = () => {
    const text = buildPlanWhatsAppMessage({
      planName: form.plan,
      carsLabel: form.cars,
      userName: form.name,
      userPhone: form.phone,
      extra: form.message || undefined,
    });
    window.open(buildWhatsAppUrl(text), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        <Pricing />

        <section className="py-16 bg-background">
          <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="premium-card p-8 space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Contact us on <span className="text-gradient">WhatsApp</span>
                </h2>
                <p className="text-muted-foreground text-sm">
                  Fill in your details and we will open WhatsApp with your message ready to send.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="plan">Selected plan</Label>
                  <select
                    id="plan"
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    value={form.plan}
                    onChange={(e) => {
                      const plan = e.target.value;
                      const carsMap: Record<string, string> = {
                        Basic: '1–2 cars',
                        Standard: 'Up to 5 cars',
                        Premium: 'Unlimited cars',
                      };
                      setForm({ ...form, plan, cars: carsMap[plan] || form.cars });
                    }}
                  >
                    <option value="Basic">Basic — PKR 1,499/month</option>
                    <option value="Standard">Standard — PKR 2,999/month</option>
                    <option value="Premium">Premium — PKR 4,999/month</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cars">Number of cars</Label>
                  <Input
                    id="cars"
                    value={form.cars}
                    onChange={(e) => setForm({ ...form, cars: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Your name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="03XX XXXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Additional message (optional)</Label>
                  <Textarea
                    id="message"
                    rows={3}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Any questions about plans or lifetime option..."
                  />
                </div>
              </div>

              <Button
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={sendViaWhatsApp}
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Send via WhatsApp
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PricingPage;
