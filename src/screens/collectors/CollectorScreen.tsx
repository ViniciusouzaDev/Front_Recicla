import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { collectorScreenStyles } from '../../../src/styles/collectors/CollectorScreenStyles';
import ProfileHeader from '../../components/ProfileHeader';
import { collectorService } from '../../services/CollectorService';
import { CollectionRequest, CollectionStatus } from '../../types/CollectionTypes';
import { tokenApi } from '../../services/tokenApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  calculateDistance, 
  isUserNearCollection, 
  formatDistance, 
  getCurrentLocation,
  Coordinates 
} from '../../../utils/locationUtils';

interface Collection {
  id: string;
  material: string;
  materialName: string;
  materialColor: string;
  materialIcon: string;
  address: string;
  photo: string;
  distance: number;
  points: number;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
  coordinates: Coordinates;
  user: {
    name: string;
    avatar: string;
  };
  token?: string; // Token associado à coleta em andamento
}

interface CollectorScreenProps {
  navigation: any;
}

export default function CollectorScreen({ navigation }: CollectorScreenProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'pending' | 'in_progress' | 'completed'>('pending');
  const [refreshing, setRefreshing] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Mockups específicos para cada status
  const getMockCollectionsByStatus = (status: 'pending' | 'in_progress' | 'completed'): Collection[] => {
    const baseCollections = {
      pending: [
        {
          id: 'pending_1',
          material: 'paper',
          materialName: 'Papel',
          materialColor: '#00D1FF',
          materialIcon: '📄',
          address: 'Rua das Flores, 123 - Centro, São Paulo',
          photo: 'https://via.placeholder.com/300x200/00D1FF/FFFFFF?text=Papel+Reciclável',
          distance: 0.8,
          points: 50,
          status: 'pending' as const,
          createdAt: '2024-01-15T10:30:00Z',
          coordinates: { latitude: -23.5505, longitude: -46.6333 },
          user: {
            name: 'João Silva',
            avatar: 'https://via.placeholder.com/50x50/00FF84/FFFFFF?text=JS'
          }
        },
        {
          id: 'pending_2',
          material: 'plastic',
          materialName: 'Plástico',
          materialColor: '#FF6B00',
          materialIcon: '🥤',
          address: 'Av. Paulista, 456 - Bela Vista, São Paulo',
          photo: 'https://via.placeholder.com/300x200/FF6B00/FFFFFF?text=Garrafas+PET',
          distance: 1.2,
          points: 75,
          status: 'pending' as const,
          createdAt: '2024-01-15T11:15:00Z',
          coordinates: { latitude: -21.208810796503606, longitude: -47.75510620794601 },
          user: {
            name: 'Maria Santos',
            avatar: 'https://via.placeholder.com/50x50/00FF84/FFFFFF?text=MS'
          }
        },
        {
          id: 'pending_3',
          material: 'metal',
          materialName: 'Metal',
          materialColor: '#FFD600',
          materialIcon: '🥫',
          address: 'Rua Oscar Freire, 321 - Jardins, São Paulo',
          photo: 'https://via.placeholder.com/300x200/FFD600/FFFFFF?text=Latas+de+Alumínio',
          distance: 2.5,
          points: 60,
          status: 'pending' as const,
          createdAt: '2024-01-15T08:20:00Z',
          coordinates: { latitude: -23.5687, longitude: -46.6693 },
          user: {
            name: 'Ana Oliveira',
            avatar: 'https://via.placeholder.com/50x50/00FF84/FFFFFF?text=AO'
          }
        }
      ],
      in_progress: [
        {
          id: 'progress_1',
          material: 'glass',
          materialName: 'Vidro',
          materialColor: '#00FF84',
          materialIcon: '🍾',
          address: 'Rua Augusta, 789 - Consolação, São Paulo',
          photo: 'https://via.placeholder.com/300x200/00FF84/FFFFFF?text=Garrafas+de+Vidro',
          distance: 1.8,
          points: 100,
          status: 'in_progress' as const,
          createdAt: '2024-01-15T09:45:00Z',
          coordinates: { latitude: -23.5475, longitude: -46.6405 },
          user: {
            name: 'Pedro Costa',
            avatar: 'https://via.placeholder.com/50x50/00FF84/FFFFFF?text=PC'
          }
        },
        {
          id: 'progress_2',
          material: 'plastic',
          materialName: 'Plástico',
          materialColor: '#FF6B00',
          materialIcon: '🥤',
          address: 'Rua Haddock Lobo, 456 - Cerqueira César, São Paulo',
          photo: 'https://via.placeholder.com/300x200/FF6B00/FFFFFF?text=Embalagens+Plásticas',
          distance: 0.5,
          points: 75,
          status: 'in_progress' as const,
          createdAt: '2024-01-15T14:30:00Z',
          coordinates: { latitude: -23.5613, longitude: -46.6565 },
          user: {
            name: 'Carlos Mendes',
            avatar: 'https://via.placeholder.com/50x50/00FF84/FFFFFF?text=CM'
          }
        }
      ],
      completed: [
        {
          id: 'completed_1',
          material: 'paper',
          materialName: 'Papel',
          materialColor: '#00D1FF',
          materialIcon: '📄',
          address: 'Rua da Consolação, 1000 - Centro, São Paulo',
          photo: 'https://via.placeholder.com/300x200/00D1FF/FFFFFF?text=Jornais+e+Revistas',
          distance: 0,
          points: 50,
          status: 'completed' as const,
          createdAt: '2024-01-14T16:20:00Z',
          coordinates: { latitude: -23.5475, longitude: -46.6405 },
          user: {
            name: 'Fernanda Lima',
            avatar: 'https://via.placeholder.com/50x50/00FF84/FFFFFF?text=FL'
          }
        },
        {
          id: 'completed_2',
          material: 'glass',
          materialName: 'Vidro',
          materialColor: '#00FF84',
          materialIcon: '🍾',
          address: 'Av. Faria Lima, 2000 - Itaim Bibi, São Paulo',
          photo: 'https://via.placeholder.com/300x200/00FF84/FFFFFF?text=Potes+de+Vidro',
          distance: 0,
          points: 100,
          status: 'completed' as const,
          createdAt: '2024-01-14T10:15:00Z',
          coordinates: { latitude: -23.5687, longitude: -46.6693 },
          user: {
            name: 'Roberto Alves',
            avatar: 'https://via.placeholder.com/50x50/00FF84/FFFFFF?text=RA'
          }
        },
        {
          id: 'completed_3',
          material: 'metal',
          materialName: 'Metal',
          materialColor: '#FFD600',
          materialIcon: '🥫',
          address: 'Rua Bela Cintra, 500 - Jardins, São Paulo',
          photo: 'https://via.placeholder.com/300x200/FFD600/FFFFFF?text=Latas+de+Refrigerante',
          distance: 0,
          points: 60,
          status: 'completed' as const,
          createdAt: '2024-01-13T14:45:00Z',
          coordinates: { latitude: -23.5687, longitude: -46.6693 },
          user: {
            name: 'Lucia Ferreira',
            avatar: 'https://via.placeholder.com/50x50/00FF84/FFFFFF?text=LF'
          }
        }
      ]
    };

    return baseCollections[status];
  };

  useEffect(() => {
    loadCollections();
    getCurrentUserLocation();
  }, []);

  useEffect(() => {
    if (userLocation) {
      loadCollections();
    }
  }, [userLocation]);

  useEffect(() => {
    loadCollections();
  }, [selectedFilter]);

  const loadCollections = async () => {
    try {
      // Buscar TODAS as coletas do backend e filtrar por status na UI
      const backendCollections = await collectorService.getAllCollections();
      const convertedCollections = collectorService.convertCollectionsForScreen(backendCollections, userLocation ?? undefined);

      const filtered = convertedCollections.filter(c => c.status === selectedFilter);
      const mockCollections = getMockCollectionsByStatus(selectedFilter);
      const finalCollections = filtered.length > 0 ? filtered : mockCollections;
        
      setCollections(finalCollections);
    } catch (error) {
      console.error('Erro ao carregar coletas:', error);
      // Em caso de erro, usar mockups
      const mockCollections = getMockCollectionsByStatus(selectedFilter);
      setCollections(mockCollections);
    }
  };

  const getMaterialColor = (materialType: string): string => {
    switch (materialType) {
      case 'paper': return '#00D1FF';
      case 'glass': return '#00FF84';
      case 'metal': return '#FFD600';
      case 'plastic': return '#FF6B00';
      default: return '#00D1FF';
    }
  };

  const getMaterialIcon = (materialType: string): string => {
    switch (materialType) {
      case 'paper': return '📄';
      case 'glass': return '🍾';
      case 'metal': return '🥫';
      case 'plastic': return '🥤';
      default: return '♻️';
    }
  };

  const getMaterialPoints = (materialType: string): number => {
    switch (materialType) {
      case 'paper': return 50;
      case 'glass': return 100;
      case 'metal': return 60;
      case 'plastic': return 75;
      default: return 50;
    }
  };

  const getCurrentUserLocation = async () => {
    try {
      setIsLoadingLocation(true);
      const location = await getCurrentLocation();
      if (location) {
        setUserLocation(location);
      } else {
        Alert.alert(
          'Localização não disponível',
          'Não foi possível obter sua localização. Você precisa estar próximo ao local da coleta para aceitá-la.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Erro ao obter localização:', error);
      Alert.alert(
        'Erro de localização',
        'Não foi possível obter sua localização. Verifique as permissões do app.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCollections();
    setRefreshing(false);
  };

  const handleCollectionPress = (collection: Collection) => {
    // Animação de toque
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    Alert.alert(
      'Detalhes da Coleta',
      `Material: ${collection.materialName}\nEndereço: ${collection.address}\nDistância: ${collection.distance} km\nPontos: ${collection.points}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: collection.status === 'pending' ? 'Aceitar Coleta' : 'Ver Detalhes',
          onPress: () => {
            if (collection.status === 'pending') {
              handleAcceptCollection(collection.id);
            }
          }
        }
      ]
    );
  };

  const handleAcceptCollection = async (collectionId: string) => {
    if (!userLocation) {
      Alert.alert(
        'Localização necessária',
        'Não foi possível obter sua localização. Você precisa estar próximo ao local da coleta para aceitá-la.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Tentar novamente', onPress: getCurrentUserLocation }
        ]
      );
      return;
    }

    const collection = collections.find(c => c.id === collectionId);
    if (!collection) return;

    const isNear = isUserNearCollection(userLocation, collection.coordinates, 0.050);
    
    if (!isNear) {
      const distance = calculateDistance(userLocation, collection.coordinates);
      Alert.alert(
        'Muito distante',
        `Você está a ${formatDistance(distance)} da coleta. Você precisa estar a no máximo 50m de distância para aceitar a coleta.`,
        [{ text: 'OK' }]
      );
      return;
    }

    // Quando a distância permitir, aceitar coleta e gerar token automaticamente
    try {
      // 1. Aceitar a coleta no backend primeiro
      const success = await collectorService.assignCollectorToCollection(
        collectionId, 
      );

      if (!success) {
        Alert.alert('Erro', 'Não foi possível aceitar a coleta. Tente novamente.');
        return;
      }

      // 2. Gerar o token automaticamente após aceitar a coleta
      let generatedToken: string | null = null;
      try {
        const tokenResponse = await tokenApi.gerarToken(collectionId);
        generatedToken = tokenResponse.token;
        
        // Validar formato do token (máximo 7 dígitos, apenas números)
        if (!/^\d{1,7}$/.test(generatedToken)) {
          throw new Error('Token gerado não está no formato correto (máximo 7 dígitos numéricos)');
        }
        
        // 3. Armazenar token no AsyncStorage associado à coleta
        await AsyncStorage.setItem(`token_${collectionId}`, generatedToken);
        console.log(`Token gerado e armazenado para coleta ${collectionId}`);
      } catch (tokenError: any) {
        console.error('Erro ao gerar token:', tokenError);
        Alert.alert(
          'Erro ao gerar token',
          'A coleta foi aceita, mas não foi possível gerar o token. Tente finalizar a coleta mais tarde.',
          [{ text: 'OK' }]
        );
        // Mesmo com erro no token, atualiza o estado da coleta
        setCollections(prev => 
          prev.map(collection => 
            collection.id === collectionId 
              ? { ...collection, status: 'in_progress' as const }
              : collection
          )
        );
        return;
      }

      // 4. Atualizar estado da coleta com status 'in_progress'
      setCollections(prev => 
        prev.map(collection => 
          collection.id === collectionId 
            ? { 
                ...collection, 
                status: 'in_progress' as const
              }
            : collection
        )
      );
      
      // 5. Redirecionar automaticamente para a tela de Finalizar Coleta (sem expor token)
      navigation.navigate('FinalizarColeta', { 
        coletaId: collectionId
      });
      
    } catch (error: any) {
      console.error('Erro ao aceitar coleta:', error);
      Alert.alert(
        'Erro', 
        error.message || 'Não foi possível aceitar a coleta. Tente novamente.'
      );
    }
  };

  const handleCompleteCollection = async (collectionId: string) => {
    try {
      const success = await collectorService.completeCollection(collectionId, 'Coleta finalizada pelo coletor');
      
      if (success) {
        setCollections(prev => 
          prev.map(collection => 
            collection.id === collectionId 
              ? { ...collection, status: 'completed' as const }
              : collection
          )
        );
        Alert.alert('Parabéns!', 'Coleta finalizada! Pontos creditados na conta do usuário.');
      } else {
        Alert.alert('Erro', 'Não foi possível finalizar a coleta. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao finalizar coleta:', error);
      Alert.alert('Erro', 'Não foi possível finalizar a coleta. Tente novamente.');
    }
  };

  const filteredCollections = collections.filter(collection => {
    return collection.status === selectedFilter;
  });

  const renderHeader = () => (
    <View style={collectorScreenStyles.header}>
      <View style={collectorScreenStyles.titleContainer}>
        <Text style={collectorScreenStyles.title}>Coletas Disponíveis</Text>
        <View style={collectorScreenStyles.locationStatusContainer}>
          <Ionicons 
            name={isLoadingLocation ? "hourglass" : userLocation ? "location" : "location"} 
            size={16} 
            color={userLocation ? "#00FF84" : "#FF6B6B"} 
          />
          <Text style={[
            collectorScreenStyles.locationStatusText,
            { color: userLocation ? "#00FF84" : "#FF6B6B" }
          ]}>
            {isLoadingLocation ? "Obtendo localização..." : userLocation ? "Localização ativa" : "Localização necessária"}
          </Text>
        </View>
        <Text style={collectorScreenStyles.collectorIcon}></Text>
      </View>
      
      <ProfileHeader 
        navigation={navigation}
      />
    </View>
  );

  const renderFilterTabs = () => (
    <View style={collectorScreenStyles.filterContainer}>
      <TouchableOpacity
        style={[
          collectorScreenStyles.filterTab,
          selectedFilter === 'pending' && collectorScreenStyles.activeFilterTab
        ]}
        onPress={() => setSelectedFilter('pending')}
      >
        <Text style={[
          collectorScreenStyles.filterTabText,
          selectedFilter === 'pending' && collectorScreenStyles.activeFilterTabText
        ]}>
          Pendentes
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          collectorScreenStyles.filterTab,
          selectedFilter === 'in_progress' && collectorScreenStyles.activeFilterTab
        ]}
        onPress={() => setSelectedFilter('in_progress')}
      >
        <Text style={[
          collectorScreenStyles.filterTabText,
          selectedFilter === 'in_progress' && collectorScreenStyles.activeFilterTabText
        ]}>
          Em Andamento
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          collectorScreenStyles.filterTab,
          selectedFilter === 'completed' && collectorScreenStyles.activeFilterTab
        ]}
        onPress={() => setSelectedFilter('completed')}
      >
        <Text style={[
          collectorScreenStyles.filterTabText,
          selectedFilter === 'completed' && collectorScreenStyles.activeFilterTabText
        ]}>
          Finalizadas
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderCollectionCard = (collection: Collection) => (
    <Animated.View
      key={collection.id}
      style={[
        collectorScreenStyles.collectionCard,
        { transform: [{ scale: scaleAnim }] }
      ]}
    >
      <TouchableOpacity
        style={collectorScreenStyles.cardContent}
        onPress={() => handleCollectionPress(collection)}
      >
        {/* Header do Card */}
        <View style={collectorScreenStyles.cardHeader}>
          <View style={collectorScreenStyles.materialInfo}>
            <View style={[
              collectorScreenStyles.materialIconContainer,
              { backgroundColor: collection.materialColor }
            ]}>
              <Text style={collectorScreenStyles.materialIconText}>{collection.materialIcon}</Text>
            </View>
            <View>
              <Text style={collectorScreenStyles.materialName}>{collection.materialName}</Text>
              <Text style={collectorScreenStyles.pointsText}>{collection.points} pontos</Text>
            </View>
          </View>
          
          <View style={[
            collectorScreenStyles.statusBadge,
            { 
              backgroundColor: collection.status === 'pending' ? '#FFD600' : 
                              collection.status === 'in_progress' ? '#00D1FF' : '#00FF84'
            }
          ]}>
            <Text style={collectorScreenStyles.statusText}>
              {collection.status === 'pending' ? 'Pendente' : 
               collection.status === 'in_progress' ? 'Em Andamento' : 'Finalizada'}
            </Text>
          </View>
        </View>

        {/* Foto do Material */}
        <View style={collectorScreenStyles.photoContainer}>
          <Image source={{ uri: collection.photo }} style={collectorScreenStyles.materialPhoto} />
        </View>

        {/* Informações da Coleta */}
        <View style={collectorScreenStyles.collectionInfo}>
          <View style={collectorScreenStyles.infoRow}>
            <Ionicons name="location" size={16} color="#00D1FF" />
            <Text style={collectorScreenStyles.addressText} numberOfLines={2}>
              {collection.address}
            </Text>
          </View>
          
          <View style={collectorScreenStyles.infoRow}>
            <Ionicons name="navigate" size={16} color="#00FF84" />
            <Text style={collectorScreenStyles.distanceText}>
              {userLocation 
                ? `${formatDistance(calculateDistance(userLocation, collection.coordinates))} de distância`
                : `${collection.distance} km de distância`
              }
            </Text>
          </View>
          
          <View style={collectorScreenStyles.infoRow}>
            <Ionicons name="person" size={16} color="#FFD600" />
            <Text style={collectorScreenStyles.userText}>
              Solicitado por {collection.user.name}
            </Text>
          </View>
        </View>

        {/* Botões de Ação */}
        <View style={collectorScreenStyles.actionButtons}>
          {collection.status === 'pending' && (
            <TouchableOpacity
              style={[
                collectorScreenStyles.acceptButton,
                (!userLocation || !isUserNearCollection(userLocation, collection.coordinates, 2.0)) && 
                collectorScreenStyles.disabledButton
              ]}
              onPress={() => handleAcceptCollection(collection.id)}
              disabled={!userLocation || !isUserNearCollection(userLocation, collection.coordinates, 2.0)}
            >
              <LinearGradient
                colors={(!userLocation || !isUserNearCollection(userLocation, collection.coordinates, 2.0)) 
                  ? ['#666', '#555'] 
                  : ['#00FF84', '#00E676']
                }
                style={collectorScreenStyles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons 
                  name={!userLocation ? "location" : "checkmark"} 
                  size={20} 
                  color={(!userLocation || !isUserNearCollection(userLocation, collection.coordinates, 2.0)) ? "#999" : "#000"} 
                />
                <Text style={[
                  collectorScreenStyles.acceptButtonText,
                  (!userLocation || !isUserNearCollection(userLocation, collection.coordinates, 2.0)) && 
                  collectorScreenStyles.disabledButtonText
                ]}>
                  {!userLocation 
                    ? 'Localização necessária' 
                    : !isUserNearCollection(userLocation, collection.coordinates, 2.0)
                    ? 'Muito distante'
                    : 'Aceitar Coleta'
                  }
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
          
          {collection.status === 'in_progress' && (
            <TouchableOpacity
              style={collectorScreenStyles.completeButton}
              onPress={async () => {
            // Navegar para finalizar sem expor token
            navigation.navigate('FinalizarColeta', { 
              coletaId: collection.id
            });
              }}
            >
              <LinearGradient
                colors={['#FFD600', '#FFC107']}
                style={collectorScreenStyles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="trophy" size={20} color="#000" />
                <Text style={collectorScreenStyles.completeButtonText}>Finalizar Coleta</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderEmptyState = () => (
    <View style={collectorScreenStyles.emptyState}>
      <Ionicons name="leaf" size={80} color="#00FF84" />
      <Text style={collectorScreenStyles.emptyTitle}>
        {selectedFilter === 'pending' ? 'Nenhuma coleta pendente' :
         selectedFilter === 'in_progress' ? 'Nenhuma coleta em andamento' :
         'Nenhuma coleta finalizada'}
      </Text>
      <Text style={collectorScreenStyles.emptySubtitle}>
        {selectedFilter === 'pending' 
          ? 'Não há coletas pendentes no momento. Tente novamente mais tarde.'
          : selectedFilter === 'in_progress'
          ? 'Você não tem coletas em andamento no momento.'
          : 'Você ainda não finalizou nenhuma coleta.'
        }
      </Text>
      <TouchableOpacity style={collectorScreenStyles.refreshButton} onPress={onRefresh}>
        <Ionicons name="refresh" size={20} color="#00D1FF" />
        <Text style={collectorScreenStyles.refreshButtonText}>Atualizar</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTabBar = () => {
    const tabs = [
      { id: 'Home', icon: 'home', label: 'Home' },
      { id: 'Trophies', icon: 'trophy', label: 'Ranking' },
      { id: 'Recycle', icon: 'leaf', label: 'Reciclar' },
      { id: 'Collector', icon: 'car', label: 'Coletador' },
    ];

    return (
      <View style={collectorScreenStyles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              collectorScreenStyles.tab,
              tab.id === 'Collector' && collectorScreenStyles.activeTab
            ]}
            onPress={() => {
              if (tab.id === 'Home') {
                navigation.navigate('Dashboard');
              } else if (tab.id === 'Trophies') {
                navigation.navigate('Ranking');
              } else if (tab.id === 'Recycle') {
                navigation.navigate('Recycle');
              }
            }}
          >
            <Ionicons
              name={tab.icon as any}
              size={24}
              color={tab.id === 'Collector' ? '#00D1FF' : '#666'}
            />
            <Text style={[
              collectorScreenStyles.tabLabel,
              tab.id === 'Collector' && collectorScreenStyles.activeTabLabel
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={collectorScreenStyles.container}>
      
      {/* Background Pattern */}
      <View style={collectorScreenStyles.backgroundPattern} />
      
      {renderHeader()}
      
      {renderFilterTabs()}
      
      <ScrollView 
        style={collectorScreenStyles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00FF84"
            colors={['#00FF84']}
          />
        }
      >
        {filteredCollections.length > 0 ? (
          filteredCollections.map(renderCollectionCard)
        ) : (
          renderEmptyState()
        )}
      </ScrollView>
      
      {renderTabBar()}
    </SafeAreaView>
  );
}
