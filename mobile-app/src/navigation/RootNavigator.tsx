import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { StyleSheet, View } from 'react-native';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { FloatingWhatsApp } from '../components/FloatingWhatsApp';
import { colors, layout } from '../config/theme';
import { useAppFonts } from '../context/FontContext';
import { CarsScreen, HomeScreen, ProfileScreen } from '../screens/WebTabScreen';

export type RootTabParamList = {
  Home: undefined;
  Cars: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.accent,
    background: colors.background,
    card: colors.background,
    text: colors.foreground,
    border: colors.border,
  },
};

function TabIcon({
  name,
  focused,
}: {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
}) {
  return (
    <Ionicons
      name={name}
      size={24}
      color={focused ? colors.accent : colors.mutedForeground}
    />
  );
}

function TabNavigator() {
  const { family } = useAppFonts();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        lazy: true,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: family.medium
          ? { ...styles.tabLabel, fontFamily: family.medium }
          : styles.tabLabel,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'home' : 'home-outline'} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Cars"
        component={CarsScreen}
        options={{
          tabBarLabel: 'Browse Cars',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'car-sport' : 'car-sport-outline'} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'My Profile',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'person' : 'person-outline'} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <ErrorBoundary>
        <View style={styles.root}>
          <TabNavigator />
          <FloatingWhatsApp />
        </View>
      </ErrorBoundary>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  tabBar: {
    height: layout.tabBarHeight,
    paddingTop: 6,
    paddingBottom: 8,
    backgroundColor: colors.background,
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    elevation: 12,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
});
