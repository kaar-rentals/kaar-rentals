import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, View } from 'react-native';
import { APP_NAME } from '../config/constants';
import { colors } from '../config/theme';
import { useAppFonts } from '../context/FontContext';

type Props = {
  visible: boolean;
  progress?: number;
};

export function LoadingOverlay({ visible, progress = 0 }: Props) {
  const { family } = useAppFonts();
  const opacity = useRef(new Animated.Value(1)).current;
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      opacity.setValue(1);
      return;
    }
    Animated.timing(opacity, {
      toValue: 0,
      duration: 280,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setMounted(false);
    });
  }, [visible, opacity]);

  if (!mounted) return null;

  const pct = Math.min(100, Math.round(progress * 100));

  return (
    <Animated.View
      style={[styles.overlay, { opacity }]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <View style={styles.card}>
        <View style={styles.logoBox}>
          <Ionicons name="car-sport" size={28} color={colors.white} />
        </View>
        <Text style={[styles.title, family.semiBold ? { fontFamily: family.semiBold } : null]}>
          {APP_NAME}
        </Text>
        <ActivityIndicator size="large" color={colors.accent} style={styles.spinner} />
        <Text style={[styles.hint, family.regular ? { fontFamily: family.regular } : null]}>
          {progress > 0 && progress < 1 ? `Loading… ${pct}%` : 'Loading your experience…'}
        </Text>
        {progress > 0 && progress < 1 ? (
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${pct}%` }]} />
          </View>
        ) : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    zIndex: 20,
  },
  card: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 28,
    maxWidth: 280,
  },
  logoBox: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  spinner: {
    marginTop: 20,
    marginBottom: 12,
  },
  hint: {
    fontSize: 14,
    color: colors.mutedForeground,
    textAlign: 'center',
  },
  progressTrack: {
    marginTop: 16,
    width: 200,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.muted,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
});
