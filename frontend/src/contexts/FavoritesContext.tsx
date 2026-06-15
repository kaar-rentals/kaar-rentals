import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService, Car } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { normalizeCar } from '@/lib/normalizeCar';

interface FavoritesContextType {
  likedIds: Set<string>;
  likedCars: Car[];
  loadingLikes: boolean;
  isLiked: (carId: string) => boolean;
  toggleLike: (carId: string) => Promise<boolean>;
  refreshLikes: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [likedCars, setLikedCars] = useState<Car[]>([]);
  const [loadingLikes, setLoadingLikes] = useState(false);

  const refreshLikes = useCallback(async () => {
    if (!token) {
      setLikedIds(new Set());
      setLikedCars([]);
      return;
    }

    try {
      setLoadingLikes(true);
      const [ids, cars] = await Promise.all([
        apiService.getLikedCarIds(token),
        apiService.getLikedCars(token),
      ]);
      setLikedIds(new Set(ids));
      setLikedCars(cars);
    } catch {
      setLikedIds(new Set());
      setLikedCars([]);
    } finally {
      setLoadingLikes(false);
    }
  }, [token]);

  useEffect(() => {
    refreshLikes();
  }, [refreshLikes]);

  const isLiked = useCallback(
    (carId: string) => likedIds.has(carId),
    [likedIds]
  );

  const toggleLike = useCallback(
    async (carId: string) => {
      if (!token) {
        toast({
          title: 'Sign in required',
          description: 'Please sign in to save liked listings to your profile.',
        });
        navigate('/auth');
        return false;
      }

      const currentlyLiked = likedIds.has(carId);

      try {
        if (currentlyLiked) {
          await apiService.unlikeCar(carId, token);
          setLikedIds((prev) => {
            const next = new Set(prev);
            next.delete(carId);
            return next;
          });
          setLikedCars((prev) => prev.filter((car) => car._id !== carId));
          return false;
        }

        await apiService.likeCar(carId, token);
        setLikedIds((prev) => new Set(prev).add(carId));

        try {
          const car = await apiService.getCarById(carId);
          setLikedCars((prev) => {
            if (prev.some((item) => item._id === carId)) return prev;
            return [car, ...prev];
          });
        } catch {
          await refreshLikes();
        }

        return true;
      } catch (error) {
        toast({
          title: 'Could not update like',
          description:
            error instanceof Error ? error.message : 'Please try again.',
          variant: 'destructive',
        });
        return currentlyLiked;
      }
    },
    [token, likedIds, toast, navigate, refreshLikes]
  );

  const value = useMemo(
    () => ({
      likedIds,
      likedCars,
      loadingLikes,
      isLiked,
      toggleLike,
      refreshLikes,
    }),
    [likedIds, likedCars, loadingLikes, isLiked, toggleLike, refreshLikes]
  );

  return (
    <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
