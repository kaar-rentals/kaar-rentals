import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TermsOfService = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
            <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>1. Acceptance of Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  By accessing and using Kaar Rentals, you accept and agree to be bound by the terms 
                  and provision of this agreement. If you do not agree to abide by the above, please 
                  do not use this service.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Description of Service</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Kaar Rentals is a peer-to-peer car rental platform that connects car owners with 
                  renters. We provide a marketplace for car rentals but are not a party to the rental 
                  agreement between owners and renters.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. User Accounts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Account Creation</h3>
                  <p className="text-gray-600">
                    To use our services, you must create an account and provide accurate, complete, 
                    and current information. You are responsible for maintaining the confidentiality 
                    of your account credentials.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Account Responsibilities</h3>
                  <p className="text-gray-600">
                    You are responsible for all activities that occur under your account. You must 
                    notify us immediately of any unauthorized use of your account.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>4. Car Owner Responsibilities</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">As a car owner, you agree to:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Provide accurate information about your vehicle</li>
                  <li>Maintain your vehicle in safe and roadworthy condition</li>
                  <li>Have valid insurance coverage for your vehicle</li>
                  <li>Be available for communication with renters</li>
                  <li>Comply with all applicable laws and regulations</li>
                  <li>Deliver the vehicle in clean condition</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5. Renter Responsibilities</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">As a renter, you agree to:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Have a valid driver's license</li>
                  <li>Be at least 21 years old (or as required by local law)</li>
                  <li>Use the vehicle only for personal, non-commercial purposes</li>
                  <li>Return the vehicle in the same condition as received</li>
                  <li>Report any damage or issues immediately</li>
                  <li>Comply with all traffic laws and regulations</li>
                  <li>Not allow unauthorized drivers to operate the vehicle</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>6. Payments and Fees</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Rental Fees</h3>
                  <p className="text-gray-600">
                    Rental fees are set by car owners and are displayed on the platform. All payments 
                    are processed through our secure payment system.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Service Fees</h3>
                  <p className="text-gray-600">
                    We charge a service fee for facilitating the rental transaction. This fee is 
                    clearly displayed before booking confirmation.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Refunds</h3>
                  <p className="text-gray-600">
                    Refund policies are outlined in our cancellation policy. Refunds are processed 
                    according to the terms agreed upon at the time of booking.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>7. Insurance and Liability</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Car owners must maintain comprehensive insurance coverage for their vehicles. 
                  Renters are responsible for any damage or loss that occurs during the rental period, 
                  subject to the terms of the owner's insurance policy.
                </p>
                <p className="text-gray-600">
                  Kaar Rentals is not responsible for any accidents, damages, or losses that occur 
                  during the rental period. All disputes should be resolved between the owner and renter, 
                  or through their respective insurance companies.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>8. Prohibited Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">You may not:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Use the platform for any illegal or unauthorized purpose</li>
                  <li>Violate any local, state, or federal laws</li>
                  <li>Interfere with or disrupt the platform's functionality</li>
                  <li>Attempt to gain unauthorized access to other users' accounts</li>
                  <li>Post false, misleading, or fraudulent information</li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>Use the platform to compete with our services</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>9. Termination</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We reserve the right to terminate or suspend your account at any time for violations 
                  of these terms or for any other reason at our sole discretion. You may also terminate 
                  your account at any time by contacting us.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>10. Limitation of Liability</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Kaar Rentals shall not be liable for any indirect, incidental, special, consequential, 
                  or punitive damages, including but not limited to loss of profits, data, or use, 
                  incurred by you or any third party, whether in an action in contract or tort.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>11. Changes to Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We reserve the right to modify these terms at any time. We will notify users of 
                  any material changes by posting the updated terms on our platform. Your continued 
                  use of the service constitutes acceptance of the modified terms.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>12. Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                <div className="space-y-2">
                  <p className="text-gray-600">Email: legal@kaar-rentals.com</p>
                  <p className="text-gray-600">Phone: +92 300 123 4567</p>
                  <p className="text-gray-600">Address: Karachi, Pakistan</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
