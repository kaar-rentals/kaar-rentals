import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { APP_NAME, APP_TAGLINE } from './src/config/constants';
import { colors } from './src/config/theme';
import { FontProvider, useAppFonts } from './src/context/FontContext';
import { RootNavigator } from './src/navigation/RootNavigator';

let splashPrevented = false;

async function ensureSplashHidden() {
  try {
    if (!splashPrevented) {
      await SplashScreen.preventAutoHideAsync();
      splashPrevented = true;
    }
    await SplashScreen.hideAsync();
  } catch (error) {
    console.warn('[App] SplashScreen:', error);
  }
}

function BootScreen() {
  return (
    <View style={styles.boot}>
      <View style={styles.logoMark}>
        <Text style={styles.logoEmoji}>🚗</Text>
      </View>
      <Text style={styles.bootTitle}>{APP_NAME}</Text>
      <Text style={styles.bootTagline}>{APP_TAGLINE}</Text>
      <ActivityIndicator size="large" color={colors.accent} style={styles.spinner} />
      <StatusBar style="dark" />
    </View>
  );
}

function AppContent() {
  const { ready } = useAppFonts();
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    if (ready) {
      setAppReady(true);
      ensureSplashHidden();
    }
  }, [ready]);

  if (!appReady) {
    return <BootScreen />;
  }

  return (
    <>
      <RootNavigator />
      <StatusBar style="dark" />
    </>
  );
}

export default function App() {
  const [reloadKey, setReloadKey] = useState(0);

  const handleRetry = useCallback(() => {
    setReloadKey((k) => k + 1);
  }, []);

  return (
    <ErrorBoundary onRetry={handleRetry}>
      <SafeAreaProvider key={reloadKey}>
        <FontProvider>
          <AppContent />
        </FontProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 32,
  },
  logoMark: {
    width: 88,
    height: 88,
    borderRadius: 20,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoEmoji: {
    fontSize: 40,
  },
  bootTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -0.5,
  },
  bootTagline: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '400',
    color: colors.mutedForeground,
  },
  spinner: {
    marginTop: 32,
  },
});
