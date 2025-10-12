import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { XCircle, AlertTriangle, RefreshCw, ArrowRight, Home, CreditCard } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const PaymentFailed = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { toast } = useToast();
  
  const [paymentData, setPaymentData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const paymentId = searchParams.get('paymentId');
  const reason = searchParams.get('reason') || 'Payment was cancelled or failed';

  useEffect(() => {
    if (paymentId && user && token) {
      fetchPaymentDetails();
    }
  }, [paymentId, user, token]);

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true);
      const result = await apiService.verifyPayment(paymentId!, token!);
      setPaymentData(result);
    } catch (err: any) {
      console.error('Error fetching payment details:', err);
      setError(err.message || 'Failed to fetch payment details');
    } finally {
      setLoading(false);
    }
  };

  const retryPayment = () => {
    // Navigate back to listing form to retry
    navigate('/list-car');
  };

  const formatAmount = (amountInPaise: number) => {
    return `PKR ${(amountInPaise / 100).toLocaleString()}`;
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Main Error Card */}
          <Card className="border-red-200 bg-red-50/50">
            <CardContent className="p-8 text-center">
              <XCircle className="h-16 w-16 text-red-600 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-red-900 mb-4">Payment Failed</h1>
              <p className="text-red-700 text-lg mb-6">
                {reason}
              </p>
              <p className="text-red-600 mb-8">
                Your listing has not been published. Please try again or contact support if you continue to experience issues.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={retryPayment} size="lg">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Link to="/owner-profile">
                  <Button size="lg" variant="outline">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    My Listings
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Payment Details */}
          {paymentData && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600">Payment ID:</span>
                    <span className="font-mono ml-2">{paymentData.paymentId}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <Badge className="ml-2 bg-red-100 text-red-800">
                      {paymentData.status}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-semibold ml-2">
                      {formatAmount(paymentData.amount_in_paise)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Created:</span>
                    <span className="ml-2">
                      {new Date(paymentData.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Common Issues */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Common Payment Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900">Insufficient Funds</h4>
                  <p className="text-gray-600 text-sm">
                    Ensure your account has sufficient balance or your credit card has available credit.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Card Declined</h4>
                  <p className="text-gray-600 text-sm">
                    Your bank may have declined the transaction. Contact your bank or try a different payment method.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Network Issues</h4>
                  <p className="text-gray-600 text-sm">
                    Check your internet connection and try again. Payment processing may take a few moments.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Browser Issues</h4>
                  <p className="text-gray-600 text-sm">
                    Try refreshing the page or using a different browser. Clear your cache if problems persist.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support Section */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                If you continue to experience payment issues, our support team is here to help.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Contact Support</h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600">
                      <strong>Email:</strong> support@kaar-rentals.com
                    </p>
                    <p className="text-gray-600">
                      <strong>Phone:</strong> +92 300 123 4567
                    </p>
                    <p className="text-gray-600">
                      <strong>WhatsApp:</strong> +92 300 123 4567
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Payment Information</h4>
                  <div className="space-y-2 text-sm">
                    {paymentId && (
                      <p className="text-gray-600">
                        <strong>Payment ID:</strong> {paymentId}
                      </p>
                    )}
                    <p className="text-gray-600">
                      <strong>Supported Cards:</strong> Visa, MasterCard, American Express
                    </p>
                    <p className="text-gray-600">
                      <strong>Currency:</strong> PKR (Pakistani Rupees)
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alternative Actions */}
          <div className="mt-8 text-center space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/list-car">
                <Button variant="outline">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Create New Listing
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline">
                  <Home className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
            
            <p className="text-sm text-gray-500">
              Don't worry - your listing data is safe and you can try again anytime.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentFailed;
