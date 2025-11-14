import { useEffect, useRef } from 'react';
import { StatusBar, Platform, AppState } from 'react-native';

import {
  LoginScreen,
  RegisterScreen,
  UserTypeScreen,
  CompanyAuthScreen,
} from './src/screens/auth';

import { DashboardScreen } from './src/screens/dashboard';
import { RankingScreen } from './src/screens/ranking';
import { RecycleScreen, CollectionStatusScreen } from './src/screens/collections';
import { CollectorScreen } from './src/screens/collectors';
import { ProfileScreen } from './src/screens/profile';
import { CompanyRegisterScreen } from './src/screens/company';
import { BenefitsRegisterScreen } from './src/screens/benefits';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { ThemeProvider } from './src/contexts/ThemeContext';

// Fullscreen / NavigationBar
import * as NavigationBar from 'expo-navigation-bar';

const Stack = createStackNavigator();

// Função para esconder a StatusBar
const hideStatusBar = () => {
  StatusBar.setHidden(true, 'none');
  if (Platform.OS === 'android') {
    StatusBar.setHidden(true, 'none');
  } else if (Platform.OS === 'ios') {
    StatusBar.setHidden(true, 'none');
  }
};

export default function App() {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // Esconde completamente a StatusBar de forma permanente
    hideStatusBar();
    
    // Android: remover NavigationBar sem deixar a tela preta
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync('hidden'); // some totalmente
      NavigationBar.setBehaviorAsync('inset-swipe'); // gestos funcionam
      NavigationBar.setBackgroundColorAsync('transparent');
      NavigationBar.setButtonStyleAsync('light');
    }

    // Listener para quando o app volta ao foreground
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        hideStatusBar();
      }
      appState.current = nextAppState;
    });

    // Força a StatusBar a permanecer escondida periodicamente
    const interval = setInterval(() => {
      hideStatusBar();
    }, 100);

    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, []);

  return (
    <ThemeProvider>
      <NavigationContainer
        onReady={() => hideStatusBar()}
        onStateChange={() => hideStatusBar()}
      >

        <StatusBar hidden={true} translucent={true} />

        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="UserType" component={UserTypeScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="CompanyAuth" component={CompanyAuthScreen} />

          <Stack.Screen name="Collector" component={CollectorScreen} />
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="Ranking" component={RankingScreen} />

          <Stack.Screen name="Recycle" component={RecycleScreen} />
          <Stack.Screen name="CollectionStatus" component={CollectionStatusScreen} />

          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="CompanyRegister" component={CompanyRegisterScreen} />
          <Stack.Screen name="BenefitsRegister" component={BenefitsRegisterScreen} />
        </Stack.Navigator>

      </NavigationContainer>
    </ThemeProvider>
  );
}
