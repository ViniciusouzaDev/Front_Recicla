import React, { useState } from 'react';
import api from '../../services/Api';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  Animated,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import logo from '../../../assets/Logo_recicla.png';
import {
  validateEmail,
  validatePhone,
  validateCPF,
  validatePassword,
  validateFullName,
  validateAddress,
  formatCPF,
  formatPhone
} from '../../../utils/validation';
import { registerScreenStyles } from '../../../src/styles/auth/RegisterScreenStyles';

interface RegisterScreenProps {
  navigation: any;
}

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  // Estados seguindo a ordem da model Sequelize
  const [fullName, setFullName] = useState('');       // nome
  const [cpf, setCpf] = useState('');                 // cpf
  const [email, setEmail] = useState('');             // email
  const [phone, setPhone] = useState('');             // telefone
  const [address, setAddress] = useState('');         // endereco
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');       // senha
  const [confirmPassword, setConfirmPassword] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [workingArea, setWorkingArea] = useState('');
  const [glowAnim] = useState(new Animated.Value(0));
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const vehicleTypes = [
    { id: 'bike', name: 'Bicicleta', icon: '🚲' },
    { id: 'motorcycle', name: 'Moto', icon: '🏍️' },
    { id: 'car', name: 'Carro', icon: '🚗' },
    { id: 'truck', name: 'Caminhão', icon: '🚛' }
  ];

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Nome completo
    if (!fullName.trim()) newErrors.fullName = 'Nome completo é obrigatório';
    else if (!validateFullName(fullName)) newErrors.fullName = 'Digite o nome completo (nome e sobrenome)';

    // CPF
    if (!cpf.trim()) newErrors.cpf = 'CPF é obrigatório';
    else if (!validateCPF(cpf)) newErrors.cpf = 'Digite um CPF válido';

    // E-mail
    if (!email.trim()) newErrors.email = 'E-mail é obrigatório';
    else if (!validateEmail(email)) newErrors.email = 'Digite um e-mail válido';

    // Telefone
    if (!phone.trim()) newErrors.phone = 'Telefone é obrigatório';
    else if (!validatePhone(phone)) newErrors.phone = 'Digite um telefone válido com DDD';

    // Endereço
    if (!address.trim()) newErrors.address = 'Endereço é obrigatório';
    else if (!validateAddress(address)) newErrors.address = 'Digite um endereço completo';

    // Senha
    if (!password.trim()) newErrors.password = 'Senha é obrigatória';
    else {
      const passValidation = validatePassword(password);
      if (!passValidation.isValid) newErrors.password = passValidation.message;
    }

    // Confirmação de senha
    if (!confirmPassword.trim()) newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'As senhas não coincidem';

    // Campos do coletador
   /* if (!vehicleType.trim()) newErrors.vehicleType = 'Tipo de veículo é obrigatório';
    if (!licensePlate.trim()) newErrors.licensePlate = 'Placa do veículo é obrigatória';
    if (!workingArea.trim()) newErrors.workingArea = 'Área de trabalho é obrigatória'; */

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
  if (!validateForm()) {
    Alert.alert('Campos Obrigatórios', 'Por favor, preencha todos os campos corretamente.');
    return;
  }

  try {
    // Dados do usuário seguindo a mesma ordem da model Sequelize
    const userData = {
      nome: fullName.trim(),
      cpf: cpf.replace(/\D/g, ''), // remove pontos e traços
      email: email.trim(),
      telefone: phone.replace(/\D/g, ''), // remove caracteres especiais
      endereco: address.trim(),
      senha: password.trim(),
      //tipo_veiculo: vehicleType.trim(),
      //placa: licensePlate.trim(),
      //area_atuacao: workingArea.trim(),
    };

    // Envia os dados para o backend
    const response = await api.post('/usuarios', userData);

    if (response.status === 201 || response.status === 200) {
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();

      Alert.alert(
        'Cadastro Realizado!',
        'Seu cadastro foi realizado com sucesso. Bem-vindo ao ReciclaMais!',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    }
  } catch (error: any) {
    console.error('Erro ao registrar usuário:', error.response?.data || error.message);

    Alert.alert(
      'Erro no Cadastro',
      error.response?.data?.message ||
        'Não foi possível realizar o cadastro. Verifique os dados e tente novamente.'
    );
  }
};

  return (
    <SafeAreaView style={registerScreenStyles.container}>
      <View style={registerScreenStyles.backgroundPattern} />

      <ScrollView contentContainerStyle={registerScreenStyles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Logo */}
        <View style={registerScreenStyles.logoContainer}>
          <View style={registerScreenStyles.logoGlow}>
            <Image source={logo} style={registerScreenStyles.logo} />
          </View>
          <Text style={registerScreenStyles.subtitle}>Entre para o futuro da reciclagem!</Text>
        </View>

        {/* Inputs */}
        <View style={registerScreenStyles.inputContainer}>
          {/* Nome */}
          <View style={registerScreenStyles.inputWrapper}>
            <Ionicons name="person" size={20} color="#00D1FF" style={registerScreenStyles.inputIcon} />
            <TextInput
              style={registerScreenStyles.input}
              placeholder="Nome completo *"
              placeholderTextColor="#666"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
          </View>
          {errors.fullName && <Text style={registerScreenStyles.errorText}>{errors.fullName}</Text>}

          {/* CPF */}
          <View style={registerScreenStyles.inputWrapper}>
            <Ionicons name="id-card" size={20} color="#00D1FF" style={registerScreenStyles.inputIcon} />
            <TextInput
              style={registerScreenStyles.input}
              placeholder="CPF *"
              placeholderTextColor="#666"
              value={cpf}
              onChangeText={(text) => setCpf(formatCPF(text))}
              keyboardType="numeric"
            />
          </View>
          {errors.cpf && <Text style={registerScreenStyles.errorText}>{errors.cpf}</Text>}

          {/* E-mail */}
          <View style={registerScreenStyles.inputWrapper}>
            <Ionicons name="mail" size={20} color="#00D1FF" style={registerScreenStyles.inputIcon} />
            <TextInput
              style={registerScreenStyles.input}
              placeholder="E-mail *"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          {errors.email && <Text style={registerScreenStyles.errorText}>{errors.email}</Text>}

          {/* Telefone */}
          <View style={registerScreenStyles.inputWrapper}>
            <Ionicons name="call" size={20} color="#00D1FF" style={registerScreenStyles.inputIcon} />
            <TextInput
              style={registerScreenStyles.input}
              placeholder="Telefone com DDD *"
              placeholderTextColor="#666"
              value={phone}
              onChangeText={(text) => setPhone(formatPhone(text))}
              keyboardType="phone-pad"
            />
          </View>
          {errors.phone && <Text style={registerScreenStyles.errorText}>{errors.phone}</Text>}

          {/* Endereço */}
          <View style={registerScreenStyles.inputWrapper}>
            <Ionicons name="location" size={20} color="#00D1FF" style={registerScreenStyles.inputIcon} />
            <TextInput
              style={[registerScreenStyles.input, registerScreenStyles.addressInput]}
              placeholder="Endereço completo *"
              placeholderTextColor="#666"
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={3}
              autoCapitalize="words"
            />
          </View>
          {errors.address && <Text style={registerScreenStyles.errorText}>{errors.address}</Text>}

          {/* Senha */}
          <View style={registerScreenStyles.inputWrapper}>
            <Ionicons name="lock-closed" size={20} color="#00D1FF" style={registerScreenStyles.inputIcon} />
            <TextInput
              style={registerScreenStyles.input}
              placeholder="Senha *"
              placeholderTextColor="#666"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={registerScreenStyles.eyeIconContainer}
            >
              <Ionicons 
                name={showPassword ? "eye" : "eye-off"} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>

          </View>
          {errors.password && <Text style={registerScreenStyles.errorText}>{errors.password}</Text>}

          {/* Confirmar senha */}
          <View style={registerScreenStyles.inputWrapper}>
            <Ionicons name="lock-closed" size={20} color="#00D1FF" style={registerScreenStyles.inputIcon} />
            <TextInput
              style={registerScreenStyles.input}
              placeholder="Confirmar senha *"
              placeholderTextColor="#666"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={registerScreenStyles.eyeIconContainer}
            >
              <Ionicons 
                name={showConfirmPassword ? "eye" : "eye-off"} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>
          {errors.confirmPassword && <Text style={registerScreenStyles.errorText}>{errors.confirmPassword}</Text>}

          {/* Veículo */}
          <Text style={registerScreenStyles.sectionTitle}>Informações do Veículo</Text>
          <View style={registerScreenStyles.vehicleTypeContainer}>
            <Text style={registerScreenStyles.sectionLabel}>Tipo de Veículo</Text>
            <View style={registerScreenStyles.vehicleTypesGrid}>
              {vehicleTypes.map(vehicle => (
                <TouchableOpacity
                  key={vehicle.id}
                  style={[
                    registerScreenStyles.vehicleTypeCard,
                    vehicleType === vehicle.id && registerScreenStyles.selectedVehicleType
                  ]}
                  onPress={() => setVehicleType(vehicle.id)}
                >
                  <Text style={registerScreenStyles.vehicleIcon}>{vehicle.icon}</Text>
                  <Text style={[
                    registerScreenStyles.vehicleName,
                    vehicleType === vehicle.id && registerScreenStyles.selectedVehicleName
                  ]}>
                    {vehicle.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          {errors.vehicleType && <Text style={registerScreenStyles.errorText}>{errors.vehicleType}</Text>}

          <View style={registerScreenStyles.inputWrapper}>
            <Ionicons name="car" size={20} color="#00D1FF" style={registerScreenStyles.inputIcon} />
            <TextInput
              style={registerScreenStyles.input}
              placeholder="Placa do veículo *"
              placeholderTextColor="#666"
              value={licensePlate}
              onChangeText={setLicensePlate}
              autoCapitalize="characters"
            />
          </View>
          {errors.licensePlate && <Text style={registerScreenStyles.errorText}>{errors.licensePlate}</Text>}

          <View style={registerScreenStyles.inputWrapper}>
            <Ionicons name="location" size={20} color="#00D1FF" style={registerScreenStyles.inputIcon} />
            <TextInput
              style={registerScreenStyles.input}
              placeholder="Área de trabalho (bairros, regiões) *"
              placeholderTextColor="#666"
              value={workingArea}
              onChangeText={setWorkingArea}
              autoCapitalize="words"
            />
          </View>
          {errors.workingArea && <Text style={registerScreenStyles.errorText}>{errors.workingArea}</Text>}
        </View>

        {/* Botão Cadastrar */}
        <Animated.View style={[
          registerScreenStyles.buttonContainer,
          { opacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }
        ]}>
          <TouchableOpacity style={registerScreenStyles.registerButton} onPress={handleRegister}>
            <LinearGradient
              colors={['#00FF84', '#00E676']}
              style={registerScreenStyles.gradientButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={registerScreenStyles.registerButtonText}>CADASTRAR</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Login */}
        <TouchableOpacity style={registerScreenStyles.loginContainer} onPress={() => navigation.navigate('Login')}>
          <Text style={registerScreenStyles.loginText}>Já possui conta? Entrar</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={registerScreenStyles.footer}>
          <Text style={registerScreenStyles.footerText}>
              Ao clicar em continuar, você concorda com nossos{' '}
                      <Text style={registerScreenStyles.footerLink}>Termos de Serviço</Text> e{' '}
                      <Text style={registerScreenStyles.footerLink}>Política de Privacidade</Text>.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
