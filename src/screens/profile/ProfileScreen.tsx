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
import ShareButton from '../../components/ShareButton';

interface ProfileScreenProps {
  navigation: any;
}

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    name: 'João Silva',
    email: 'joao.silva@email.com',
    userType: 'user', // 'user' ou 'company'
    phone: '(11) 99999-9999',
    address: 'Rua das Flores, 123',
  });

  const [formData, setFormData] = useState(userData);

  // TODO: Implementar upload de foto de perfil
  // TODO: Conectar com backend para persistir dados
  // TODO: Implementar validação de formulário
  // TODO: Adicionar campos de preferências do usuário
  // TODO: Implementar sistema de notificações do usuário

  const handleEdit = () => {
    setIsEditing(true);
    setFormData(userData);
  };

  const handleSave = () => {
    setUserData(formData);
    setIsEditing(false);
    Alert.alert('Sucesso', 'Informações atualizadas com sucesso!');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData(userData);
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: () => navigation.navigate('Login') }
      ]
    );
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

  const renderProfileCard = () => (
    <View style={styles.profileCard}>
      <LinearGradient
        colors={['#00FF84', '#00E676', '#00C853']}
        style={styles.profileGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.profileContent}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color="#fff" />
            </View>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userData.name}</Text>
            <Text style={styles.profileEmail}>{userData.email}</Text>
            <View style={styles.userTypeBadge}>
              <Text style={styles.userTypeText}>
                {userData.userType === 'company' ? 'Empresa' : 'Usuário Comum'}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  const renderForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.sectionTitle}>Informações Pessoais</Text>
      
      <View style={commonStyles.inputWrapper}>
        <Ionicons name="person-outline" size={20} color="#00D1FF" style={commonStyles.inputIcon} />
        <TextInput
          style={commonStyles.input}
          placeholder="Nome completo"
          placeholderTextColor="#666"
          value={formData.name}
          onChangeText={(text) => setFormData({...formData, name: text})}
          editable={isEditing}
        />
      </View>

      <View style={commonStyles.inputWrapper}>
        <Ionicons name="mail-outline" size={20} color="#00D1FF" style={commonStyles.inputIcon} />
        <TextInput
          style={commonStyles.input}
          placeholder="E-mail"
          placeholderTextColor="#666"
          value={formData.email}
          onChangeText={(text) => setFormData({...formData, email: text})}
          editable={isEditing}
          keyboardType="email-address"
        />
      </View>

      <View style={commonStyles.inputWrapper}>
        <Ionicons name="call-outline" size={20} color="#00D1FF" style={commonStyles.inputIcon} />
        <TextInput
          style={commonStyles.input}
          placeholder="Telefone"
          placeholderTextColor="#666"
          value={formData.phone}
          onChangeText={(text) => setFormData({...formData, phone: text})}
          editable={isEditing}
          keyboardType="phone-pad"
        />
      </View>

      <View style={commonStyles.inputWrapper}>
        <Ionicons name="location-outline" size={20} color="#00D1FF" style={commonStyles.inputIcon} />
        <TextInput
          style={commonStyles.input}
          placeholder="Endereço"
          placeholderTextColor="#666"
          value={formData.address}
          onChangeText={(text) => setFormData({...formData, address: text})}
          editable={isEditing}
        />
      </View>
    </View>
  );

  const renderActionButtons = () => (
    <View style={styles.actionButtons}>
      {isEditing ? (
        <>
          <TouchableOpacity style={[commonStyles.secondaryButton, styles.button]} onPress={handleCancel}>
            <Text style={commonStyles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[commonStyles.primaryButton, styles.button]} onPress={handleSave}>
            <Text style={commonStyles.buttonText}>Salvar</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TouchableOpacity style={[commonStyles.primaryButton, styles.button]} onPress={handleEdit}>
            <Text style={commonStyles.buttonText}>Editar Informações</Text>
          </TouchableOpacity>
          
          <ShareButton 
            message={`Olha só meu perfil no Recicla+! Sou ${userData.userType === 'company' ? 'uma empresa' : 'um usuário'} comprometido com a sustentabilidade. Junte-se a mim nessa missão! #ReciclaMais #Sustentabilidade`}
            title="Compartilhar Perfil"
            style={styles.button}
          />
          
          <TouchableOpacity style={[styles.logoutButton, styles.button]} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#FF6B6B" />
            <Text style={styles.logoutText}>Sair da Conta</Text>
          </TouchableOpacity>
        </>
      )}
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
        {renderProfileCard()}
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
  profileCard: {
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#00FF84',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  profileGradient: {
    padding: 20,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 10,
  },
  userTypeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  userTypeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  formContainer: {
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00D1FF',
    marginBottom: 20,
    textShadowColor: '#00D1FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  actionButtons: {
    marginTop: 30,
    marginBottom: 30,
  },
  button: {
    marginBottom: 15,
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderWidth: 1,
    borderColor: '#FF6B6B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

