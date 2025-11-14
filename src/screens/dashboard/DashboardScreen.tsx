import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import logo from "../../../assets/Logo_recicla.png";
import { dashboardScreenStyles } from "../../../src/styles/dashboard/DashboardScreenStyles";
import ProfileHeader from "../../components/ProfileHeader";
import ShareButton from "../../components/ShareButton";
import { useTheme } from "../../contexts/ThemeContext";
import { userService } from "../../services/userService";

export default function DashboardScreen({ navigation }: any) {
  const { theme } = useTheme();

  const [activeTab, setActiveTab] = useState("Home");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userScore, setUserScore] = useState(0);
  const [monthlyProgress, setMonthlyProgress] = useState(0);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [scoreAnim] = useState(new Animated.Value(0));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    Animated.timing(scoreAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [userScore]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [profile, scoreHistory, progress, userAchievements, history] =
        await Promise.all([
          userService.getProfile(),
          userService.getScoreHistory(),
          userService.getProgress(),
          userService.getAchievements(),
          userService.getChartData(),
        ]);

      setUserProfile(profile);
      setUserScore(
        scoreHistory.reduce((acc: number, item: any) => acc + item.pontos, 0)
      );
      setMonthlyProgress(progress.percentual || 0);
      setAchievements(userAchievements);
      setChartData(history);
    } catch (error: any) {
      console.error("❌ Erro ao buscar dados do usuário:", error);
      if (error.message === "Usuário não autenticado") {
        navigation.replace("Login");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <View style={dashboardScreenStyles.header}>
      <View style={dashboardScreenStyles.logoContainer}>
        <Image source={logo} style={dashboardScreenStyles.logo} />
        <Text style={dashboardScreenStyles.appName}>Recicla+</Text>
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

  const shareMessage = `Estou contribuindo para um mundo mais sustentável com o Recicla+! Já reciclei vários materiais e ganhei ${userScore} pontos. Junte-se a mim nessa missão! #ReciclaMais #Sustentabilidade`;

  const renderScoreCard = () => (
    <Animated.View
      style={[
        dashboardScreenStyles.scoreCard,
        {
          opacity: scoreAnim,
          transform: [
            {
              scale: scoreAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
        },
      ]}
    >
      <LinearGradient
        colors={["#00FF84", "#00E676", "#00C853"]}
        style={dashboardScreenStyles.scoreGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={dashboardScreenStyles.scoreContent}>
          <View style={dashboardScreenStyles.scoreLeft}>
            <Text style={dashboardScreenStyles.scoreLabel}>Sua Pontuação</Text>
            <Animated.Text
              style={[
                dashboardScreenStyles.scoreValue,
                {
                  opacity: scoreAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ]}
            >
              {userScore} pts
            </Animated.Text>
            <Text style={dashboardScreenStyles.scoreSubtext}>
              +{monthlyProgress}% este mês
            </Text>
          </View>
          <View style={dashboardScreenStyles.scoreRight}>
            <Ionicons name="trophy" size={40} color="#FFD600" />
          </View>
        </View>
        <View style={dashboardScreenStyles.shareButtonContainer}>
          <ShareButton
            message={shareMessage}
            title="Compartilhar Progresso"
            showFacebook
            showInstagram
          />
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderChart = () => (
    <View style={dashboardScreenStyles.chartContainer}>
      <Text style={dashboardScreenStyles.chartTitle}>
        Evolução da Pontuação
      </Text>
      <View style={dashboardScreenStyles.chart}>
        {chartData.map((item, index) => (
          <View key={index} style={dashboardScreenStyles.chartBar}>
            <View
              style={[
                dashboardScreenStyles.bar,
                {
                  height: Math.min((item.pontos / 500) * 100, 100),
                  backgroundColor:
                    index === chartData.length - 1 ? "#00FF84" : "#00D1FF",
                  shadowColor:
                    index === chartData.length - 1 ? "#00FF84" : "#00D1FF",
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.5,
                  shadowRadius: 8,
                  elevation: 5,
                },
              ]}
            />
            <Text style={dashboardScreenStyles.barLabel}>{item.semana}</Text>
            <Text style={dashboardScreenStyles.barValue}>{item.pontos}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderAchievements = () => (
    <View style={dashboardScreenStyles.achievementsContainer}>
      <Text style={dashboardScreenStyles.achievementsTitle}>Conquistas</Text>
      <View style={dashboardScreenStyles.achievementsGrid}>
        {achievements.length > 0 ? (
          achievements.map((achievement) => (
            <View
              key={achievement.id}
              style={[
                dashboardScreenStyles.achievementBadge,
                {
                  borderColor: achievement.color || "#00FF84",
                  shadowColor: achievement.color || "#00FF84",
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 5,
                },
              ]}
            >
              <Text style={dashboardScreenStyles.achievementIcon}>
                {achievement.icon}
              </Text>
              <Text style={dashboardScreenStyles.achievementName}>
                {achievement.name}
              </Text>
            </View>
          ))
        ) : (
          <Text style={{ textAlign: "center", color: "#888" }}>
            Nenhuma conquista ainda.
          </Text>
        )}
      </View>
    </View>
  );

  const renderMotivationalText = () => (
    <View style={dashboardScreenStyles.motivationalContainer}>
      <Text style={dashboardScreenStyles.motivationalText}>
        Parabéns! Você reciclou {monthlyProgress}% a mais este mês 🎉
      </Text>
      <Text style={dashboardScreenStyles.motivationalSubtext}>
        Continue assim e desbloqueie novas conquistas!
      </Text>
    </View>
  );

  const tabs = [
    { id: "Home", icon: "home", label: "Home" },
    { id: "Trophies", icon: "trophy", label: "Troféus" },
    { id: "Recycle", icon: "leaf", label: "Reciclar" },
    { id: "Collections", icon: "list", label: "Coletas" },
    { id: "Collector", icon: "car", label: "Coletador" },
  ];

  const renderTabBar = () => (
    <View style={dashboardScreenStyles.tabBar}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[
            dashboardScreenStyles.tab,
            activeTab === tab.id && dashboardScreenStyles.activeTab,
          ]}
          onPress={() => {
            setActiveTab(tab.id);
            if (tab.id === "Trophies") navigation.navigate("Ranking");
            if (tab.id === "Recycle") navigation.navigate("Recycle");
            if (tab.id === "Collections")
              navigation.navigate("CollectionStatus");
            if (tab.id === "Collector") navigation.navigate("Collector");
          }}
        >
          <Ionicons
            name={tab.icon as any}
            size={24}
            color={activeTab === tab.id ? "#00FF84" : "#666"}
          />
          <Text
            style={[
              dashboardScreenStyles.tabLabel,
              activeTab === tab.id && dashboardScreenStyles.activeTabLabel,
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={dashboardScreenStyles.container}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#00FF84" />
          <Text style={{ marginTop: 10 }}>Carregando dados...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={dashboardScreenStyles.container}>
      <View style={dashboardScreenStyles.backgroundPattern} />
      {renderHeader()}
      <ScrollView
        style={dashboardScreenStyles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {renderScoreCard()}
        {renderChart()}
        {renderAchievements()}
        {renderMotivationalText()}
      </ScrollView>
      {renderTabBar()}
    </SafeAreaView>
  );
}
