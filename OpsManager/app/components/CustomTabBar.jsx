// app/components/CustomTabBar.jsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const router = useRouter();
  const pathname = usePathname();
  
  // Determine if we're in client or tech section
  const isClient = pathname.includes('/client/');
  const baseRoute = isClient ? '/(app)/client/' : '/(app)/technician/';
  console.log('Current pathname:', pathname);
  console.log('Base route:', baseRoute);

  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        // Custom logic for center "add" button
        const isAddButton = route.name === 'add';

        let iconName;
        if (route.name === 'home') {
          iconName = 'home';
        } else if (route.name === 'search') {
          iconName = 'search';
        } else if (route.name === 'add') {
          iconName = 'add';
        } else if (route.name === 'history') {
          iconName = 'time';
        } else if (route.name === 'profile') {
          iconName = 'person';
        }

        const onPress = () => {
          router.push(baseRoute + route.name);
        };

        if (isAddButton) {
          return (
            <TouchableOpacity
              key={index}
              style={styles.addButton}
              onPress={onPress}
            >
              <Ionicons name="add" size={30} color="#FFF" />
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={index}
            style={styles.tabButton}
            onPress={onPress}
          >
            <Ionicons
              name={iconName}
              size={24}
              color={isFocused ? '#8A2BE2' : '#888'}
            />
            <Text style={[
              styles.tabLabel,
              { color: isFocused ? '#8A2BE2' : '#888' }
            ]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 30,
    marginHorizontal: 20,
    marginBottom: 20,
    height: 60,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#8A2BE2',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default CustomTabBar;