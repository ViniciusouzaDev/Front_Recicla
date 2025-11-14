import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import logo from '../../../assets/Logo_recicla.png';
import { commonStyles } from '../../styles/shared/CommonStyles';
import ProfileHeader from '../../components/ProfileHeader';
import { collectionService } from '../../services/CollectionService';
import { CollectionRequest, CollectionStatus } from '../../types/CollectionTypes';

interface CollectionStatusScreenProps {
  navigation: any;
}

interface User {
  id: string;
  name: string;
  email: string;
}

export default function CollectionStatusScreen({ navigation }: CollectionStatusScreenProps) {
  const [collections, setCollections] = useState<CollectionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    loadUserAndCollections();
  }, []);

  // Carregar usuário logado e suas coletas
  const loadUserAndCollections = async () => {
    try {
      setIsLoading(true);
      const userData = await AsyncStorage.getItem('user'); // Supondo que você salvou os dados do usuário no AsyncStorage
      if (userData) {
        const parsedUser: User = JSON.parse(userData);
        setUser(parsedUser);

        const userCollections = await collectionService.getCollectionsByUser(parsedUser.id);
        setCollections(userCollections);
      } else {
        console.warn('Usuário não logado');
        setCollections([]);
      }
    } catch (error) {
      console.error('Erro ao carregar coletas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserAndCollections();
    setRefreshing(false);
  };

  const getStatusColor = (status: CollectionStatus): string => {
    switch (status) {
      case 'Solicitada':
        return '#FFD600';
      case 'Em andamento':
        return '#00D1FF';
      case 'Concluída':
        return '#00FF84';
      case 'Cancelada':
        return '#FF6B6B';
      default:
        return '#666';
    }
  };

  const getStatusIcon = (status: CollectionStatus): string => {
    switch (status) {
      case 'Solicitada':
        return 'time';
      case 'Em andamento':
        return 'car';
      case 'Concluída':
        return 'checkmark-circle';
      case 'Cancelada':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.logoContainer}>
        <Image source={logo} style={styles.logo} />
        <Text style={styles.appName}>Recicla+</Text>
      </View>

      <ProfileHeader
        navigation={navigation}
        userType="user"
        userName={user?.name || 'Usuário'}
        userEmail={user?.email || 'email@exemplo.com'}
      />
    </View>
  );

  const renderCollectionCard = (collection: CollectionRequest) => (
    <View key={collection.id} style={styles.collectionCard}>
      <View style={styles.collectionHeader}>
        <View style={styles.materialInfo}>
          <Text style={styles.materialName}>{collection.materialName}</Text>
          <Text style={styles.collectionDate}>{formatDate(collection.createdAt)}</Text>
        </View>
        <View
          style={[styles.statusBadge, { backgroundColor: getStatusColor(collection.status) }]}
        >
          <Ionicons name={getStatusIcon(collection.status) as any} size={16} color="#000" />
          <Text style={styles.statusText}>
            {collection.status === 'Concluída' ? 'Finalizada' : collection.status}
          </Text>
        </View>
      </View>

      <View style={styles.photoContainer}>
        <Image source={{ uri: collection.photoUri }} style={styles.materialPhoto} />
      </View>

      <View style={styles.collectionDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="location" size={16} color="#00D1FF" />
          <Text style={styles.detailText}>{collection.address}</Text>
        </View>

        {collection.collectorName && (
          <View style={styles.detailRow}>
            <Ionicons name="person" size={16} color="#00FF84" />
            <Text style={styles.detailText}>Coletor: {collection.collectorName}</Text>
          </View>
        )}

        {collection.estimatedTime && (
          <View style={styles.detailRow}>
            <Ionicons name="time" size={16} color="#FFD600" />
            <Text style={styles.detailText}>Chegada estimada: {collection.estimatedTime}</Text>
          </View>
        )}

        {collection.notes && (
          <View style={styles.detailRow}>
            <Ionicons name="document-text" size={16} color="#666" />
            <Text style={styles.detailText}>{collection.notes}</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={commonStyles.emptyState}>
      <Ionicons name="leaf" size={60} color="#00FF84" />
      <Text style={commonStyles.emptyTitle}>Nenhuma coleta encontrada</Text>
      <Text style={commonStyles.emptySubtitle}>
        Você ainda não fez nenhuma solicitação de coleta.{'\n'}
        Que tal começar reciclando?
      </Text>
      <TouchableOpacity
        style={commonStyles.primaryButton}
        onPress={() => navigation.navigate('Recycle')}
      >
        <Text style={commonStyles.buttonText}>Fazer Primeira Coleta</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTabBar = () => {
    const tabs = [
      { id: 'Home', icon: 'home', label: 'Home' },
      { id: 'Trophies', icon: 'trophy', label: 'Troféus' },
      { id: 'Recycle', icon: 'leaf', label: 'Reciclar' },
      { id: 'Collections', icon: 'list', label: 'Coletas' },
      { id: 'Collector', icon: 'car', label: 'Coletador' },
    ];

    return (
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, tab.id === 'Collections' && styles.activeTab]}
            onPress={() => {
              if (tab.id === 'Home') navigation.navigate('Dashboard');
              else if (tab.id === 'Trophies') navigation.navigate('Ranking');
              else if (tab.id === 'Recycle') navigation.navigate('Recycle');
              else if (tab.id === 'Collector') navigation.navigate('Collector');
            }}
          >
            <Ionicons
              name={tab.icon as any}
              size={24}
              color={tab.id === 'Collections' ? '#00FF84' : '#666'}
            />
            <Text style={[styles.tabLabel, tab.id === 'Collections' && styles.activeTabLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={commonStyles.backgroundPattern} />
      {renderHeader()}

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#00FF84']}
            tintColor="#00FF84"
          />
        }
      >
        <Text style={styles.sectionTitle}>Minhas Coletas</Text>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Carregando coletas...</Text>
          </View>
        ) : collections.length > 0 ? (
          collections.map(renderCollectionCard)
        ) : (
          renderEmptyState()
        )}
      </ScrollView>

      {renderTabBar()}
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00D1FF',
    marginTop: 20,
    marginBottom: 15,
    textShadowColor: '#00D1FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#666',
    fontSize: 16,
  },
  collectionCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#00D1FF',
    padding: 15,
    marginBottom: 15,
    shadowColor: '#00D1FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  collectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  materialInfo: {
    flex: 1,
  },
  materialName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00FF84',
    marginBottom: 4,
  },
  collectionDate: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  photoContainer: {
    marginVertical: 10,
    alignItems: 'center',
  },
  materialPhoto: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  collectionDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderTopWidth: 1,
    borderTopColor: '#00D1FF',
    paddingVertical: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeTab: {
    backgroundColor: 'rgba(0, 255, 132, 0.1)',
  },
  tabLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  activeTabLabel: {
    color: '#00FF84',
    fontWeight: '600',
    textShadowColor: '#00FF84',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
});
