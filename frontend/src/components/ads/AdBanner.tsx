import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

interface AdBannerProps {
  slot?: string;
  className?: string;
}

/**
 * Google AdSense responsive banner.
 *
 * Notes:
 * - Requires the AdSense script in index.html (already added).
 * - Set VITE_ADSENSE_CLIENT (optional override) and VITE_ADSENSE_SLOT_HOME in your env
 *   or pass `slot` prop directly.
 */
const AdBanner: React.FC<AdBannerProps> = ({ slot, className }) => {
  const adRef = useRef<HTMLModElement | null>(null);

  const client =
    import.meta.env.VITE_ADSENSE_CLIENT || 'ca-pub-7321884904800296';
  const adSlot = slot || import.meta.env.VITE_ADSENSE_SLOT_HOME;

  useEffect(() => {
    if (!adRef.current) return;
    if (!client || !adSlot) {
      // Missing configuration, don't try to load ads
      return;
    }

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Fail silently in case AdSense is blocked or not ready
    }
  }, [client, adSlot]);

  // If not configured yet, render nothing to avoid layout issues
  if (!client || !adSlot) return null;

  return (
    <div className={className}>
      <ins
        ref={adRef as any}
        className="adsbygoogle block"
        style={{ display: 'block' }}
        data-ad-client={client}
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdBanner;

