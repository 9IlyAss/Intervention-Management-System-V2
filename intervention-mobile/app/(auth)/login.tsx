// import React, { useState } from 'react';
// import { 
//   View, 
//   Text, 
//   TextInput, 
//   Pressable, 
//   KeyboardAvoidingView, 
//   Platform, 
//   ScrollView, 
//   TouchableOpacity 
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { Ionicons } from '@expo/vector-icons';

// const LoginScreen = ({ onSwitchToRegister, onForgotPassword }) => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   const handleLogin = async () => {
//     setLoading(true);
//     try {
//       // TODO: Implement actual login logic
//       await new Promise(resolve => setTimeout(resolve, 1000));
//       console.log('Login with:', { email, password });
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
//           <View className="flex-1 px-6 justify-center min-h-screen">
//             {/* Logo Section */}
//             <View className="items-center mb-8">
//               <View className="bg-emerald-600 w-20 h-20 rounded-3xl items-center justify-center mb-6 shadow-lg shadow-emerald-600/20">
//                 <Text className="text-white text-2xl font-bold">D€OPAY</Text>
//               </View>
//               <Text className="text-3xl font-bold text-emerald-900">Welcome Back</Text>
//               <Text className="text-emerald-600 mt-2 text-base text-center">
//                 Sign in to continue to your account
//               </Text>
//             </View>

//             {/* Login Form Card */}
//             <View className="bg-white rounded-3xl p-6 shadow-xl shadow-black/5">
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
//               <View className="mb-6">
//                 <Text className="text-emerald-800 font-medium mb-2 ml-1">Password</Text>
//                 <View className="flex-row items-center bg-emerald-50 rounded-2xl px-4 py-1 border border-emerald-100">
//                   <Ionicons name="lock-closed-outline" size={20} color="#059669" />
//                   <TextInput
//                     className="flex-1 py-4 px-3 text-emerald-900 text-base"
//                     placeholder="Enter your password"
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

//               {/* Forgot Password Link */}
//               <TouchableOpacity 
//                 onPress={onForgotPassword}
//                 className="mb-6 self-end"
//               >
//                 <Text className="text-emerald-600 font-medium">Forgot Password?</Text>
//               </TouchableOpacity>

//               {/* Login Button */}
//               <Pressable 
//                 onPress={handleLogin}
//                 disabled={loading}
//                 className={`bg-emerald-600 rounded-2xl py-4 items-center ${loading ? 'opacity-70' : ''}`}
//               >
//                 <Text className="text-white font-semibold text-lg">
//                   {loading ? 'Signing in...' : 'Sign In'}
//                 </Text>
//               </Pressable>

//               {/* Divider */}
//               <View className="flex-row items-center my-6">
//                 <View className="flex-1 h-px bg-emerald-200" />
//                 <Text className="text-emerald-400 px-4">OR</Text>
//                 <View className="flex-1 h-px bg-emerald-200" />
//               </View>

//               {/* Social Login Buttons */}
//               <View className="flex-row justify-center space-x-6">
//                 <TouchableOpacity className="bg-emerald-50 w-14 h-14 rounded-full items-center justify-center border border-emerald-100">
//                   <Ionicons name="logo-google" size={24} color="#059669" />
//                 </TouchableOpacity>
//                 <TouchableOpacity className="bg-emerald-50 w-14 h-14 rounded-full items-center justify-center border border-emerald-100">
//                   <Ionicons name="logo-apple" size={24} color="#059669" />
//                 </TouchableOpacity>
//                 <TouchableOpacity className="bg-emerald-50 w-14 h-14 rounded-full items-center justify-center border border-emerald-100">
//                   <Ionicons name="logo-facebook" size={24} color="#059669" />
//                 </TouchableOpacity>
//               </View>
//             </View>

//             {/* Register Link */}
//             <View className="flex-row justify-center mt-8">
//               <Text className="text-emerald-700">Don't have an account? </Text>
//               <TouchableOpacity onPress={onSwitchToRegister}>
//                 <Text className="text-emerald-600 font-semibold">Sign Up</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </ScrollView>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// };

// export default LoginScreen;