// import React, { useState } from 'react';
// import { 
//   View, 
//   Text, 
//   TextInput, 
//   Pressable, 
//   KeyboardAvoidingView, 
//   Platform, 
//   ScrollView, 
//   TouchableOpacity,
//   Alert
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { Ionicons } from '@expo/vector-icons';

// const RegisterScreen = ({  }) => {
//   const [fullName, setFullName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   const handleRegister = async () => {
//     // Basic validation
//     if (password !== confirmPassword) {
//       Alert.alert('Error', 'Passwords do not match!');
//       return;
//     }
    
//     setLoading(true);
//     try {
//       // TODO: Implement actual registration logic
//       await new Promise(resolve => setTimeout(resolve, 1000));
//       console.log('Register with:', { fullName, email, password });
//     } catch (error) {
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <SafeAreaView className="flex-1 bg-emerald-50">
//       <KeyboardAvoidingView 
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         className="flex-1"
//       >
//         <ScrollView 
//           contentContainerClassName="flex-grow"
//           showsVerticalScrollIndicator={false}
//         >
//           <View className="flex-1 px-6 justify-center min-h-screen py-12">
//             {/* Logo Section */}
//             <View className="items-center mb-8">
//               <View className="bg-emerald-600 w-20 h-20 rounded-3xl items-center justify-center mb-6 shadow-lg shadow-emerald-600/20">
//                 <Text className="text-white text-2xl font-bold">D€OPAY</Text>
//               </View>
//               <Text className="text-3xl font-bold text-emerald-900">Create Account</Text>
//               <Text className="text-emerald-600 mt-2 text-base text-center">
//                 Sign up to get started with your account
//               </Text>
//             </View>

//             {/* Register Form Card */}
//             <View className="bg-white rounded-3xl p-6 shadow-xl shadow-black/5">
//               {/* Full Name Input */}
//               <View className="mb-4">
//                 <Text className="text-emerald-800 font-medium mb-2 ml-1">Full Name</Text>
//                 <View className="flex-row items-center bg-emerald-50 rounded-2xl px-4 py-1 border border-emerald-100">
//                   <Ionicons name="person-outline" size={20} color="#059669" />
//                   <TextInput
//                     className="flex-1 py-4 px-3 text-emerald-900 text-base"
//                     placeholder="Enter your full name"
//                     placeholderTextColor="#6b7280"
//                     value={fullName}
//                     onChangeText={setFullName}
//                     autoCapitalize="words"
//                   />
//                 </View>
//               </View>

//               {/* Email Input */}
//               <View className="mb-4">
//                 <Text className="text-emerald-800 font-medium mb-2 ml-1">Email Address</Text>
//                 <View className="flex-row items-center bg-emerald-50 rounded-2xl px-4 py-1 border border-emerald-100">
//                   <Ionicons name="mail-outline" size={20} color="#059669" />
//                   <TextInput
//                     className="flex-1 py-4 px-3 text-emerald-900 text-base"
//                     placeholder="Enter your email"
//                     placeholderTextColor="#6b7280"
//                     value={email}
//                     onChangeText={setEmail}
//                     keyboardType="email-address"
//                     autoCapitalize="none"
//                     autoCorrect={false}
//                   />
//                 </View>
//               </View>

//               {/* Password Input */}
//               <View className="mb-4">
//                 <Text className="text-emerald-800 font-medium mb-2 ml-1">Password</Text>
//                 <View className="flex-row items-center bg-emerald-50 rounded-2xl px-4 py-1 border border-emerald-100">
//                   <Ionicons name="lock-closed-outline" size={20} color="#059669" />
//                   <TextInput
//                     className="flex-1 py-4 px-3 text-emerald-900 text-base"
//                     placeholder="Create a password"
//                     placeholderTextColor="#6b7280"
//                     value={password}
//                     onChangeText={setPassword}
//                     secureTextEntry={!showPassword}
//                   />
//                   <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
//                     <Ionicons 
//                       name={showPassword ? "eye-outline" : "eye-off-outline"} 
//                       size={20} 
//                       color="#059669" 
//                     />
//                   </TouchableOpacity>
//                 </View>
//               </View>

//               {/* Confirm Password Input */}
//               <View className="mb-6">
//                 <Text className="text-emerald-800 font-medium mb-2 ml-1">Confirm Password</Text>
//                 <View className="flex-row items-center bg-emerald-50 rounded-2xl px-4 py-1 border border-emerald-100">
//                   <Ionicons name="lock-closed-outline" size={20} color="#059669" />
//                   <TextInput
//                     className="flex-1 py-4 px-3 text-emerald-900 text-base"
//                     placeholder="Confirm your password"
//                     placeholderTextColor="#6b7280"
//                     value={confirmPassword}
//                     onChangeText={setConfirmPassword}
//                     secureTextEntry={!showConfirmPassword}
//                   />
//                   <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
//                     <Ionicons 
//                       name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
//                       size={20} 
//                       color="#059669" 
//                     />
//                   </TouchableOpacity>
//                 </View>
//               </View>

//               {/* Terms and Conditions */}
//               <View className="mb-6">
//                 <Text className="text-emerald-600 text-sm text-center">
//                   By signing up, you agree to our{' '}
//                   <Text className="text-emerald-700 font-semibold">Terms of Service</Text>
//                   {' '}and{' '}
//                   <Text className="text-emerald-700 font-semibold">Privacy Policy</Text>
//                 </Text>
//               </View>

//               {/* Register Button */}
//               <Pressable 
//                 onPress={handleRegister}
//                 disabled={loading}
//                 className={`bg-emerald-600 rounded-2xl py-4 items-center ${loading ? 'opacity-70' : ''}`}
//               >
//                 <Text className="text-white font-semibold text-lg">
//                   {loading ? 'Creating Account...' : 'Create Account'}
//                 </Text>
//               </Pressable>
//             </View>

//             {/* Login Link */}
//             {/* <View className="flex-row justify-center mt-8">
//               <Text className="text-emerald-700">Already have an account? </Text>
//               <TouchableOpacity onPress={onSwitchToLogin}>
//                 <Text className="text-emerald-600 font-semibold">Sign In</Text>
//               </TouchableOpacity>
//             </View> */}
//           </View>
//         </ScrollView>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// };

// export default RegisterScreen;