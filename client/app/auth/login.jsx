import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Animatable from 'react-native-animatable';
import { useRouter } from 'expo-router';
import axios from 'axios';
// --- ADDED: AsyncStorage Import ---
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [userData, setUserData] = useState(null);

  const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleLogin = async () => {
    if (!email || !password) {
      showModal('Please fill in both fields', false);
      return;
    }
    if (!validateEmail(email)) {
      showModal('Please enter a valid email address', false);
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: email.toLowerCase().trim(),
        password: password,
      });

      if (response.status === 200) {
        const { token, user } = response.data;

        // --- ADDED: Persistence Logic ---
        // We store the ID specifically to satisfy the Prisma creatorId requirement
        await AsyncStorage.setItem('user_token', token);
        await AsyncStorage.setItem('user', JSON.stringify(user)); // Add this line
        await AsyncStorage.setItem('user_id', user.id); 
        await AsyncStorage.setItem('user_role', user.role);

        console.log('Login Successful. User ID stored:', user.id);

        setUserData(user);
        setIsSuccess(true);
        showModal(`Welcome back, ${user.name}!`, true);
        setEmail('');
        setPassword('');
      }
    } catch (error) {
      let errorMessage = 'Could not connect to server.';
      
      if (error.response) {
        errorMessage = error.response.data.message || 'Invalid email or password.';
      } else if (error.request) {
        errorMessage = `Network error. Is the server running at ${API_URL}?`;
      }

      showModal(errorMessage, false);
    } finally {
      setIsLoading(false);
    }
  };

  const showModal = (msg, success) => {
    setModalMessage(msg);
    setIsSuccess(success);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    if (isSuccess && userData) {
      if (userData.role === 'MANAGER') {
        router.replace('/manager/manager-acceuil');
      } else if (userData.role === 'LEAD') {
        router.replace('/lead/lead-projects');
      } else if (userData.role === 'ADMIN') {
        router.replace('/admin/menu');
      } else {
        router.replace('/user/user-projects');
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="items-center justify-center flex-1 p-4">
        <View className="w-full max-w-lg p-6 bg-white rounded-lg shadow-lg">
          <MaterialIcons
            name="emoji-people"
            size={48}
            color="#3b82f6"
            style={{ alignSelf: 'center', marginBottom: 10 }}
          />
          <Text className="mb-6 text-2xl font-bold text-center text-gray-800">
            Welcome back! Please login to continue.
          </Text>

          <View className="flex-row items-center w-full mb-4 bg-white border border-gray-300 rounded-lg shadow-sm">
            <MaterialIcons name="email" size={24} color="#3b82f6" style={{ marginLeft: 12 }} />
            <TextInput
              className="flex-1 p-3 text-base"
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View className="flex-row items-center w-full mb-4 bg-white border border-gray-300 rounded-lg shadow-sm">
            <MaterialIcons name="lock" size={24} color="#3b82f6" style={{ marginLeft: 12 }} />
            <TextInput
              className="flex-1 p-3 text-base"
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} style={{ marginRight: 12 }}>
              <MaterialIcons
                name={showPassword ? 'visibility-off' : 'visibility'}
                size={24}
                color="#3b82f6"
              />
            </Pressable>
          </View>

          <View className="flex-row justify-center">
            <Pressable
              className={`w-1/2 p-3 rounded-lg shadow-md ${isLoading ? 'bg-blue-400' : 'bg-blue-600'}`}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-base font-semibold text-center text-white">Login</Text>
              )}
            </Pressable>
          </View>

          
        </View>

        <Modal
          animationType="fade"
          transparent
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' }}>
            <View className="w-4/5 max-w-sm p-6 bg-white rounded-lg shadow-lg">
              <Animatable.View animation="zoomIn" duration={500} className="items-center mb-4">
                <MaterialIcons
                  name={isSuccess ? 'check-circle' : 'cancel'}
                  size={48}
                  color={isSuccess ? '#22c55e' : '#ef4444'}
                />
              </Animatable.View>
              <Text className="mb-4 text-lg font-semibold text-center text-gray-800">
                {modalMessage}
              </Text>
              <Pressable className="p-3 bg-blue-600 rounded-lg" onPress={closeModal}>
                <Text className="font-semibold text-center text-white">OK</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}