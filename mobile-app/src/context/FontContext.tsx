import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { createContext, useContext, type ReactNode } from 'react';

type FontContextValue = {
  ready: boolean;
  family: {
    regular?: string;
    medium?: string;
    semiBold?: string;
    bold?: string;
  };
};

const FontContext = createContext<FontContextValue>({
  ready: false,
  family: {},
});

export function FontProvider({ children }: { children: ReactNode }) {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const ready = loaded || !!error;

  const family = loaded
    ? {
        regular: 'Inter_400Regular',
        medium: 'Inter_500Medium',
        semiBold: 'Inter_600SemiBold',
        bold: 'Inter_700Bold',
      }
    : {};

  if (error) {
    console.warn('[FontProvider] Inter fonts failed, using system fonts:', error);
  }

  return (
    <FontContext.Provider value={{ ready, family }}>{children}</FontContext.Provider>
  );
}

export function useAppFonts() {
  return useContext(FontContext);
}
