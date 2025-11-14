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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import logo from '../../../assets/Logo_recicla.png';
import { commonStyles } from '../../styles/shared/CommonStyles';

interface BenefitsRegisterScreenProps {
  navigation: any;
}

export default function BenefitsRegisterScreen({ navigation }: BenefitsRegisterScreenProps) {
  const [formData, setFormData] = useState({
    nome_beneficio: '',
    descricao: '',
    pontos_necessarios: '',
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // Validação do nome_beneficio (STRING(50))
    if (!formData.nome_beneficio.trim()) {
      newErrors.nome_beneficio = 'Nome do benefício é obrigatório';
    } else if (formData.nome_beneficio.length > 50) {
      newErrors.nome_beneficio = 'Nome do benefício deve ter no máximo 50 caracteres';
    }

    // Validação da descricao (STRING(100))
    if (!formData.descricao.trim()) {
      newErrors.descricao = 'Descrição é obrigatória';
    } else if (formData.descricao.length > 100) {
      newErrors.descricao = 'Descrição deve ter no máximo 100 caracteres';
    }

    // Validação dos pontos_necessarios (INTEGER)
    if (!formData.pontos_necessarios.trim()) {
      newErrors.pontos_necessarios = 'Pontos necessários é obrigatório';
    } else if (isNaN(Number(formData.pontos_necessarios)) || Number(formData.pontos_necessarios) <= 0) {
      newErrors.pontos_necessarios = 'Pontos deve ser um número inteiro positivo';
    } else if (!Number.isInteger(Number(formData.pontos_necessarios))) {
      newErrors.pontos_necessarios = 'Pontos deve ser um número inteiro';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        // Aqui você implementaria a chamada para a API
        // O empresa_id será preenchido automaticamente com o ID da empresa logada
        // const benefitData = {
        //   ...formData,
        //   empresa_id: currentCompanyId, // Preenchido automaticamente
        //   pontos_necessarios: parseInt(formData.pontos_necessarios)
        // };
        
        // Simulando uma chamada de API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        Alert.alert(
          'Sucesso!',
          'Benefício cadastrado com sucesso!',
          [
            {
              text: 'Cadastrar Outro',
              onPress: () => {
                setFormData({
                  nome_beneficio: '',
                  descricao: '',
                  pontos_necessarios: '',
                });
                setErrors({});
              }
            },
            {
              text: 'Voltar ao Dashboard',
              onPress: () => navigation.navigate('Dashboard')
            }
          ]
        );
      } catch (error) {
        Alert.alert('Erro', 'Erro ao cadastrar benefício. Tente novamente.');
      } finally {
        setIsSubmitting(false);
      }
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
      <Text style={styles.sectionTitle}>Cadastro de Benefícios</Text>
      <Text style={styles.sectionSubtitle}>
        Cadastre benefícios que os usuários podem trocar por pontos
      </Text>
      
      <View style={commonStyles.inputWrapper}>
        <Ionicons name="gift-outline" size={20} color="#00D1FF" style={commonStyles.inputIcon} />
        <TextInput
          style={commonStyles.input}
          placeholder="Nome do benefício"
          placeholderTextColor="#666"
          value={formData.nome_beneficio}
          onChangeText={(text) => setFormData({...formData, nome_beneficio: text})}
        />
      </View>
      {errors.nome_beneficio && <Text style={commonStyles.errorText}>{errors.nome_beneficio}</Text>}

      <View style={[commonStyles.inputWrapper, styles.textAreaWrapper]}>
        <Ionicons name="document-text-outline" size={20} color="#00D1FF" style={commonStyles.inputIcon} />
        <TextInput
          style={[commonStyles.input, styles.textArea]}
          placeholder="Descrição do benefício"
          placeholderTextColor="#666"
          value={formData.descricao}
          onChangeText={(text) => setFormData({...formData, descricao: text})}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>
      {errors.descricao && <Text style={commonStyles.errorText}>{errors.descricao}</Text>}

      <View style={commonStyles.inputWrapper}>
        <Ionicons name="star-outline" size={20} color="#00D1FF" style={commonStyles.inputIcon} />
        <TextInput
          style={commonStyles.input}
          placeholder="Pontos necessários"
          placeholderTextColor="#666"
          value={formData.pontos_necessarios}
          onChangeText={(text) => setFormData({...formData, pontos_necessarios: text})}
          keyboardType="numeric"
        />
      </View>
      {errors.pontos_necessarios && <Text style={commonStyles.errorText}>{errors.pontos_necessarios}</Text>}

      <View style={styles.infoCard}>
        <Ionicons name="information-circle-outline" size={20} color="#00D1FF" />
        <Text style={styles.infoText}>
          O benefício será automaticamente vinculado à sua empresa (empresa_id) e ficará disponível para os usuários trocarem por pontos.
        </Text>
      </View>
    </View>
  );

  const renderActionButtons = () => (
    <View style={styles.actionButtons}>
      <TouchableOpacity 
        style={[
          commonStyles.primaryButton, 
          styles.submitButton,
          isSubmitting && styles.submitButtonDisabled
        ]} 
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <View style={styles.loadingContainer}>
            <Ionicons name="refresh" size={20} color="#000" style={styles.loadingIcon} />
            <Text style={commonStyles.buttonText}>Cadastrando...</Text>
          </View>
        ) : (
          <Text style={commonStyles.buttonText}>Cadastrar Benefício</Text>
        )}
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
  textAreaWrapper: {
    alignItems: 'flex-start',
  },
  textArea: {
    minHeight: 80,
    paddingTop: 16,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 209, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00D1FF',
    padding: 15,
    marginTop: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#00D1FF',
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  actionButtons: {
    marginTop: 30,
    marginBottom: 30,
  },
  submitButton: {
    marginBottom: 15,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingIcon: {
    marginRight: 10,
  },
});
