import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  BackHandler,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { WebView, type WebViewNavigation } from 'react-native-webview';
import { WEBSITE_BASE_URL } from '../config/constants';
import { colors } from '../config/theme';
import { useAppFonts } from '../context/FontContext';
import { INJECT_MOBILE_CSS } from '../utils/injectCss';
import { shouldOpenExternally } from '../utils/linking';
import { LoadingOverlay } from './LoadingOverlay';

export type AppWebViewHandle = {
  goBack: () => void;
  reload: () => void;
  canGoBack: () => boolean;
};

type Props = {
  path: string;
  onNavigationStateChange?: (state: { canGoBack: boolean; url: string }) => void;
};

const LOADING_TIMEOUT_MS = 25_000;
const HOME_URI = 'https://kaar.rentals';

/** Mobile Chrome UA — triggers mobile layout on kaar.rentals */
const MOBILE_USER_AGENT =
  'Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36';

const ORIGIN_WHITELIST = ['https://*'];

export const AppWebView = forwardRef<AppWebViewHandle, Props>(function AppWebView(
  { path, onNavigationStateChange },
  ref,
) {
  const { family } = useAppFonts();
  const webViewRef = useRef<WebView>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadFinishedRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [canGoBack, setCanGoBack] = useState(false);

  const uri = path === '/' ? HOME_URI : `${WEBSITE_BASE_URL}${path}`;

  const clearLoadingTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const finishLoading = useCallback(() => {
    clearLoadingTimeout();
    loadFinishedRef.current = true;
    setLoadProgress(1);
    setLoading(false);
  }, [clearLoadingTimeout]);

  const startLoadingTimeout = useCallback(() => {
    clearLoadingTimeout();
    loadFinishedRef.current = false;
    timeoutRef.current = setTimeout(() => {
      if (!loadFinishedRef.current) {
        console.warn('[AppWebView] Timeout:', uri);
        setLoading(false);
        setLoadError('Check your internet connection and try again.');
      }
    }, LOADING_TIMEOUT_MS);
  }, [clearLoadingTimeout, uri]);

  const goBack = useCallback(() => {
    webViewRef.current?.goBack();
  }, []);

  const reload = useCallback(() => {
    setLoadError(null);
    setLoading(true);
    setLoadProgress(0);
    loadFinishedRef.current = false;
    startLoadingTimeout();
    webViewRef.current?.reload();
  }, [startLoadingTimeout]);

  useImperativeHandle(ref, () => ({
    goBack,
    reload,
    canGoBack: () => canGoBack,
  }));

  useEffect(() => {
    setLoadProgress(0);
    setLoading(true);
    startLoadingTimeout();
    return clearLoadingTimeout;
  }, [uri, startLoadingTimeout, clearLoadingTimeout]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack) {
        goBack();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [canGoBack, goBack]);

  const handleLoadStart = () => {
    setLoadError(null);
    setLoading(true);
    setLoadProgress(0.05);
    loadFinishedRef.current = false;
    startLoadingTimeout();
  };

  const handleLoadProgress = ({ nativeEvent }: { nativeEvent: { progress: number } }) => {
    setLoadProgress(nativeEvent.progress);
  };

  const handleLoadEnd = () => {
    finishLoading();
  };

  const handleNavChange = (navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack);
    onNavigationStateChange?.({ canGoBack: navState.canGoBack, url: navState.url });
  };

  const titleStyle = family.semiBold
    ? [styles.errorTitle, { fontFamily: family.semiBold }]
    : styles.errorTitle;
  const messageStyle = family.regular
    ? [styles.errorMessage, { fontFamily: family.regular }]
    : styles.errorMessage;

  if (loadError) {
    return (
      <View style={styles.container}>
        <View style={styles.errorBox}>
          <Text style={titleStyle}>Could not load Kaar.Rentals</Text>
          <Text style={messageStyle}>{loadError}</Text>
          <Pressable style={styles.retryButton} onPress={reload}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri }}
        style={[styles.webview, loading && styles.webviewLoading]}
        userAgent={MOBILE_USER_AGENT}
        originWhitelist={ORIGIN_WHITELIST}
        // Cache & session — faster repeat visits
        cacheEnabled
        incognito={false}
        cacheMode={Platform.OS === 'android' ? 'LOAD_CACHE_ELSE_NETWORK' : undefined}
        sharedCookiesEnabled
        // JavaScript & storage
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        // Media
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        // Layout & rendering performance
        scalesPageToFit={false}
        androidLayerType="hardware"
        renderToHardwareTextureAndroid
        overScrollMode="never"
        nestedScrollEnabled
        decelerationRate="normal"
        textZoom={100}
        // Security & windows
        setSupportMultipleWindows={false}
        geolocationEnabled={false}
        allowFileAccess={false}
        // UI chrome
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        // Single lightweight CSS inject after DOM ready
        injectedJavaScript={INJECT_MOBILE_CSS}
        onLoadStart={handleLoadStart}
        onLoadProgress={handleLoadProgress}
        onLoadEnd={handleLoadEnd}
        onError={() => {
          finishLoading();
          setLoadError('Check your internet connection and try again.');
        }}
        onHttpError={(e) => {
          if (e.nativeEvent.statusCode >= 400) {
            finishLoading();
            setLoadError('Check your internet connection and try again.');
          }
        }}
        onNavigationStateChange={handleNavChange}
        onShouldStartLoadWithRequest={(request) => {
          const { url } = request;
          if (!url || url === 'about:blank') return true;
          if (shouldOpenExternally(url)) {
            Linking.openURL(url).catch(console.warn);
            return false;
          }
          return true;
        }}
      />
      <LoadingOverlay visible={loading} progress={loadProgress} />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  webview: {
    flex: 1,
    backgroundColor: colors.background,
    opacity: 1,
  },
  webviewLoading: {
    opacity: 0,
  },
  errorBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 15,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  retryText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primaryForeground,
  },
});
