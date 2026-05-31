import { useCallback, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppHeader } from '../components/AppHeader';
import { AppWebView, type AppWebViewHandle } from '../components/AppWebView';
import { ROUTES } from '../config/constants';
import { colors } from '../config/theme';

type Props = {
  path: string;
  title?: string;
};

export function WebTabScreen({ path, title }: Props) {
  const webRef = useRef<AppWebViewHandle>(null);
  const [canGoBack, setCanGoBack] = useState(false);

  const handleNavigationChange = useCallback(
    (state: { canGoBack: boolean; url: string }) => {
      setCanGoBack(state.canGoBack);
      console.log('[WebTabScreen]', title ?? 'Home', '→', state.url);
    },
    [title],
  );

  const handleBackPress = useCallback(() => {
    webRef.current?.goBack();
  }, []);

  return (
    <View style={styles.screen}>
      <AppHeader canGoBack={canGoBack} onBackPress={handleBackPress} title={title} />
      <View style={styles.webviewContainer}>
        <AppWebView
          ref={webRef}
          path={path}
          onNavigationStateChange={handleNavigationChange}
        />
      </View>
    </View>
  );
}

export function HomeScreen() {
  return <WebTabScreen path={ROUTES.home} />;
}

export function CarsScreen() {
  return <WebTabScreen path={ROUTES.cars} title="Browse Cars" />;
}

export function ProfileScreen() {
  return <WebTabScreen path={ROUTES.profile} title="My Profile" />;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  webviewContainer: {
    flex: 1,
    minHeight: 0,
  },
});
