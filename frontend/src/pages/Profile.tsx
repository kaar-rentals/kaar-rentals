import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { User, Mail, Calendar, Eye, Phone, Repeat2, Loader2, RefreshCw, Copy, Check, ToggleLeft, ToggleRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiService } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import socket from "@/lib/socket";

const Profile = () => {
  const { unique_id } = useParams<{ unique_id?: string }>();
  const { user: authUser, token } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchListings();
  }, [unique_id, authUser]);

  // Socket subscription for real-time updates
  useEffect(() => {
    if (!user?.unique_id) return;

    const handleListingCreated = ({ listing, owner_unique_id }: any) => {
      if (owner_unique_id === user.unique_id) {
        console.log('[Socket] Listing created for this user, refetching...');
        fetchListings();
      }
    };

    const handleListingUpdated = ({ listing, owner_unique_id }: any) => {
      if (owner_unique_id === user.unique_id) {
        console.log('[Socket] Listing updated for this user, refetching...');
        fetchListings();
      }
    };

    socket.on('listing:created', handleListingCreated);
    socket.on('listing:updated', handleListingUpdated);

    return () => {
      socket.off('listing:created', handleListingCreated);
      socket.off('listing:updated', handleListingUpdated);
    };
  }, [user?.unique_id]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://kaar-rentals-backend.onrender.com/api';
      
      if (unique_id) {
        // Fetch user by unique_id (public profile)
        const response = await fetch(`${API_BASE_URL}/user/profile/${unique_id}`);
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          setError('User not found');
        }
      } else if (authUser) {
        // Fetch authenticated user's own profile
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user || authUser);
        } else {
          setUser(authUser);
        }
      } else {
        setError('Please sign in to view your profile, or provide a user unique ID');
      }
    } catch (err: any) {
      console.error("Error fetching profile:", err);
      setError(err?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchListings = async () => {
    try {
      if (!user) return;
      
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://kaar-rentals-backend.onrender.com/api';
      
      // Fetch listings by owner unique_id
      const ownerId = user.unique_id || user._id;
      const response = await fetch(`${API_BASE_URL}/cars?owner_unique_id=${ownerId}&limit=12`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (response.ok) {
        const data = await response.json();
        setListings(data.cars || []);
      }
    } catch (err: any) {
      console.error("Error fetching listings:", err);
    }
  };

  const toggleListingStatus = async (listingId: string, currentStatus: string) => {
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to update listing status",
        variant: "destructive",
      });
      return;
    }

    try {
      const newStatus = currentStatus === 'rented' ? 'available' : 'rented';
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://kaar-rentals-backend.onrender.com/api';
      const response = await fetch(`${API_BASE_URL}/cars/${listingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast({
          title: "Status Updated",
          description: `Listing marked as ${newStatus}`,
        });
        fetchListings();
      } else {
        throw new Error('Failed to update status');
      }
    } catch (err: any) {
      toast({
        title: "Update Failed",
        description: err.message || "Failed to update listing status",
        variant: "destructive",
      });
    }
  };

  const copyUniqueId = () => {
    if (user?.unique_id) {
      navigator.clipboard.writeText(user.unique_id);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Unique ID copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchProfile();
    fetchListings();
  };

  const isOwnerOrAdmin = (listing: any) => {
    if (!authUser) return false;
    if (authUser.is_admin || authUser.role === 'admin') return true;
    return listing.owner && (listing.owner._id === authUser._id || listing.owner.toString() === authUser._id);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16">
        <div className="max-w-6xl mx-auto px-4 py-6 md:py-10 space-y-6">
          <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {/* Display user name at top */}
              {user?.name && (
                <h1 className="text-4xl font-bold leading-tight mb-2">
                  {user.name}
                </h1>
              )}
              {!user?.name && (
                <h1 className="text-3xl font-bold leading-tight">
                  {unique_id ? 'User Profile' : 'My Profile'}
                </h1>
              )}
              {user?.unique_id && (
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm font-mono font-bold bg-muted px-3 py-1 rounded">
                    Unique ID: {user.unique_id}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyUniqueId}
                    className="h-7"
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )}
              <p className="text-sm text-muted-foreground" aria-live="polite">
                {unique_id ? 'Public profile' : 'Your account information and listings'}
              </p>
            </div>
            {authUser && !unique_id && (
              <Button variant="outline" onClick={handleRefresh} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>
            )}
          </header>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* User Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription>Your profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {user ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-semibold">{user.name || 'Not set'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-semibold">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={user.role === "admin" ? "destructive" : "default"}>
                        {user.role}
                      </Badge>
                    </div>
                    {user.membershipActive && (
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">Premium Member</Badge>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* User's Listings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                {unique_id ? 'User Listings' : 'Your Listings'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading && listings.length === 0 ? (
                <div className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <p className="text-muted-foreground">Loading listings...</p>
                </div>
              ) : listings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No listings yet</p>
                  {authUser && !unique_id && (
                    <Link to="/list-car">
                      <Button>List your first car</Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {listings.map((listing: any) => (
                    <Card key={listing._id} className="overflow-hidden">
                      <Link to={`/car/${listing._id}`}>
                        <div className="w-full h-48 bg-muted shrink-0 overflow-hidden">
                          <img
                            src={listing.images?.[0] || "/placeholder-car.png"}
                            alt={`${listing.brand} ${listing.model}`}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">
                            {listing.brand} {listing.model} ({listing.year})
                          </CardTitle>
                          <CardDescription>
                            PKR {listing.pricePerDay?.toLocaleString()}/day
                          </CardDescription>
                        </CardHeader>
                      </Link>
                      {/* Status Toggle - Owner/Admin Only */}
                      {isOwnerOrAdmin(listing) && (
                        <CardContent className="pt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Status:</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                toggleListingStatus(listing._id, listing.status || 'available');
                              }}
                              className="flex items-center gap-2"
                            >
                              {listing.status === 'rented' ? (
                                <>
                                  <ToggleRight className="h-4 w-4 text-red-500" />
                                  <span className="text-red-600">Rented</span>
                                </>
                              ) : (
                                <>
                                  <ToggleLeft className="h-4 w-4 text-green-500" />
                                  <span className="text-green-600">Available</span>
                                </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
