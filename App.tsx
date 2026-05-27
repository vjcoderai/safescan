import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import LibraryScreen from './src/screens/LibraryScreen';
import ScanScreen from './src/screens/ScanScreen';
import ToolsScreen from './src/screens/ToolsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen name="Library" component={LibraryScreen} />
        <Tab.Screen name="Scan" component={ScanScreen} />
        <Tab.Screen name="Tools" component={ToolsScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
