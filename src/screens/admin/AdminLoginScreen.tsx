import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AdminLoginScreenProps {
  navigation: any;
}

const ADMIN_PASSPHRASE = 'ADM123';

export default function AdminLoginScreen({ navigation }: AdminLoginScreenProps) {
  const [passphrase, setPassphrase] = useState('');

  const handleLogin = () => {
    if (passphrase.trim() === ADMIN_PASSPHRASE) {
      AsyncStorage.setItem('admin_passphrase', ADMIN_PASSPHRASE);
      navigation.replace('AdminTokens');
    } else {
      Alert.alert('Acesso negado', 'Palavra-chave incorreta.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <Text style={styles.title}>Login do Administrador</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Palavra-chave única</Text>
        <TextInput
          style={styles.input}
          value={passphrase}
          onChangeText={setPassphrase}
          placeholder="Digite a palavra-chave"
          placeholderTextColor="#666"
          secureTextEntry
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A', padding: 16 },
  title: { color: '#FFFFFF', fontSize: 20, fontWeight: '600', marginBottom: 12 },
  card: { backgroundColor: '#121212', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#222' },
  label: { color: '#AAA', marginBottom: 8 },
  input: { backgroundColor: '#1A1A1A', color: '#FFF', borderColor: '#333', borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 },
  button: { backgroundColor: '#00FF84', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  buttonText: { color: '#0A0A0A', fontWeight: '600' },
});