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
  StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Animatable from 'react-native-animatable';
import { useRouter } from 'expo-router';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Consistent ARSII Color Palette
const COLORS = {
  primary: '#1e3a8a',    // Deep Navy
  secondary: '#22c55e',  // Success Green
  bgLight: '#f8fafc',    // Slate-50
  border: '#e2e8f0',     // Slate-200
  textMuted: '#94a3b8'   // Slate-400
};

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
          modalMessage: 'User created successfully! The member can now log in.',
          modalVisible: true,
        });
        setForm({ name: '', email: '', role: 'USER', password: '', confirmPassword: '' });
      }
    } catch (error) {
      let errorMessage = 'Network error: Check if backend is running.';
      if (error.response) {
        errorMessage = error.response.data.message || 'Registration failed.';
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
      router.replace('/admin/menu'); // Logical flow: Back to Admin menu on success
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.bgLight }}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          <View className="p-6">
            
            {/* Header Section */}
            <Pressable onPress={() => router.back()} className="items-center justify-center w-10 h-10 mb-6 bg-white rounded-full shadow-sm">
              <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
            </Pressable>

            <View className="mb-8">
              <View className="flex-row items-center mb-1">
                <View className="w-8 h-1 mr-2 bg-green-500 rounded-full" />
                <Text className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Management</Text>
              </View>
              <Text className="text-3xl font-black text-blue-900">Add Member</Text>
              <Text className="font-medium text-slate-400">Provision a new account for the association</Text>
            </View>

            <Animatable.View animation="fadeInUp" duration={600} className="p-8 bg-white shadow-2xl shadow-slate-200 rounded-[35px] border border-slate-50">
              
              {/* Input Fields */}
              <InputField icon="person" placeholder="Full Name" value={form.name} onChange={(v) => setForm({...form, name: v})} />
              <InputField icon="email" placeholder="Email Address" value={form.email} onChange={(v) => setForm({...form, email: v})} keyboard="email-address" />

              {/* Custom Role Dropdown */}
              <View className="relative z-50 mb-4">
                <Pressable 
                  onPress={() => setUi({...ui, showDropdown: !ui.showDropdown})}
                  className="flex-row items-center justify-between p-4 border bg-slate-50 border-slate-100 rounded-2xl"
                >
                  <View className="flex-row items-center">
                    <MaterialIcons name="verified-user" size={20} color={COLORS.primary} />
                    <Text className="ml-3 font-bold text-slate-700">{form.role}</Text>
                  </View>
                  <MaterialIcons name={ui.showDropdown ? "expand-less" : "expand-more"} size={24} color={COLORS.textMuted} />
                </Pressable>
                
                {ui.showDropdown && (
                  <Animatable.View animation="fadeIn" duration={200} className="absolute left-0 right-0 overflow-hidden bg-white border border-slate-100 shadow-2xl top-14 rounded-2xl z-[100]">
                    {roles.map((r) => (
                      <Pressable 
                        key={r} 
                        className={`p-4 border-b border-slate-50 ${form.role === r ? 'bg-blue-50' : 'active:bg-slate-50'}`}
                        onPress={() => {
                          setForm({...form, role: r});
                          setUi({...ui, showDropdown: false});
                        }}
                      >
                        <Text className={form.role === r ? "text-blue-900 font-black" : "text-slate-600 font-medium"}>{r}</Text>
                      </Pressable>
                    ))}
                  </Animatable.View>
                )}
              </View>

              <InputField 
                icon="lock" 
                placeholder="Secure Password" 
                value={form.password} 
                onChange={(v) => setForm({...form, password: v})} 
                isPassword 
                showPassword={ui.showPassword} 
                toggleShow={() => setUi({...ui, showPassword: !ui.showPassword})} 
              />

              <InputField 
                icon="shield" 
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
                className={`mt-6 p-5 rounded-2xl flex-row justify-center items-center shadow-lg shadow-blue-200 ${ui.isLoading ? 'bg-blue-300' : 'bg-blue-900'}`}
              >
                {ui.isLoading ? <ActivityIndicator color="#fff" /> : (
                  <>
                    <MaterialIcons name="person-add" size={20} color="white" />
                    <Text className="ml-2 text-lg font-bold text-white">Create Account</Text>
                  </>
                )}
              </Pressable>
            </Animatable.View>

            <View className="items-center mt-10">
               <Text className="text-slate-300 text-[10px] font-bold tracking-widest uppercase italic">Secure Member Provisioning</Text>
            </View>
          </View>
        </ScrollView>

        {/* Feedback Modal Sync with Login.jsx */}
        <Modal visible={ui.modalVisible} transparent animationType="fade">
          <View className="items-center justify-center flex-1 p-6 bg-slate-900/60">
            <View className="items-center w-full max-w-sm p-8 bg-white shadow-2xl rounded-[35px]">
              <Animatable.View animation="zoomIn">
                <MaterialIcons 
                  name={ui.isSuccess ? "check-circle" : "error"} 
                  size={70} 
                  color={ui.isSuccess ? COLORS.secondary : "#ef4444"} 
                />
              </Animatable.View>
              <Text className="mt-4 mb-2 text-2xl font-black text-slate-800">
                {ui.isSuccess ? "Success" : "Error"}
              </Text>
              <Text className="mb-8 font-medium leading-5 text-center text-slate-500">
                {ui.modalMessage}
              </Text>
              <Pressable onPress={closeModal} className={`w-full p-4 rounded-2xl ${ui.isSuccess ? 'bg-green-600' : 'bg-blue-900'}`}>
                <Text className="text-lg font-bold text-center text-white">Continue</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const InputField = ({ icon, placeholder, value, onChange, keyboard = "default", isPassword = false, showPassword = false, toggleShow }) => (
  <View className="flex-row items-center p-4 mb-4 border bg-slate-50 border-slate-100 rounded-2xl">
    <MaterialIcons name={icon} size={20} color="#1e3a8a" />
    <TextInput
      className="flex-1 ml-3 font-medium text-slate-700"
      placeholder={placeholder}
      placeholderTextColor="#94a3b8"
      value={value}
      onChangeText={onChange}
      keyboardType={keyboard}
      secureTextEntry={isPassword && !showPassword}
      autoCapitalize="none"
    />
    {isPassword && (
      <Pressable onPress={toggleShow} className="px-2">
        <MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={20} color="#64748b" />
      </Pressable>
    )}
  </View>
);