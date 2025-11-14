import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';

interface ShareButtonProps {
  message: string;
  title?: string;
  showFacebook?: boolean;
  showInstagram?: boolean;
  style?: any;
}

export default function ShareButton({ 
  message, 
  title = "Compartilhar", 
  showFacebook = true, 
  showInstagram = true,
  style 
}: ShareButtonProps) {
  
  // TODO: Implementar compartilhamento específico do Facebook
  // TODO: Implementar compartilhamento específico do Instagram
  // TODO: Adicionar mais redes sociais (Twitter, LinkedIn, etc.)
  // TODO: Implementar analytics de compartilhamento
  // TODO: Adicionar preview personalizado do conteúdo
  
  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: message,
        title: title,
      });

      if (result.action === Share.sharedAction) {
        console.log('Conteúdo compartilhado com sucesso');
      }
    } catch (error) {
      console.log('Erro ao compartilhar:', error);
      Alert.alert('Erro', 'Não foi possível compartilhar no momento');
    }
  };

  const handleFacebookShare = () => {
    // TODO: Implementar compartilhamento específico do Facebook
    // Por enquanto, usar o compartilhamento nativo
    handleShare();
  };

  const handleInstagramShare = () => {
    // TODO: Implementar compartilhamento específico do Instagram
    // Por enquanto, usar o compartilhamento nativo
    handleShare();
  };

  const showShareOptions = () => {
    const options = [];
    
    if (showFacebook) {
      options.push({
        text: 'Facebook',
        onPress: handleFacebookShare,
        icon: 'logo-facebook'
      });
    }
    
    if (showInstagram) {
      options.push({
        text: 'Instagram',
        onPress: handleInstagramShare,
        icon: 'logo-instagram'
      });
    }
    
    options.push({
      text: 'Outros',
      onPress: handleShare,
      icon: 'share-social'
    });

    Alert.alert(
      'Compartilhar',
      'Escolha onde compartilhar:',
      options.map(option => ({
        text: option.text,
        onPress: option.onPress,
        style: 'default' as const
      }))
    );
  };

  return (
    <TouchableOpacity 
      style={[styles.shareButton, style]} 
      onPress={showShareOptions}
    >
      <Ionicons name="share-social" size={20} color="#000" />
      <Text style={styles.shareButtonText}>Compartilhar</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  shareButton: {
    backgroundColor: '#00D1FF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00D1FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  shareButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
});