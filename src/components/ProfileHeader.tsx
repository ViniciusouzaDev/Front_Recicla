import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  SafeAreaView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { commonStyles } from '../styles/shared/CommonStyles';

interface ProfileHeaderProps {
  navigation: any;
  userType?: 'user' | 'company';
  userName?: string;
  userEmail?: string;
}

export default function ProfileHeader({ 
  navigation, 
  userType = 'user', 
  userName = 'Usuário',
  userEmail = 'usuario@email.com'
}: ProfileHeaderProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const showModal = () => {
    setModalVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const hideModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
    });
  };

  const handleLogout = () => {
    hideModal();
    // Aqui você pode implementar a lógica de logout
    navigation.navigate('Login');
  };

  const handleEditProfile = () => {
    hideModal();
    navigation.navigate('Profile');
  };

  const handleCompanyRegister = () => {
    hideModal();
    navigation.navigate('CompanyRegister');
  };

  const handleBenefitsRegister = () => {
    hideModal();
    navigation.navigate('BenefitsRegister');
  };

  return (
    <>
      <TouchableOpacity style={styles.avatarButton} onPress={showModal}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={20} color="#fff" />
        </View>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={hideModal}
      >
        <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
          <TouchableOpacity 
            style={styles.modalBackground} 
            activeOpacity={1} 
            onPress={hideModal}
          >
            <View style={styles.modalContent}>
              <LinearGradient
                colors={['#00FF84', '#00E676', '#00C853']}
                style={styles.profileGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.profileHeader}>
                  <View style={styles.avatarLarge}>
                    <Ionicons name="person" size={30} color="#fff" />
                  </View>
                  <View style={styles.profileInfo}>
                    <Text style={styles.userName}>{userName}</Text>
                    <Text style={styles.userEmail}>{userEmail}</Text>
                    <Text style={styles.userType}>
                      {userType === 'company' ? 'Empresa' : 'Usuário Comum'}
                    </Text>
                  </View>
                </View>
              </LinearGradient>

              <View style={styles.menuItems}>
                <TouchableOpacity style={styles.menuItem} onPress={handleEditProfile}>
                  <Ionicons name="person-outline" size={24} color="#00D1FF" />
                  <Text style={styles.menuText}>Editar Perfil</Text>
                </TouchableOpacity>

                {userType === 'company' && (
                  <>
                    <TouchableOpacity style={styles.menuItem} onPress={handleCompanyRegister}>
                      <Ionicons name="business-outline" size={24} color="#00D1FF" />
                      <Text style={styles.menuText}>Cadastrar Empresa</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={handleBenefitsRegister}>
                      <Ionicons name="gift-outline" size={24} color="#00D1FF" />
                      <Text style={styles.menuText}>Cadastrar Benefícios</Text>
                    </TouchableOpacity>
                  </>
                )}

                <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                  <Ionicons name="log-out-outline" size={24} color="#FF6B6B" />
                  <Text style={[styles.menuText, styles.logoutText]}>Sair</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  avatarButton: {
    padding: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00FF84',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00FF84',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'flex-end',
  paddingTop: 100,
  // Espaço para tocar fora do modal
  },
  modalContent: {
    backgroundColor: '#0A0A0A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: '#00D1FF',
    borderBottomWidth: 0,
    shadowColor: '#00D1FF',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  profileGradient: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  userType: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  menuItems: {
    padding: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 5,
  },
  menuText: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 15,
    fontWeight: '500',
  },
  logoutText: {
    color: '#FF6B6B',
  },
  themeToggleContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
});

