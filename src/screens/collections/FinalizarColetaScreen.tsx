// src/screens/collections/FinalizarColetaScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { finalizarColetaScreenStyles } from '../../../src/styles/collections/FinalizarColetaScreenStyles';
import { tokenApi } from '../../services/tokenApi';
import { collectorService } from '../../services/CollectorService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FinalizarColetaScreenProps {
  navigation: any;
  route: {
    params?: {
      coletaId: string;
      token?: string;
    };
  };
}

export default function FinalizarColetaScreen({ navigation, route }: any) {
  const { coletaId } = route.params || {};
  const [token, setToken] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isFinalized, setIsFinalized] = useState(false);

  useEffect(() => {
    // Não pré-preencher o token para não expor ao coletor
  }, [coletaId]);

  const loadSavedToken = async () => {};

  // Validação do token no frontend
  const validateTokenFormat = (tokenValue: string): boolean => {
    // Remove espaços
    const cleanToken = tokenValue.replace(/\s/g, '');
    
    // Verifica se tem apenas números
    if (!/^\d+$/.test(cleanToken)) {
      return false;
    }
    
    // Verifica se tem no máximo 7 dígitos (pode ter menos, mas não mais)
    if (cleanToken.length < 1 || cleanToken.length > 7) {
      return false;
    }
    
    return true;
  };

  const handleTokenChange = (text: string) => {
    // Remove espaços automaticamente
    const cleanText = text.replace(/\s/g, '');
    
    // Remove letras e caracteres especiais, mantém apenas números
    const numbersOnly = cleanText.replace(/[^0-9]/g, '');
    
    // Limita a 7 caracteres
    const limitedText = numbersOnly.slice(0, 7);
    
    setToken(limitedText);
    setError('');
    setSuccess(false);
  };

  const handleFinalize = async () => {
    if (!coletaId) {
      Alert.alert('Erro', 'ID da coleta não encontrado.');
      return;
    }

    // Validação básica no frontend
    if (!token.trim()) {
      setError('Por favor, digite o token.');
      return;
    }

    const cleanToken = token.replace(/\s/g, '');
    
    if (!validateTokenFormat(cleanToken)) {
      setError('Token inválido. Deve ter no máximo 7 dígitos numéricos.');
      return;
    }

    setIsValidating(true);
    setError('');
    setSuccess(false);

    try {
      // Validar token na API
      const response = await tokenApi.validarToken(coletaId, cleanToken);

      if (response.success) {
        setSuccess(true);
        setIsFinalized(true);
        
        // Finalizar a coleta no serviço
        try {
          await collectorService.completeCollection(coletaId, 'Coleta finalizada com token válido');
          
          // Remover token do AsyncStorage após validação bem-sucedida
          await AsyncStorage.removeItem(`token_${coletaId}`);
          
          Alert.alert(
            'Sucesso!',
            'Token válido! Coleta finalizada com sucesso.',
            [
              {
                text: 'OK',
                onPress: () => {
                  navigation.goBack();
                }
              }
            ]
          );
        } catch (completeError) {
          console.error('Erro ao finalizar coleta:', completeError);
          // Mesmo com erro ao finalizar, o token foi validado
          Alert.alert(
            'Token válido!',
            'O token foi validado com sucesso, mas houve um erro ao finalizar a coleta. Tente novamente.',
            [{ text: 'OK' }]
          );
        }
      } else {
        setError(response.message || 'Token inválido ou já usado.');
      }
    } catch (error: any) {
      console.error('Erro ao validar token:', error);
      setError(error.message || 'Erro ao validar token. Verifique sua conexão e tente novamente.');
    } finally {
      setIsValidating(false);
    }
  };

  const renderHeader = () => (
    <View style={finalizarColetaScreenStyles.header}>
      <TouchableOpacity
        style={finalizarColetaScreenStyles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#00FF84" />
      </TouchableOpacity>
      <View style={finalizarColetaScreenStyles.titleContainer}>
        <Ionicons name="key" size={24} color="#00FF84" />
        <Text style={finalizarColetaScreenStyles.title}>Finalizar Coleta</Text>
      </View>
      <View style={{ width: 40 }} />
    </View>
  );

  const renderInfoCard = () => (
    <View style={finalizarColetaScreenStyles.infoCard}>
      <Text style={finalizarColetaScreenStyles.infoTitle}>
        <Ionicons name="information-circle" size={16} color="#00D1FF" /> Como funciona?
      </Text>
      <Text style={finalizarColetaScreenStyles.infoText}>
        • Digite o token de 6 ou 7 dígitos fornecido pelo administrador{'\n'}
        • O token será validado para confirmar a coleta{'\n'}
        • Após a validação, a coleta será finalizada automaticamente
      </Text>
    </View>
  );

  if (isValidating) {
    return (
      <SafeAreaView style={finalizarColetaScreenStyles.container}>
        <View style={finalizarColetaScreenStyles.backgroundPattern} />
        {renderHeader()}
        <View style={finalizarColetaScreenStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#00FF84" />
          <Text style={finalizarColetaScreenStyles.loadingText}>
            Validando token...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={finalizarColetaScreenStyles.container}>
      <View style={finalizarColetaScreenStyles.backgroundPattern} />
      {renderHeader()}
      <ScrollView
        style={finalizarColetaScreenStyles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        <View style={finalizarColetaScreenStyles.section}>
          <Text style={finalizarColetaScreenStyles.sectionTitle}>
            Digite o Token
          </Text>
          <Text style={finalizarColetaScreenStyles.description}>
            Informe o token de validação fornecido pelo administrador para finalizar a coleta.
          </Text>

          {renderInfoCard()}

          <View style={finalizarColetaScreenStyles.tokenInputContainer}>
            <TextInput
              style={[
                finalizarColetaScreenStyles.tokenInput,
                error && finalizarColetaScreenStyles.tokenInputError,
              ]}
              value={token}
              onChangeText={handleTokenChange}
              placeholder="000000"
              placeholderTextColor="#666"
              keyboardType="number-pad"
              maxLength={7}
              editable={!isFinalized}
              autoFocus={!token}
            />
            <Text style={finalizarColetaScreenStyles.tokenHint}>
              Token deve ter no máximo 7 dígitos numéricos
            </Text>
            {error ? (
              <Text style={finalizarColetaScreenStyles.errorText}>
                <Ionicons name="close-circle" size={14} color="#FF6B6B" /> {error}
              </Text>
            ) : null}
            {success ? (
              <Text style={finalizarColetaScreenStyles.successText}>
                <Ionicons name="checkmark-circle" size={14} color="#00FF84" /> Token válido! Coleta finalizada.
              </Text>
            ) : null}
          </View>

          <View style={finalizarColetaScreenStyles.buttonContainer}>
            <TouchableOpacity
              style={[
                finalizarColetaScreenStyles.finalizeButton,
                (isFinalized || !token.trim() || token.length < 1 || token.length > 7) &&
                  finalizarColetaScreenStyles.finalizeButtonDisabled,
              ]}
              onPress={handleFinalize}
              disabled={isFinalized || !token.trim() || token.length < 1 || token.length > 7 || isValidating}
            >
              <LinearGradient
                colors={
                  isFinalized || !token.trim() || token.length < 1 || token.length > 7
                    ? ['#666', '#555']
                    : ['#00FF84', '#00E676']
                }
                style={finalizarColetaScreenStyles.finalizeButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isFinalized ? (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#000" />
                    <Text style={finalizarColetaScreenStyles.finalizeButtonText}>
                      Coleta Finalizada
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="checkmark" size={20} color="#000" />
                    <Text style={finalizarColetaScreenStyles.finalizeButtonText}>
                      Finalizar Coleta
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

