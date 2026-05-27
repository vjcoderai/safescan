import 'react-native-gesture-handler';
import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FolderOpen, Wrench, Settings, ScanLine } from 'lucide-react-native';

import LibraryScreen  from './src/screens/LibraryScreen';
import ToolsScreen    from './src/screens/ToolsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ScanScreen     from './src/screens/ScanScreen';
import EditScreen     from './src/screens/EditScreen';
import ViewerScreen   from './src/screens/ViewerScreen';

import { C, S, shadowAccent } from './src/constants/theme';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function FAB({ onPress }) {
  return (
    <TouchableOpacity style={styles.fab} onPress={onPress} activeOpacity={0.85}>
      <ScanLine size={25} color={C.bg} strokeWidth={2.5} />
    </TouchableOpacity>
  );
}

function Tabs({ navigation }) {
  const tabIcon = (name, color, focused) => {
    const Icon = { Library: FolderOpen, Tools: Wrench, SettingsTab: Settings }[name] || FolderOpen;
    return <Icon size={22} color={color} strokeWidth={focused ? 2.5 : 1.8} />;
  };
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: C.accent,
        tabBarInactiveTintColor: C.t3,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ color, focused }) => tabIcon(route.name, color, focused),
      })}
    >
      <Tab.Screen name="Library" component={LibraryScreen} />
      <Tab.Screen
        name="ScanFAB"
        component={LibraryScreen}
        options={{
          tabBarLabel: () => null,
          tabBarButton: () => <FAB onPress={() => navigation.navigate('Scan')} />,
        }}
      />
      <Tab.Screen name="Tools" component={ToolsScreen} />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{ tabBarLabel: 'Settings' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={Tabs} />
        <Stack.Screen name="Scan" component={ScanScreen} options={{ animation: 'slide_from_bottom', presentation: 'fullScreenModal' }} />
        <Stack.Screen name="Edit" component={EditScreen} options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="Viewer" component={ViewerScreen} options={{ animation: 'slide_from_right' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: C.card,
    borderTopColor: C.border,
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 86 : 62,
    paddingBottom: Platform.OS === 'ios' ? 26 : 6,
    paddingTop: 8,
  },
  tabLabel: { fontSize: 10, fontWeight: '600' },
  fab: {
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: C.accent,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Platform.OS === 'ios' ? 14 : 6,
    ...shadowAccent,
  },
});
