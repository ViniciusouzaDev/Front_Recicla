
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { rankingScreenStyles } from '../../../src/styles/ranking/RankingScreenStyles';
import ProfileHeader from '../../components/ProfileHeader';
import { rankingService } from '../../../src/services/rankingService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: number;
  name: string;
  points: number;
  avatar: string;
  level: string;
}

interface RankingScreenProps {
  navigation: any;
}

export default function RankingScreen({ navigation }: RankingScreenProps) {
  const [activeTab, setActiveTab] = useState('Trophies');
  const [confettiAnimation] = useState(new Animated.Value(0));
  const [userProfile, setUserProfile] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tabs = [
    { id: 'Home', icon: 'home', label: 'Home' },
    { id: 'Trophies', icon: 'trophy', label: 'Troféus' },
    { id: 'Recycle', icon: 'leaf', label: 'Reciclar' },
    { id: 'Collector', icon: 'car', label: 'Coletador' },
  ];

  useEffect(() => {
    const checkToken = async () => {
    const token = await AsyncStorage.getItem("token");
    console.log("TOKEN SALVO:", token);
  };
  checkToken();
    const confettiLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(confettiAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(confettiAnimation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    confettiLoop.start();

    const fetchRanking = async () => {
      console.log("REQUISIÇÃO → ENVIANDO TOKEN?");
      console.log(await AsyncStorage.getItem("token"));

      try {
        const data = await rankingService.getAllRankings();
        if (!Array.isArray(data)) {
          setError("Formato inválido do ranking");
          return;
        }

        const formatted: User[] = data.map((item: any) => ({
          id: item.usuario.usuario_id,
          name: item.usuario.nome,
          // 🔹 Pega total_pontos ou pontos, converte para número seguro
          points: Number(item.total_pontos ?? item.pontos ?? 0),
          avatar: '🌿',
          level: item.usuario.nivel_conta || 'Reciclador',
        }));

        const uniqueUsers = Array.from(new Map(formatted.map(u => [u.id, u])).values());

        // Ordenar por pontos decrescente
        setUsers(uniqueUsers.sort((a, b) => b.points - a.points));
      } catch (err: any) {
        setError(err.message || 'Erro ao buscar ranking');
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();

    return () => confettiLoop.stop();
  }, []);

  const getRankingIcon = (position: number) => {
    switch (position) {
      case 1: return '🏆';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏅';
    }
  };

  const getProgressBarColor = (points: number) => {
    if (points >= 1000) return '#4CAF50';
    if (points >= 800) return '#8BC34A';
    if (points >= 600) return '#FFC107';
    if (points >= 400) return '#FF9800';
    return '#FF5722';
  };

  const getProgressPercentage = (points: number) => {
    if (!users.length) return 0;
    const maxPoints = Math.max(...users.map(u => u.points));
    return (points / maxPoints) * 100;
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0A0A' }}>
        <Text style={{ color: '#00FF84', fontSize: 18 }}>Carregando ranking...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0A0A' }}>
        <Text style={{ color: '#FF4444', fontSize: 18 }}>{error}</Text>
      </View>
    );
  }

  const renderHeader = () => (
    <View style={rankingScreenStyles.header}>
      <View style={rankingScreenStyles.titleContainer}>
        <Text style={rankingScreenStyles.title}>Ranking de Recicladores</Text>
      </View>

      {userProfile && (
      <ProfileHeader 
        navigation={navigation}
          userType="user"
          userName={userProfile.nome}
          userEmail={userProfile.email}
      />
      )}
    </View>
  );

  const renderTopThree = () => (
    <View style={rankingScreenStyles.topThreeContainer}>
      {users.slice(0, 3).map((user, index) => {
        const position = index + 1;
        const isFirst = position === 1;
        return (
          <View key={`top-${user.id}-${index}`} style={rankingScreenStyles.topThreeItem}>
            {isFirst && (
              <Animated.View
                style={[rankingScreenStyles.confetti, {
                  opacity: confettiAnimation,
                  transform: [{
                    rotate: confettiAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  }],
                }]}
              >
                <Text style={rankingScreenStyles.confettiText}>✨</Text>
              </Animated.View>
            )}
            <LinearGradient
              colors={isFirst ? ['#FFD700', '#FFA000'] : position === 2 ? ['#C0C0C0', '#9E9E9E'] : ['#CD7F32', '#8D4E00']}
              style={rankingScreenStyles.topThreeCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={rankingScreenStyles.rankBadge}>
                <Text style={rankingScreenStyles.rankNumber}>{position}º</Text>
                <Text style={rankingScreenStyles.rankIcon}>{getRankingIcon(position)}</Text>
              </View>
              <View style={rankingScreenStyles.userInfo}>
                <Text style={rankingScreenStyles.avatarText}>{user.avatar}</Text>
                <Text style={rankingScreenStyles.userName}>{user.name}</Text>
                <Text style={rankingScreenStyles.userLevel}>{user.level}</Text>
                <Text style={[rankingScreenStyles.userPoints, { color: '#00FF84' }]}>{user.points} pts</Text>
              </View>
              <View style={rankingScreenStyles.progressContainer}>
                <View style={rankingScreenStyles.progressBar}>
                  <View style={[rankingScreenStyles.progressFill, {
                    width: `${getProgressPercentage(user.points)}%`,
                    backgroundColor: getProgressBarColor(user.points),
                  }]} />
                </View>
              </View>
            </LinearGradient>
          </View>
        );
      })}
    </View>
  );

  const renderOtherUsers = () => (
    <View style={rankingScreenStyles.otherUsersContainer}>
      <Text style={rankingScreenStyles.otherUsersTitle}>Outros Recicladores</Text>
      {users.slice(3).map((user, index) => {
        const position = index + 4;
        return (
          <View key={`other-${user.id}-${index}`} style={rankingScreenStyles.userCard}>
            <View style={rankingScreenStyles.userCardLeft}>
              <View style={rankingScreenStyles.rankBadgeSmall}>
                <Text style={rankingScreenStyles.rankNumberSmall}>{position}º</Text>
              </View>
              <Text style={rankingScreenStyles.avatarTextSmall}>{user.avatar}</Text>
              <View style={rankingScreenStyles.userInfoSmall}>
                <Text style={rankingScreenStyles.userNameSmall}>{user.name}</Text>
                <Text style={rankingScreenStyles.userLevelSmall}>{user.level}</Text>
              </View>
            </View>
            <View style={rankingScreenStyles.userCardRight}>
              <Text style={[rankingScreenStyles.userPointsSmall, { color: '#00FF84' }]}>{user.points} pts</Text>
              <View style={rankingScreenStyles.progressBarSmall}>
                <View style={[rankingScreenStyles.progressFillSmall, {
                  width: `${getProgressPercentage(user.points)}%`,
                  backgroundColor: getProgressBarColor(user.points),
                }]} />
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );

  const renderTabBar = () => (
    <View style={rankingScreenStyles.tabBar}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[rankingScreenStyles.tab, activeTab === tab.id && rankingScreenStyles.activeTab]}
          onPress={() => {
            setActiveTab(tab.id);
            if (tab.id === 'Home') navigation.navigate('Dashboard');
            else if (tab.id === 'Recycle') navigation.navigate('Recycle');
            else if (tab.id === 'Collector') navigation.navigate('Collector');
          }}
        >
          <Ionicons name={tab.icon as any} size={24} color={activeTab === tab.id ? '#00FF84' : '#666'} />
          <Text style={[rankingScreenStyles.tabLabel, activeTab === tab.id && rankingScreenStyles.activeTabLabel]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={[rankingScreenStyles.container, {padding:0}]}>
      <View style={rankingScreenStyles.backgroundPattern} />
      {renderHeader()}
      <ScrollView style={rankingScreenStyles.content} showsVerticalScrollIndicator={false}>
        {renderTopThree()}
        {renderOtherUsers()}
      </ScrollView>
      {renderTabBar()}
    </View>
  );
}
