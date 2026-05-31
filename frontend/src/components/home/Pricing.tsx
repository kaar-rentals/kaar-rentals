import { Check, Sparkles, Infinity, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { openPlanWhatsApp } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';

/** Shared card shell — identical layout for every plan. */
const PLAN_CARD_CLASS =
  'flex flex-col h-full w-full min-w-0 overflow-hidden p-8 rounded-xl bg-gradient-to-br from-card to-muted border border-border [box-shadow:var(--shadow-card)] transition-[box-shadow] duration-300 hover:[box-shadow:var(--shadow-hover)]';

const PLAN_BUTTON_CLASS =
  'w-full max-w-full min-w-0 whitespace-normal h-auto min-h-11 py-2.5 text-sm leading-snug';

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 1499,
    cars: '1–2 cars',
    description: 'Perfect for individual owners getting started.',
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
    description: 'Best value for growing fleets and small dealers.',
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
    description: 'For dealers and power users who need no limits.',
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
    <section id="pricing" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-8 fade-in">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Listing <span className="text-gradient">Plans</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Simple monthly pricing to list your cars on Kaar.Rentals. Choose the plan that fits your fleet.
          </p>
        </div>

        {/* Launch offer */}
        <div className="flex justify-center mb-12 fade-in">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent/15 border border-accent/30 text-foreground">
            <Sparkles className="h-4 w-4 text-accent shrink-0" />
            <span className="text-sm sm:text-base font-semibold">
              First month at <span className="text-accent">50% OFF</span> (Limited Time)
            </span>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch slide-up">
          {plans.map((plan, index) => (
            <div
              key={plan.id}
              className="min-w-0 flex flex-col h-full"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className={cn(
                  PLAN_CARD_CLASS,
                  plan.popular && 'border-accent/40'
                )}
              >
                {/* Reserved badge row — same height on every card for alignment */}
                <div className="mb-4 flex h-7 shrink-0 items-center justify-center">
                  {plan.popular && (
                    <Badge className="bg-gradient-gold text-accent-foreground border-0 px-4 py-1 text-xs font-bold">
                      Most Popular
                    </Badge>
                  )}
                </div>

                <div className="mb-6 shrink-0">
                  <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{plan.cars}</p>
                </div>

                <div className="mb-2 shrink-0">
                  <span className="text-4xl font-bold text-foreground">
                    PKR {plan.price.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground text-lg">/month</span>
                </div>

                <p className="text-sm text-muted-foreground mb-6 shrink-0">{plan.description}</p>

                <ul className="mb-8 min-h-0 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-foreground">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15">
                        <Check className="h-3.5 w-3.5 text-accent" strokeWidth={3} />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto w-full min-w-0 shrink-0">
                  <Button
                    size="lg"
                    variant="outline"
                    className={cn(
                      PLAN_BUTTON_CLASS,
                      plan.popular &&
                        'border-accent/50 text-accent hover:bg-accent/10 hover:text-accent-foreground'
                    )}
                    onClick={() => handlePlanClick(plan)}
                  >
                    <MessageCircle className="h-4 w-4 mr-2 shrink-0" />
                    <span className="text-center">{plan.cta} via WhatsApp</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lifetime option */}
        <div className="mt-12 max-w-3xl mx-auto fade-in">
          <div className="premium-card p-6 sm:p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-primary to-primary-dark mb-4">
              <Infinity className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">One-Time Lifetime Option</h3>
            <p className="text-muted-foreground mb-1">
              Prefer a single payment? List one car forever with our lifetime plan.
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
