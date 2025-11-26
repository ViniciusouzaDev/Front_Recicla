import React, { useState } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Animated,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import logo from '../../../assets/Logo_recicla.png';
import { loginScreenStyles } from '../../../src/styles/auth/LoginScreenStyles';
import { login } from '../../services/authService';

const { width } = Dimensions.get('window');

interface LoginScreenProps {
  navigation: any;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [glowAnim] = useState(new Animated.Value(0));
  const [showPassword, setShowPassword] = useState(false);

  const handleContinue = async () => {
  try {
    Animated.sequence([
      Animated.timing(glowAnim, { toValue: 1, duration: 200, useNativeDriver: false }),
      Animated.timing(glowAnim, { toValue: 0, duration: 200, useNativeDriver: false }),
    ]).start();

    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha e-mail e senha.');
      return;
    }

    // 🔹 Chamada para API
    const token = await login(email, password);
    console.log('✅ Login bem-sucedido:', token);

    // 🔹 Armazena o token JWT no AsyncStorage
    await AsyncStorage.setItem('token', token);
    console.log('🔐 Token salvo com sucesso!');

    // 🔹 Navega para a Dashboard
    navigation.replace('Dashboard');
  } catch (error: any) {
    console.error('❌ Erro ao fazer login:', error);
    Alert.alert('Erro', error.message || 'Falha no login. Verifique suas credenciais.');
  }
};


  const handleCreateAccount = () => {
    navigation.navigate('UserType');
  };
  const handleAdminLogin = () => {
    navigation.navigate('AdminLogin');
  };

  return (
    <SafeAreaView style={loginScreenStyles.container} edges={[]}>

      {/* Background Pattern */}
      <View style={loginScreenStyles.backgroundPattern} />

      <ScrollView
        contentContainerStyle={loginScreenStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={loginScreenStyles.logoContainer}>
          <View style={loginScreenStyles.logoGlow}>
            <Image source={logo} style={loginScreenStyles.logo} />
          </View>
          <Text style={loginScreenStyles.subtitle}>
            Seja bem-vindo ao RECICLA+!
          </Text>
        </View>

        {/* Inputs */}
        <View style={loginScreenStyles.inputContainer}>
          <View style={loginScreenStyles.inputWrapper}>
            <Ionicons name="person" size={20} color="#00D1FF" style={loginScreenStyles.inputIcon} />
            <TextInput
              style={loginScreenStyles.input}
              placeholder="E-mail"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={loginScreenStyles.inputWrapper}>
            <Ionicons name="lock-closed" size={20} color="#00D1FF" style={loginScreenStyles.inputIcon} />
            <TextInput
              style={loginScreenStyles.input}
              placeholder="Senha"
              placeholderTextColor="#666"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={loginScreenStyles.eyeIconContainer}
            >
              <Ionicons 
                name={showPassword ? "eye" : "eye-off"} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Botão de Login */}
        <Animated.View
          style={[
            loginScreenStyles.buttonContainer,
            {
              opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ]}
        >
          <TouchableOpacity style={loginScreenStyles.continueButton} onPress={handleContinue}>
            <LinearGradient
              colors={['#00FF84', '#00E676']}
              style={loginScreenStyles.gradientButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={loginScreenStyles.continueButtonText}>Entrar</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Divisor */}
        <View style={loginScreenStyles.dividerContainer}>
          <View style={loginScreenStyles.dividerLine} />
          <Text style={loginScreenStyles.dividerText}>ou</Text>
          <View style={loginScreenStyles.dividerLine} />
        </View>

        {/* Criar Conta */}
        <TouchableOpacity
          style={loginScreenStyles.createAccountContainer}
          onPress={handleCreateAccount}
        >
          <Text style={loginScreenStyles.createAccountText}>Criar uma conta</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={loginScreenStyles.createAccountContainer}
          onPress={handleAdminLogin}
        >
          <Text style={loginScreenStyles.createAccountText}>Entrar como admin</Text>
        </TouchableOpacity>

        {/* Rodapé */}
        <View style={loginScreenStyles.footer}>
          <Text style={loginScreenStyles.footerText}>
            Ao clicar em continuar, você concorda com nossos{' '}
          <Text style={loginScreenStyles.footerLink}>Termos de Serviço</Text> e{' '}
          <Text style={loginScreenStyles.footerLink}>Política de Privacidade</Text>.
        </Text>

        </View>
      </ScrollView>
    </SafeAreaView>
    
  );
  
}
