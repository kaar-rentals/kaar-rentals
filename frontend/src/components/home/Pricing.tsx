import { Check, Sparkles, Infinity, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { openPlanWhatsApp } from '@/lib/whatsapp';

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 1499,
    cars: '1–2 cars',
    description: 'List your car for rent in Lahore, Karachi, Islamabad & across Pakistan.',
    features: [
      'List up to 2 vehicles',
      'Standard listing visibility',
      'Owner dashboard access',
      'In-app messaging with renters',
      'Email support',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 2999,
    cars: 'Up to 5 cars',
    description: 'Reach renters searching for self drive car rental in major Pakistani cities.',
    features: [
      'List up to 5 vehicles',
      'Priority listing placement',
      'Owner dashboard access',
      'Featured badge on listings',
      'Priority email & chat support',
      'Basic listing analytics',
    ],
    cta: 'Choose Standard',
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 4999,
    cars: 'Unlimited cars',
    description: 'Maximum visibility for owners listing multiple cars nationwide.',
    features: [
      'Unlimited vehicle listings',
      'Top search placement',
      'Full owner dashboard',
      'Verified seller badge',
      '24/7 priority support',
      'Advanced analytics & insights',
    ],
    cta: 'Go Premium',
    popular: false,
  },
];

const Pricing = () => {
  const { user } = useAuth();

  const handlePlanClick = (plan: typeof plans[0]) => {
    openPlanWhatsApp({
      planName: plan.name,
      carsLabel: plan.cars,
      userName: user?.name,
      userPhone: (user as { phone?: string })?.phone,
    });
  };

  return (
    <section id="pricing" className="py-20 bg-muted/30 overflow-visible">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-8 fade-in">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Listing <span className="text-accent">Plans</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Simple monthly pricing to list your car for rent on Kaar.Rentals — Lahore, Karachi, Islamabad & all Pakistan.
          </p>
        </div>

        {/* Launch offer */}
        <div className="flex justify-center mb-12 fade-in">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent/15 border border-accent/30 text-foreground dark:text-accent">
            <Sparkles className="h-4 w-4 text-accent shrink-0" />
            <span className="text-sm sm:text-base font-semibold">
              First month at <span className="text-accent">50% OFF</span> (Limited Time)
            </span>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch slide-up overflow-visible pt-4">
          {plans.map((plan, index) => (
            <div
              key={plan.id}
              className="relative flex flex-col h-full min-w-0"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="bg-gradient-gold text-accent-foreground border-0 px-4 py-1 text-xs font-bold shadow-md">
                    Most Popular
                  </Badge>
                </div>
              )}

              <div
                className={`premium-card flex flex-col h-full p-8 min-w-0 ${
                  plan.popular ? 'border-2 border-accent' : ''
                }`}
              >
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{plan.cars}</p>
                </div>

                <div className="mb-2">
                  <span className="text-4xl font-bold text-foreground">
                    PKR {plan.price.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground text-lg">/month</span>
                </div>

                <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>

                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-foreground">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15">
                        <Check className="h-3.5 w-3.5 text-accent" strokeWidth={3} />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  size="lg"
                  className={`w-full max-w-full ${
                    plan.popular
                      ? 'bg-gradient-gold text-accent-foreground hover:opacity-90'
                      : ''
                  }`}
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => handlePlanClick(plan)}
                >
                  <MessageCircle className="h-4 w-4 mr-2 shrink-0" />
                  {plan.cta} via WhatsApp
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Lifetime option */}
        <div className="mt-12 max-w-3xl mx-auto fade-in">
          <div className="premium-card p-6 sm:p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-primary to-primary-dark dark:from-accent/20 dark:to-accent/10 dark:border dark:border-accent/40 mb-4">
              <Infinity className="h-6 w-6 text-primary-foreground dark:text-accent" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">One-Time Lifetime Option</h3>
            <p className="text-muted-foreground mb-1">
              Prefer a single payment? List your car for rent forever — one car, one fee, no monthly renewal.
            </p>
            <p className="text-2xl font-bold text-foreground">
              PKR 5,999 <span className="text-base font-normal text-muted-foreground">per car</span>
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              One-time fee · No monthly renewal for that vehicle
            </p>
            <Button
              variant="outline"
              className="mt-5"
              onClick={() =>
                openPlanWhatsApp({
                  planName: 'Lifetime (one-time)',
                  carsLabel: '1 car — PKR 5,999 per car',
                  userName: user?.name,
                  userPhone: (user as { phone?: string })?.phone,
                })
              }
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Ask About Lifetime on WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
