import { Ionicons } from '@expo/vector-icons';
import { Linking, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WHATSAPP_MESSAGE, WHATSAPP_URL } from '../config/constants';
import { colors, layout } from '../config/theme';

export function FloatingWhatsApp() {
  const insets = useSafeAreaInsets();
  const bottomOffset = layout.tabBarHeight + insets.bottom + 12;

  const openWhatsApp = () => {
    const url = `${WHATSAPP_URL}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
    Linking.openURL(url);
  };

  return (
    <Pressable
      onPress={openWhatsApp}
      style={[styles.fab, { bottom: bottomOffset }]}
      accessibilityRole="button"
      accessibilityLabel="Chat on WhatsApp"
    >
      <Ionicons name="logo-whatsapp" size={28} color={colors.white} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.whatsapp,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 100,
  },
});
