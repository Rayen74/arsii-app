import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Animatable from 'react-native-animatable';
import { useRouter } from 'expo-router';
import axios from 'axios';

// Get the API URL from your .env file (EXPO_PUBLIC_API_URL=http://10.10.120.58:3000/api)
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function CreateUser() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'USER',
    password: '',
    confirmPassword: '',
  });

  const [ui, setUi] = useState({
    showPassword: false,
    showConfirm: false,
    showDropdown: false,
    isLoading: false,
    modalVisible: false,
    modalMessage: '',
    isSuccess: false,
  });

  const roles = ['ADMIN', 'MANAGER', 'LEAD', 'USER'];

  const validate = () => {
    if (!form.name.trim()) return 'Full name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Invalid email address';
    if (form.password.length < 6) return 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) return 'Passwords do not match';
    return null;
  };

  const handleRegister = async () => {
    const errorMsg = validate();
    if (errorMsg) {
      setUi({ ...ui, modalMessage: errorMsg, isSuccess: false, modalVisible: true });
      return;
    }

    setUi({ ...ui, isLoading: true });

    try {
      // Logic Check: Axios will automatically handle the JSON conversion
      const response = await axios.post(`${API_URL}/auth/register`, {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });

      if (response.status === 201 || response.status === 200) {
        setUi({
          ...ui,
          isLoading: false,
          isSuccess: true,
          modalMessage: 'User created successfully! Proceeding to login.',
          modalVisible: true,
        });
        setForm({ name: '', email: '', role: 'USER', password: '', confirmPassword: '' });
      }
    } catch (error) {
      let errorMessage = 'Network error: Check if backend is running on ' + API_URL;
      
      if (error.response) {
        // Server responded with an error (400, 401, 500)
        errorMessage = error.response.data.message || 'Registration failed.';
      } else if (error.request) {
        // Request was made but no response received (likely IP/Firewall issue)
        errorMessage = 'Server unreachable. Verify your computer IP: ' + API_URL;
      }

      setUi({
        ...ui,
        isLoading: false,
        isSuccess: false,
        modalMessage: errorMessage,
        modalVisible: true,
      });
    }
  };

  const closeModal = () => {
    setUi({ ...ui, modalVisible: false });
    if (ui.isSuccess) {
      router.replace('/auth/login');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="justify-center flex-1 p-6">
            <Animatable.View animation="fadeInUp" duration={800} className="p-8 bg-white border border-gray-100 shadow-xl rounded-3xl">
              <View className="items-center mb-8">
                <View className="p-4 mb-4 bg-blue-100 rounded-full">
                  <MaterialIcons name="person-add" size={40} color="#2563eb" />
                </View>
                <Text className="text-3xl font-bold text-gray-900">ARSII-Sfax</Text>
                <Text className="mt-1 text-gray-500">Create a new team member</Text>
              </View>

              {/* Input Fields */}
              <InputField icon="person" placeholder="Full Name" value={form.name} onChange={(v) => setForm({...form, name: v})} />
              <InputField icon="email" placeholder="Email" value={form.email} onChange={(v) => setForm({...form, email: v})} keyboard="email-address" />

              {/* Custom Role Dropdown */}
              <View className="relative z-50 mb-4">
                <Pressable 
                  onPress={() => setUi({...ui, showDropdown: !ui.showDropdown})}
                  className="flex-row items-center justify-between p-4 border border-gray-200 bg-gray-50 rounded-xl"
                >
                  <View className="flex-row items-center">
                    <MaterialIcons name="admin-panel-settings" size={20} color="#6b7280" />
                    <Text className="ml-3 font-medium text-gray-700">{form.role}</Text>
                  </View>
                  <MaterialIcons name="arrow-drop-down" size={24} color="#6b7280" />
                </Pressable>
                
                {ui.showDropdown && (
                  <View className="absolute left-0 right-0 overflow-hidden bg-white border border-gray-200 shadow-lg top-14 rounded-xl">
                    {roles.map((r) => (
                      <Pressable 
                        key={r} 
                        className="p-4 border-b border-gray-50 active:bg-blue-50"
                        onPress={() => {
                          setForm({...form, role: r});
                          setUi({...ui, showDropdown: false});
                        }}
                      >
                        <Text className={form.role === r ? "text-blue-600 font-bold" : "text-gray-700"}>{r}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>

              <InputField 
                icon="lock" 
                placeholder="Password" 
                value={form.password} 
                onChange={(v) => setForm({...form, password: v})} 
                isPassword 
                showPassword={ui.showPassword} 
                toggleShow={() => setUi({...ui, showPassword: !ui.showPassword})} 
              />

              <InputField 
                icon="verified-user" 
                placeholder="Confirm Password" 
                value={form.confirmPassword} 
                onChange={(v) => setForm({...form, confirmPassword: v})} 
                isPassword 
                showPassword={ui.showConfirm} 
                toggleShow={() => setUi({...ui, showConfirm: !ui.showConfirm})} 
              />

              <Pressable 
                onPress={handleRegister}
                disabled={ui.isLoading}
                className={`mt-4 p-4 rounded-xl items-center shadow-lg ${ui.isLoading ? 'bg-blue-300' : 'bg-blue-600'}`}
              >
                {ui.isLoading ? <ActivityIndicator color="#fff" /> : <Text className="text-lg font-bold text-white">Register Member</Text>}
              </Pressable>

              <Pressable onPress={() => router.push('/auth/login')} className="mt-6">
                <Text className="text-center text-gray-500">Already registered? <Text className="font-bold text-blue-600">Log In</Text></Text>
              </Pressable>
            </Animatable.View>
          </View>
        </ScrollView>

        {/* Feedback Modal */}
        <Modal visible={ui.modalVisible} transparent animationType="fade">
          <View className="items-center justify-center flex-1 p-6 bg-black/60">
            <View className="items-center w-full max-w-sm p-8 bg-white shadow-2xl rounded-3xl">
              <MaterialIcons 
                name={ui.isSuccess ? "check-circle" : "error-outline"} 
                size={64} 
                color={ui.isSuccess ? "#10b981" : "#ef4444"} 
              />
              <Text className="mt-4 mb-2 text-xl font-bold text-center text-gray-900">
                {ui.isSuccess ? "Success" : "Oops!"}
              </Text>
              <Text className="mb-6 leading-5 text-center text-gray-500">
                {ui.modalMessage}
              </Text>
              <Pressable onPress={closeModal} className="w-full p-4 bg-gray-900 rounded-xl">
                <Text className="font-bold text-center text-white">OK</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Reusable Input Component for cleaner code
const InputField = ({ icon, placeholder, value, onChange, keyboard = "default", isPassword = false, showPassword = false, toggleShow }) => (
  <View className="flex-row items-center p-4 mb-4 border border-gray-200 bg-gray-50 rounded-xl">
    <MaterialIcons name={icon} size={20} color="#6b7280" />
    <TextInput
      className="flex-1 ml-3 text-gray-700"
      placeholder={placeholder}
      placeholderTextColor="#9ca3af"
      value={value}
      onChangeText={onChange}
      keyboardType={keyboard}
      secureTextEntry={isPassword && !showPassword}
      autoCapitalize="none"
    />
    {isPassword && (
      <Pressable onPress={toggleShow}>
        <MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={20} color="#6b7280" />
      </Pressable>
    )}
  </View>
);