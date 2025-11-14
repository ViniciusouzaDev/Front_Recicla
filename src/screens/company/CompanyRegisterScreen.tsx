import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import logo from '../../../assets/Logo_recicla.png';
import { commonStyles } from '../../styles/shared/CommonStyles';
import { validateCNPJ } from '../../../utils/validation';

interface CompanyRegisterScreenProps {
  navigation: any;
}

export default function CompanyRegisterScreen({ navigation }: CompanyRegisterScreenProps) {
  const [formData, setFormData] = useState({
    nome_empresa: '',
    cnpj: '',
    contato: '',
    telefone: '',
    endereco: '',
    status: true,
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.nome_empresa.trim()) {
      newErrors.nome_empresa = 'Nome da empresa é obrigatório';
    }

    if (!formData.cnpj.trim()) {
      newErrors.cnpj = 'CNPJ é obrigatório';
    } else if (!validateCNPJ(formData.cnpj)) {
      newErrors.cnpj = 'Digite um CNPJ válido';
    }

    if (!formData.contato.trim()) {
      newErrors.contato = 'Contato é obrigatório';
    }

    if (!formData.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    }

    if (!formData.endereco.trim()) {
      newErrors.endereco = 'Endereço é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatCNPJ = (text: string) => {
    const numbers = text.replace(/\D/g, '');
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const handleCNPJChange = (text: string) => {
    const formatted = formatCNPJ(text);
    setFormData({...formData, cnpj: formatted});
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Aqui você implementaria a chamada para a API
      Alert.alert(
        'Sucesso!',
        'Empresa cadastrada com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('BenefitsRegister')
          }
        ]
      );
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
      
      <View style={styles.logoContainer}>
        <Image source={logo} style={styles.logo} />
        <Text style={styles.appName}>Recicla+</Text>
      </View>
      
      <View style={styles.placeholder} />
    </View>
  );

  const renderForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.sectionTitle}>Cadastro de Empresa Parceira</Text>
      <Text style={styles.sectionSubtitle}>
        Preencha os dados da sua empresa para se tornar parceira do Recicla+
      </Text>
      
      <View style={commonStyles.inputWrapper}>
        <Ionicons name="business-outline" size={20} color="#00D1FF" style={commonStyles.inputIcon} />
        <TextInput
          style={commonStyles.input}
          placeholder="Nome da empresa"
          placeholderTextColor="#666"
          value={formData.nome_empresa}
          onChangeText={(text) => setFormData({...formData, nome_empresa: text})}
        />
      </View>
      {errors.nome_empresa && <Text style={commonStyles.errorText}>{errors.nome_empresa}</Text>}

      <View style={commonStyles.inputWrapper}>
        <Ionicons name="card-outline" size={20} color="#00D1FF" style={commonStyles.inputIcon} />
        <TextInput
          style={commonStyles.input}
          placeholder="CNPJ (apenas números)"
          placeholderTextColor="#666"
          value={formData.cnpj}
          onChangeText={handleCNPJChange}
          keyboardType="numeric"
          maxLength={18}
        />
      </View>
      {errors.cnpj && <Text style={commonStyles.errorText}>{errors.cnpj}</Text>}

      <View style={commonStyles.inputWrapper}>
        <Ionicons name="person-outline" size={20} color="#00D1FF" style={commonStyles.inputIcon} />
        <TextInput
          style={commonStyles.input}
          placeholder="Nome do responsável"
          placeholderTextColor="#666"
          value={formData.contato}
          onChangeText={(text) => setFormData({...formData, contato: text})}
        />
      </View>
      {errors.contato && <Text style={commonStyles.errorText}>{errors.contato}</Text>}

      <View style={commonStyles.inputWrapper}>
        <Ionicons name="call-outline" size={20} color="#00D1FF" style={commonStyles.inputIcon} />
        <TextInput
          style={commonStyles.input}
          placeholder="Telefone"
          placeholderTextColor="#666"
          value={formData.telefone}
          onChangeText={(text) => setFormData({...formData, telefone: text})}
          keyboardType="phone-pad"
        />
      </View>
      {errors.telefone && <Text style={commonStyles.errorText}>{errors.telefone}</Text>}

      <View style={commonStyles.inputWrapper}>
        <Ionicons name="location-outline" size={20} color="#00D1FF" style={commonStyles.inputIcon} />
        <TextInput
          style={commonStyles.input}
          placeholder="Endereço completo"
          placeholderTextColor="#666"
          value={formData.endereco}
          onChangeText={(text) => setFormData({...formData, endereco: text})}
          multiline
          numberOfLines={2}
        />
      </View>
      {errors.endereco && <Text style={commonStyles.errorText}>{errors.endereco}</Text>}

      <View style={styles.switchContainer}>
        <View style={styles.switchLabel}>
          <Ionicons name="checkmark-circle-outline" size={20} color="#00D1FF" />
          <Text style={styles.switchText}>Empresa ativa</Text>
        </View>
        <Switch
          value={formData.status}
          onValueChange={(value) => setFormData({...formData, status: value})}
          trackColor={{ false: '#666', true: '#00FF84' }}
          thumbColor={formData.status ? '#fff' : '#f4f3f4'}
        />
      </View>
    </View>
  );

  const renderActionButtons = () => (
    <View style={styles.actionButtons}>
      <TouchableOpacity style={[commonStyles.primaryButton, styles.submitButton]} onPress={handleSubmit}>
        <Text style={commonStyles.buttonText}>Cadastrar Empresa</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={commonStyles.container}>
      
      <View style={commonStyles.backgroundPattern} />
      
      {renderHeader()}
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {renderForm()}
        {renderActionButtons()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: '#00D1FF',
  },
  backButton: {
    padding: 8,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00D1FF',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00D1FF',
    marginBottom: 10,
    textShadowColor: '#00D1FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    lineHeight: 22,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00D1FF',
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 20,
  },
  switchLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchText: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 10,
    fontWeight: '500',
  },
  actionButtons: {
    marginTop: 30,
    marginBottom: 30,
  },
  submitButton: {
    marginBottom: 15,
  },
});

