import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  // Sample data - replace with actual data from your backend
  const walletBalance = "$2100";
  const userName = "Satvik";

  const actions = [
    { id: 1, name: 'Pay', icon: 'card-outline' },
    { id: 2, name: 'Request', icon: 'arrow-down-outline' },
    { id: 3, name: 'Add Money', icon: 'add-circle-outline' },
    { id: 4, name: 'Passbook', icon: 'book-outline' },
  ];

  const services = [
    { id: 1, name: 'Virtual Banking', icon: 'globe-outline', color: '#059669' },
    { id: 2, name: 'Virtual Bank', icon: 'business-outline', color: '#0891b2' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-emerald-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-4">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-emerald-900 text-2xl font-bold">Hello {userName},</Text>
              <Text className="text-emerald-600">What would you like to do today?</Text>
            </View>
            <View className="w-12 h-12 rounded-full bg-emerald-600 items-center justify-center">
              <Text className="text-white text-xl font-bold">{userName.charAt(0)}</Text>
            </View>
          </View>

          {/* Wallet Balance Card */}
          <View className="bg-emerald-600 rounded-3xl p-6 mb-6 shadow-lg">
            <Text className="text-emerald-100 mb-2">Wallet Balance</Text>
            <Text className="text-white text-4xl font-bold">{walletBalance}</Text>
          </View>

          {/* Quick Actions */}
          <View className="flex-row justify-between mb-8">
            {actions.map((action) => (
              <Pressable 
                key={action.id} 
                className="items-center"
                onPress={() => console.log(`${action.name} pressed`)}
              >
                <View className="bg-white w-14 h-14 rounded-2xl items-center justify-center mb-2 shadow-sm">
                  <Ionicons name={action.icon as any} size={24} color="#059669" />
                </View>
                <Text className="text-emerald-700 text-sm">{action.name}</Text>
              </Pressable>
            ))}
          </View>

          {/* Services Section */}
          <Text className="text-emerald-900 text-lg font-semibold mb-4">Services</Text>
          <View className="space-y-4">
            {services.map((service) => (
              <Pressable 
                key={service.id}
                className="bg-white rounded-2xl p-4 flex-row items-center shadow-sm"
                onPress={() => console.log(`${service.name} pressed`)}
              >
                <View 
                  className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                  style={{ backgroundColor: service.color + '20' }}
                >
                  <Ionicons name={service.icon as any} size={24} color={service.color} />
                </View>
                <Text className="text-emerald-800 font-medium text-lg">{service.name}</Text>
              </Pressable>
            ))}
          </View>

          {/* Recent Transactions Section (Optional) */}
          <View className="mt-8">
            <Text className="text-emerald-900 text-lg font-semibold mb-4">Recent Transactions</Text>
            <View className="bg-white rounded-2xl p-4">
              <Text className="text-emerald-600 text-center">No recent transactions</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}