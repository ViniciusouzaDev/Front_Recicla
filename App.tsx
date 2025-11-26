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
import { RecycleScreen, FinalizarColetaScreen } from './src/screens/collections';
import { CollectorScreen } from './src/screens/collectors';
import { ProfileScreen } from './src/screens/profile';
import { CompanyRegisterScreen } from './src/screens/company';
import { BenefitsRegisterScreen } from './src/screens/benefits';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { ThemeProvider } from './src/contexts/ThemeContext';

// Fullscreen / NavigationBar
import * as NavigationBar from 'expo-navigation-bar';
import AdminLoginScreen from './src/screens/admin/AdminLoginScreen';
import AdminTokensScreen from './src/screens/admin/AdminTokensScreen';

const Stack = createStackNavigator();

// Função para esconder completamente a StatusBar (barra superior)
const hideStatusBar = () => {
  StatusBar.setHidden(true, 'none');
  if (Platform.OS === 'android') {
    StatusBar.setHidden(true, 'none');
  } else if (Platform.OS === 'ios') {
    StatusBar.setHidden(true, 'none');
  }
};

// Função para esconder a NavigationBar (barra inferior no Android)
// Nota: Com edge-to-edge habilitado, alguns métodos não são suportados
const hideNavigationBar = async () => {
  if (Platform.OS === 'android') {
    try {
      // Apenas esconde a barra de navegação (método compatível com edge-to-edge)
      await NavigationBar.setVisibilityAsync('hidden');
    } catch (error) {
      // Ignora erros silenciosamente para evitar warnings
    }
  }
};

export default function App() {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // Esconde completamente a StatusBar (barra superior)
    hideStatusBar();
    
    // Esconde completamente a NavigationBar (barra inferior no Android)
    hideNavigationBar();

    // Listener para quando o app volta ao foreground
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        hideStatusBar();
        hideNavigationBar();
      }
      appState.current = nextAppState;
    });

    // Força a StatusBar a permanecer escondida periodicamente
    // Não precisa verificar NavigationBar com tanta frequência
    const statusBarInterval = setInterval(() => {
      hideStatusBar();
    }, 300);
    
    // Verifica NavigationBar com menos frequência
    const navBarInterval = setInterval(() => {
      if (Platform.OS === 'android') {
        hideNavigationBar();
      }
    }, 1000);

    return () => {
      subscription.remove();
      clearInterval(statusBarInterval);
      clearInterval(navBarInterval);
    };
  }, []);

  return (
    <ThemeProvider>
      <NavigationContainer
        onReady={() => {
          hideStatusBar();
          hideNavigationBar();
        }}
        onStateChange={() => {
          hideStatusBar();
          hideNavigationBar();
        }}
      >

        <StatusBar 
          hidden={true} 
          translucent={true} 
          barStyle="light-content"
          backgroundColor="transparent"
        />

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
          <Stack.Screen name="FinalizarColeta" component={FinalizarColetaScreen} />

          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="CompanyRegister" component={CompanyRegisterScreen} />
          <Stack.Screen name="BenefitsRegister" component={BenefitsRegisterScreen} />
          <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
          <Stack.Screen name="AdminTokens" component={AdminTokensScreen} />
        </Stack.Navigator>

      </NavigationContainer>
    </ThemeProvider>
  );
}
