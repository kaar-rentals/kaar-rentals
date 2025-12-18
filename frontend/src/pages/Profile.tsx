import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Calendar, Eye, Phone, Repeat2, Loader2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiService } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const Profile = () => {
  const { user: authUser, token } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    if (!authUser || !token) {
      navigate("/auth");
      return;
    }
    fetchProfile();
    fetchListings();

    // Poll every 5 seconds
    const interval = setInterval(() => {
      fetchListings();
    }, 5000);

    return () => clearInterval(interval);
  }, [authUser, token, navigate]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/auth");
        return;
      }

      const url = import.meta.env.VITE_API_URL 
        ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/auth/me` 
        : '/api/auth/me';
      
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          navigate("/auth");
          return;
        }
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      if (data.user) {
        setUser(data.user);
      } else {
        // User not authenticated
        navigate("/auth");
        return;
      }
    } catch (err: any) {
      console.error("Error fetching profile:", err);
      setError(err?.message || "Failed to load profile");
    }
  };

  const fetchListings = async () => {
    try {
      setError("");
      const token = localStorage.getItem("token");
      if (!token) return;

      const data = await apiService.getUserListings(token);
      setListings(data?.listings || []);
      setLastUpdated(new Date());
    } catch (err: any) {
      const message = err?.message || "Failed to load listings";
      setError(message);
      console.error("Error fetching listings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchProfile();
    fetchListings();
  };

  if (!authUser) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16">
        <div className="max-w-6xl mx-auto px-4 py-6 md:py-10 space-y-6">
          <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold leading-tight">Profile</h1>
              <p className="text-sm text-muted-foreground" aria-live="polite">
                Your account information and listing performance
              </p>
            </div>
            <Button variant="outline" onClick={handleRefresh} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
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
                        <p className="font-semibold">{user.name}</p>
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

          {/* Listings Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Your Listings Performance
              </CardTitle>
              <CardDescription>
                {lastUpdated && (
                  <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading && listings.length === 0 ? (
                <div className="grid gap-4 md:grid-cols-2" role="status" aria-live="polite">
                  {[1, 2].map((skeleton) => (
                    <Card key={skeleton} className="border-dashed">
                      <CardContent className="p-6 space-y-4">
                        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-48 bg-muted animate-pulse rounded" />
                        <div className="grid grid-cols-3 gap-3">
                          {[1, 2, 3].map((item) => (
                            <div key={item} className="h-3 bg-muted animate-pulse rounded" />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : listings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No listings yet</p>
                  <Link to="/list-car">
                    <Button>List your first car</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {listings.map((listing) => (
                    <Card key={listing.id} className="overflow-hidden">
                      <div className="flex">
                        <div className="w-32 h-28 bg-muted shrink-0 overflow-hidden">
                          <img
                            src={listing.image_url || "/placeholder-car.png"}
                            alt={listing.title || "Listed car"}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="flex-1">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">{listing.title}</CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0 space-y-3">
                            <div className="grid grid-cols-3 gap-3 text-sm">
                              <div className="flex items-center gap-2">
                                <Eye className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Views</p>
                                  <p className="font-semibold">{listing.views ?? 0}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Repeat2 className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Rented</p>
                                  <p className="font-semibold">{listing.rented_count ?? 0}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Contacts</p>
                                  <p className="font-semibold">{listing.contact_count ?? 0}</p>
                                </div>
                              </div>
                            </div>
                            <Link
                              to={listing.ad_url || "/cars"}
                              className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                            >
                              View ad →
                            </Link>
                          </CardContent>
                        </div>
                      </div>
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

