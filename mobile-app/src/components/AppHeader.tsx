import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { APP_NAME } from '../config/constants';
import { colors, layout } from '../config/theme';
import { useAppFonts } from '../context/FontContext';

type Props = {
  canGoBack: boolean;
  onBackPress: () => void;
  title?: string;
};

export function AppHeader({ canGoBack, onBackPress, title }: Props) {
  const insets = useSafeAreaInsets();
  const { family } = useAppFonts();

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top }]}>
      <View style={styles.row}>
        {canGoBack ? (
          <Pressable
            onPress={onBackPress}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={12}
          >
            <Ionicons name="arrow-back" size={22} color={colors.foreground} />
          </Pressable>
        ) : (
          <View style={styles.backPlaceholder} />
        )}

        <View style={styles.brand}>
          <View style={styles.logoBox}>
            <Ionicons name="car-sport" size={20} color={colors.white} />
          </View>
          <Text
            style={[styles.brandText, family.bold ? { fontFamily: family.bold } : null]}
            numberOfLines={1}
          >
            {title ?? APP_NAME}
          </Text>
        </View>

        <View style={styles.backPlaceholder} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  row: {
    height: layout.headerHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  backPlaceholder: {
    width: 40,
  },
  brand: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  logoBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -0.4,
  },
});
