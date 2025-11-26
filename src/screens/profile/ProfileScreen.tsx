import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import logo from '../../../assets/Logo_recicla.png';
import { commonStyles } from '../../styles/shared/CommonStyles';
import ShareButton from '../../components/ShareButton';
import { userService } from '../../services/userService';

interface ProfileScreenProps {
  navigation: any;
}

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    userType: 'user' as 'user' | 'company',
    phone: '',
    address: '',
  });

  const [formData, setFormData] = useState(userData);

  useEffect(() => {
    carregarPerfil();
  }, []);

  const carregarPerfil = async () => {
    try {
      setLoading(true);
      console.log("📥 Carregando perfil do usuário...");
      
      const profile = await userService.getProfile();
      console.log("✅ Perfil carregado:", JSON.stringify(profile, null, 2));
      
      const dadosFormatados = {
        name: profile.nome || '',
        email: profile.email || '',
        userType: (profile.nivel_conta === 'empresa' ? 'company' : 'user') as 'user' | 'company',
        phone: profile.telefone || '',
        address: profile.endereco || '',
      };
      
      setUserData(dadosFormatados);
      setFormData(dadosFormatados);
      
      console.log("✅ Dados formatados e salvos no estado");
    } catch (error: any) {
      console.error('❌ Erro ao carregar perfil:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados do perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setFormData(userData);
  };

  const handleSave = async () => {
    try {
      // Validação básica
      if (!formData.name.trim()) {
        Alert.alert('Erro', 'O nome é obrigatório.');
        return;
      }

      if (!formData.email.trim()) {
        Alert.alert('Erro', 'O e-mail é obrigatório.');
        return;
      }

      setSaving(true);
      console.log("💾 Salvando alterações do perfil...");
      console.log("📝 Dados a serem salvos:", JSON.stringify(formData, null, 2));

      // Prepara os dados para enviar ao backend
      const dadosParaSalvar = {
        nome: formData.name.trim(),
        email: formData.email.trim(),
        telefone: formData.phone.trim() || null,
        endereco: formData.address.trim() || null,
      };

      const perfilAtualizado = await userService.updateProfile(dadosParaSalvar);
      console.log("✅ Perfil atualizado com sucesso:", JSON.stringify(perfilAtualizado, null, 2));

      // Atualiza o estado local com os dados retornados
      const dadosFormatados = {
        name: perfilAtualizado.nome || formData.name,
        email: perfilAtualizado.email || formData.email,
        userType: (perfilAtualizado.nivel_conta === 'empresa' ? 'company' : 'user') as 'user' | 'company',
        phone: perfilAtualizado.telefone || formData.phone,
        address: perfilAtualizado.endereco || formData.address,
      };

      setUserData(dadosFormatados);
      setFormData(dadosFormatados);
      setIsEditing(false);

      Alert.alert('Sucesso', 'Informações atualizadas com sucesso!');
    } catch (error: any) {
      console.error('❌ Erro ao salvar perfil:', error);
      Alert.alert('Erro', error.message || 'Não foi possível salvar as alterações. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData(userData);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive', 
          onPress: async () => {
            try {
              const { logout } = await import('../../services/authService');
              await logout();
              navigation.replace('Login');
            } catch (error) {
              console.error('Erro ao fazer logout:', error);
              navigation.replace('Login');
            }
          }
        }
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
            <Text style={styles.profileName}>{userData.name || 'Carregando...'}</Text>
            <Text style={styles.profileEmail}>{userData.email || ''}</Text>
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
          <TouchableOpacity 
            style={[commonStyles.secondaryButton, styles.button]} 
            onPress={handleCancel}
            disabled={saving}
          >
            <Text style={commonStyles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[commonStyles.primaryButton, styles.button, saving && { opacity: 0.6 }]} 
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                <Text style={commonStyles.buttonText}>Salvando...</Text>
              </View>
            ) : (
              <Text style={commonStyles.buttonText}>Salvar</Text>
            )}
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

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container} edges={[]}>
        <View style={commonStyles.backgroundPattern} />
        {renderHeader()}
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#00FF84" />
          <Text style={{ marginTop: 10, color: '#00D1FF' }}>Carregando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container} edges={[]}>
      
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

