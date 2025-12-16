import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Phone, Repeat2, Loader2, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const UserListingsPage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token") || undefined;
      const data = await apiService.getUserListings(token);
      setListings(data?.listings || []);
    } catch (err) {
      const message = err?.message || "Failed to load your listings";
      setError(message);
      toast({
        title: "Unable to load listings",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-10 space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Track how your cars are performing
          </p>
          <h1 className="text-3xl font-bold leading-tight">Your Listings</h1>
        </div>
        <Link to="/owner-profile" className="self-start">
          <Button variant="outline">← Back to dashboard</Button>
        </Link>
      </header>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2" role="status" aria-live="polite">
          {[1, 2, 3, 4].map((skeleton) => (
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
      ) : error ? (
        <Alert variant="destructive">
          <AlertDescription className="flex flex-col gap-3">
            <span>{error}</span>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={fetchListings}>
                Retry
              </Button>
              <Link to="/owner-profile">
                <Button size="sm" variant="outline">
                  Go to dashboard
                </Button>
              </Link>
            </div>
          </AlertDescription>
        </Alert>
      ) : listings.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center space-y-3">
            <h2 className="text-xl font-semibold">No listings yet</h2>
            <p className="text-sm text-muted-foreground">
              Once you list a car, you&apos;ll see performance stats here.
            </p>
            <Link to="/list-car">
              <Button>List your first car</Button>
            </Link>
          </CardContent>
        </Card>
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
                    <CardTitle className="flex items-start justify-between gap-2 text-lg">
                      <span className="line-clamp-2">{listing.title}</span>
                      <Badge variant="secondary" className="whitespace-nowrap">
                        Listing #{listing.id}
                      </Badge>
                    </CardTitle>
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
                          <p className="text-xs text-muted-foreground">Times rented</p>
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
                    <div className="flex items-center gap-2">
                      <Link
                        to={listing.ad_url || "/cars"}
                        className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                      >
                        View ad
                        <ExternalLink className="h-4 w-4 ml-1" />
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={fetchListings}
                        disabled={loading}
                      >
                        {loading && (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin text-muted-foreground" />
                        )}
                        Refresh stats
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserListingsPage;

