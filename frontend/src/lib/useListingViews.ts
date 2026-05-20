import { useEffect } from 'react';
import socket from '@/lib/socket';

export type ViewUpdatePayload = {
  carId: string;
  viewCount: number;
  owner_unique_id?: string | null;
};

/** Subscribe to real-time listing view count updates */
export function useListingViews(
  onViewUpdate: (payload: ViewUpdatePayload) => void,
  enabled = true
) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (payload: ViewUpdatePayload) => {
      if (payload?.carId) onViewUpdate(payload);
    };

    socket.on('listing:view', handler);
    return () => {
      socket.off('listing:view', handler);
    };
  }, [enabled, onViewUpdate]);
}
