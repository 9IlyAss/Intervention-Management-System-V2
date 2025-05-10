import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

// Auth navigation types
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AuthStackNavigationProp = StackNavigationProp<AuthStackParamList>;

export interface AuthNavigationProps {
  navigation: AuthStackNavigationProp;
  onLogin?: () => void;
}

// Main navigation types
export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Add: undefined;
  History: undefined;
  Profile: undefined;
};

export type MainTabNavigationProp = BottomTabNavigationProp<MainTabParamList>;

export interface MainNavigationProps {
  navigation: MainTabNavigationProp;
  onLogout?: () => void;
}

// App navigation props
export interface AuthNavigatorProps {
  onLogin: () => void;
}

export interface MainNavigatorProps {
  onLogout: () => void;
}

// Custom tab bar props
export interface TabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}