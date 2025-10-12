import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader2, ArrowRight, Home, Car } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { toast } = useToast();
  
  const [paymentStatus, setPaymentStatus] = useState<'loading' | 'success' | 'failed' | 'pending'>('loading');
  const [paymentData, setPaymentData] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const paymentId = searchParams.get('paymentId');
  const tokenParam = searchParams.get('token');

  useEffect(() => {
    if (!paymentId) {
      setError('Payment ID is missing');
      setPaymentStatus('failed');
      return;
    }

    if (!user || !token) {
      setError('Please log in to verify payment');
      setPaymentStatus('failed');
      return;
    }

    verifyPayment();
  }, [paymentId, user, token]);

  const verifyPayment = async () => {
    try {
      setPaymentStatus('loading');
      setError('');

      const result = await apiService.verifyPayment(paymentId!, token!);
      setPaymentData(result);

      if (result.status === 'SUCCEEDED') {
        setPaymentStatus('success');
        
        // Show success toast
        toast({
          title: "Payment Successful!",
          description: "Your listing has been published successfully.",
          variant: "default",
        });

        // If listing is published, show success message
        if (result.listing?.publishedListingId) {
          // Auto-redirect to published listing after 3 seconds
          setTimeout(() => {
            navigate(`/car/${result.listing.publishedListingId}`);
          }, 3000);
        }
      } else if (result.status === 'PENDING') {
        setPaymentStatus('pending');
      } else {
        setPaymentStatus('failed');
        setError('Payment was not successful');
      }

    } catch (err: any) {
      console.error('Error verifying payment:', err);
      setError(err.message || 'Failed to verify payment');
      setPaymentStatus('failed');
      
      toast({
        title: "Verification Failed",
        description: err.message || 'Failed to verify payment',
        variant: "destructive",
      });
    }
  };

  const retryVerification = () => {
    verifyPayment();
  };

  const formatAmount = (amountInPaise: number) => {
    return `PKR ${(amountInPaise / 100).toLocaleString()}`;
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Loading State */}
          {paymentStatus === 'loading' && (
            <Card className="text-center">
              <CardContent className="p-12">
                <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto mb-6" />
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Verifying Payment</h1>
                <p className="text-gray-600">Please wait while we verify your payment...</p>
              </CardContent>
            </Card>
          )}

          {/* Success State */}
          {paymentStatus === 'success' && paymentData && (
            <div className="space-y-6">
              <Card className="border-green-200 bg-green-50/50">
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-6" />
                  <h1 className="text-3xl font-bold text-green-900 mb-4">Payment Successful!</h1>
                  <p className="text-green-700 text-lg mb-6">
                    Your listing has been published successfully and is now live on our platform.
                  </p>
                  
                  {paymentData.listing?.publishedListingId && (
                    <div className="bg-white rounded-lg p-6 mb-6">
                      <h3 className="text-lg font-semibold mb-4">Listing Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Payment Amount:</span>
                          <span className="font-semibold ml-2">
                            {formatAmount(paymentData.amount_in_paise)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Transaction ID:</span>
                          <span className="font-semibold ml-2">{paymentData.providerRef}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Published At:</span>
                          <span className="font-semibold ml-2">
                            {new Date(paymentData.listing.publishedAt).toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Status:</span>
                          <Badge className="ml-2 bg-green-100 text-green-800">Published</Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {paymentData.listing?.publishedListingId && (
                      <Link to={`/car/${paymentData.listing.publishedListingId}`}>
                        <Button size="lg" className="bg-green-600 hover:bg-green-700">
                          <Car className="h-4 w-4 mr-2" />
                          View Your Listing
                        </Button>
                      </Link>
                    )}
                    <Link to="/owner-profile">
                      <Button size="lg" variant="outline">
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Manage Listings
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Details */}
              <Card>
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
                      <span className="text-gray-600">Amount Paid:</span>
                      <span className="font-semibold ml-2">
                        {formatAmount(paymentData.amount_in_paise)}
                      </span>
                    </div>
                    {paymentData.settled_amount_in_paise && (
                      <div>
                        <span className="text-gray-600">Settled Amount:</span>
                        <span className="font-semibold ml-2">
                          {formatAmount(paymentData.settled_amount_in_paise)}
                        </span>
                      </div>
                    )}
                    {paymentData.gateway_fees_in_paise && (
                      <div>
                        <span className="text-gray-600">Gateway Fees:</span>
                        <span className="font-semibold ml-2">
                          {formatAmount(paymentData.gateway_fees_in_paise)}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="font-mono ml-2">{paymentData.providerRef}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Paid At:</span>
                      <span className="ml-2">
                        {new Date(paymentData.paidAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Pending State */}
          {paymentStatus === 'pending' && (
            <Card className="border-yellow-200 bg-yellow-50/50">
              <CardContent className="p-8 text-center">
                <Loader2 className="h-16 w-16 animate-spin text-yellow-600 mx-auto mb-6" />
                <h1 className="text-2xl font-bold text-yellow-900 mb-4">Payment Processing</h1>
                <p className="text-yellow-700 mb-6">
                  Your payment is being processed. This may take a few minutes.
                </p>
                <Button onClick={retryVerification} variant="outline">
                  Check Status Again
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Failed State */}
          {paymentStatus === 'failed' && (
            <div className="space-y-6">
              <Card className="border-red-200 bg-red-50/50">
                <CardContent className="p-8 text-center">
                  <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-6" />
                  <h1 className="text-2xl font-bold text-red-900 mb-4">Payment Verification Failed</h1>
                  <p className="text-red-700 mb-6">
                    {error || 'We were unable to verify your payment. Please try again or contact support.'}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button onClick={retryVerification} variant="outline">
                      Try Again
                    </Button>
                    <Link to="/list-car">
                      <Button>
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Create New Listing
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Help Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Need Help?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    If you believe your payment was successful but you're seeing this error, please contact our support team with your payment details.
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <strong>Email:</strong> support@kaar-rentals.com
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Phone:</strong> +92 300 123 4567
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Payment ID:</strong> {paymentId}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Back to Home */}
          <div className="text-center mt-8">
            <Link to="/">
              <Button variant="outline">
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
