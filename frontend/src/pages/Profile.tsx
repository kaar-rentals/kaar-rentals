import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { User, Mail, Calendar, Eye, Phone, Repeat2, Loader2, RefreshCw, Copy, Check, ToggleLeft, ToggleRight, Edit2, Save, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [priceForm, setPriceForm] = useState({ price: '', priceType: 'daily' });

  // Handle /profile/me route
  useEffect(() => {
    if (!unique_id && authUser) {
      // If no unique_id and user is authenticated, fetch their own profile
      fetchProfile();
      fetchListings();
    } else if (unique_id) {
      // Fetch profile by unique_id
      fetchProfile();
      fetchListings();
    } else if (!authUser) {
      // Not authenticated and no unique_id, show error or redirect
      setError('Please sign in to view your profile');
      setLoading(false);
    }
  }, [unique_id, authUser]);

  // Refetch listings when authUser changes
  useEffect(() => {
    if (authUser && user) {
      fetchListings();
    }
  }, [authUser]);

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
      } else if (authUser && token) {
        // Fetch authenticated user's own profile via /api/user/me
        const response = await fetch(`${API_BASE_URL}/user/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
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
      
      // Fetch listings by owner unique_id with cache-busting
      const ownerId = user.unique_id || user._id;
      const timestamp = Date.now();
      const response = await fetch(`${API_BASE_URL}/cars?owner_unique_id=${ownerId}&limit=12&_t=${timestamp}`, {
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

  const handleEditPrice = (listing: any) => {
    setEditingPrice(listing._id);
    setPriceForm({
      price: String(listing.pricePerDay || listing.price || ''),
      priceType: listing.priceType || 'daily'
    });
  };

  const handleSavePrice = async (listingId: string) => {
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to update listing price",
        variant: "destructive",
      });
      return;
    }

    const priceNum = Number(priceForm.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast({
        title: "Invalid Price",
        description: "Price must be a positive number",
        variant: "destructive",
      });
      return;
    }

    // Optimistic update
    const originalListing = listings.find((l: any) => l._id === listingId);
    setListings((prevListings: any[]) =>
      prevListings.map((listing: any) =>
        listing._id === listingId
          ? { ...listing, pricePerDay: priceNum, price: priceNum, priceType: priceForm.priceType }
          : listing
      )
    );

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://kaar-rentals-backend.onrender.com/api';
      const response = await fetch(`${API_BASE_URL}/cars/${listingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ price: priceNum, priceType: priceForm.priceType }),
      });

      if (response.ok) {
        const updatedListing = await response.json();
        setListings((prevListings: any[]) =>
          prevListings.map((listing: any) =>
            listing._id === listingId ? updatedListing : listing
          )
        );
        setEditingPrice(null);
        toast({
          title: "Price Updated",
          description: "Listing price has been updated successfully",
        });
      } else {
        // Rollback on error
        if (originalListing) {
          setListings((prevListings: any[]) =>
            prevListings.map((listing: any) =>
              listing._id === listingId ? originalListing : listing
            )
          );
        }
        throw new Error('Failed to update price');
      }
    } catch (err: any) {
      toast({
        title: "Update Failed",
        description: err.message || "Failed to update listing price",
        variant: "destructive",
      });
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

    const newStatus = currentStatus === 'rented' ? 'available' : 'rented';
    
    // Optimistic update
    setListings((prevListings: any[]) =>
      prevListings.map((listing: any) =>
        listing._id === listingId
          ? { ...listing, status: newStatus }
          : listing
      )
    );

    try {
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
        const updatedListing = await response.json();
        // Update with server response
        setListings((prevListings: any[]) =>
          prevListings.map((listing: any) =>
            listing._id === listingId ? updatedListing : listing
          )
        );
        toast({
          title: "Status Updated",
          description: `Listing marked as ${newStatus}`,
        });
      } else {
        // Rollback on error
        setListings((prevListings: any[]) =>
          prevListings.map((listing: any) =>
            listing._id === listingId
              ? { ...listing, status: currentStatus }
              : listing
          )
        );
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

  const handleEditProfile = () => {
    if (user) {
      setEditForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
      setIsEditing(true);
    }
  };

  const handleSaveProfile = async () => {
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to edit your profile",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://kaar-rentals-backend.onrender.com/api';
      const response = await fetch(`${API_BASE_URL}/user/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to update profile' }));
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const data = await response.json();
      setUser(data.user);
      setIsEditing(false);
      
      // Update auth context if available
      if (authUser && authUser._id === data.user._id) {
        // Trigger refresh of auth context
        window.location.reload(); // Simple approach - could use context refresh instead
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
    } catch (err: any) {
      toast({
        title: "Update Failed",
        description: err.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({ name: '', email: '', phone: '' });
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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Account Information
                  </CardTitle>
                  <CardDescription>Your profile details</CardDescription>
                </div>
                {authUser && !unique_id && !isEditing && (
                  <Button variant="outline" size="sm" onClick={handleEditProfile}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {user ? (
                <>
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-name">Name</Label>
                        <Input
                          id="edit-name"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          placeholder="Your name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-email">Email</Label>
                        <Input
                          id="edit-email"
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          placeholder="your@email.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-phone">Phone</Label>
                        <Input
                          id="edit-phone"
                          type="tel"
                          value={editForm.phone}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          placeholder="+92 300 1234567"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleSaveProfile} disabled={saving}>
                          {saving ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Save
                            </>
                          )}
                        </Button>
                        <Button variant="outline" onClick={handleCancelEdit}>
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
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
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p className="font-semibold">{user.phone || 'Not set'}</p>
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
                  )}
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
                      {/* Status Badge and Toggle - Owner/Admin Only */}
                      <CardContent className="pt-2 space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge 
                            variant={listing.status === 'rented' ? 'destructive' : 'default'}
                            className={listing.status === 'rented' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}
                          >
                            {listing.status === 'rented' ? 'Rented' : 'Available'}
                          </Badge>
                          {isOwnerOrAdmin(listing) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                toggleListingStatus(listing._id, listing.status || 'available');
                              }}
                              className="flex items-center gap-2"
                            >
                              Change status
                            </Button>
                          )}
                        </div>
                      </CardContent>
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
