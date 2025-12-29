// frontend/src/contexts/SiteSettingsContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SiteSettings {
  listings_enabled: boolean;
}

interface SiteSettingsContextType {
  settings: SiteSettings | null;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://kaar-rentals-backend.onrender.com/api';

export const SiteSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/site-settings`);
      if (response.ok) {
        const data = await response.json();
        setSettings({
          listings_enabled: data.listings_enabled === true || data.listings_enabled === 'true'
        });
      } else {
        // Fallback to env variable
        const envEnabled = import.meta.env.VITE_LISTINGS_ENABLED === 'true';
        setSettings({ listings_enabled: envEnabled });
      }
    } catch (error) {
      console.error('Error fetching site settings:', error);
      // Fallback to env variable
      const envEnabled = import.meta.env.VITE_LISTINGS_ENABLED === 'true';
      setSettings({ listings_enabled: envEnabled });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext);
  if (context === undefined) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
};

