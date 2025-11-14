import React, { createContext, useContext, useState, ReactNode } from 'react';

// TODO: Implementar modo Light no futuro
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    warning: string;
    error: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    inputBackground: string;
    inputText: string;
    cardBackground: string;
  };
  typography: {
    h1: {
      fontSize: number;
      fontWeight: 'bold';
      color: string;
    };
    h2: {
      fontSize: number;
      fontWeight: 'bold';
      color: string;
    };
    h3: {
      fontSize: number;
      fontWeight: 'bold';
      color: string;
    };
    body: {
      fontSize: number;
      color: string;
    };
    caption: {
      fontSize: number;
      color: string;
    };
    error: {
      fontSize: number;
      color: string;
    };
  };
  isDark: boolean;
}

// Tema Dark (atual)
const darkTheme: Theme = {
  colors: {
    primary: '#00FF84',
    secondary: '#00D1FF',
    accent: '#FFD600',
    warning: '#FF6B00',
    error: '#FF6B6B',
    background: '#0A0A0A',
    surface: 'rgba(0, 0, 0, 0.3)',
    text: '#fff',
    textSecondary: '#666',
    border: '#00D1FF',
    inputBackground: 'rgba(0, 0, 0, 0.3)',
    inputText: '#fff',
    cardBackground: 'rgba(0, 0, 0, 0.3)',
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#00FF84',
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#00D1FF',
    },
    h3: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#00D1FF',
    },
    body: {
      fontSize: 16,
      color: '#fff',
    },
    caption: {
      fontSize: 12,
      color: '#666',
    },
    error: {
      fontSize: 12,
      color: '#FF6B6B',
    },
  },
  isDark: true,
};

// TODO: Implementar tema Light no futuro
const lightTheme: Theme = {
  colors: {
    primary: '#00C853',
    secondary: '#1976D2',
    accent: '#FF9800',
    warning: '#F57C00',
    error: '#D32F2F',
    background: '#FFFFFF',
    surface: 'rgba(255, 255, 255, 0.8)',
    text: '#000000',
    textSecondary: '#666666',
    border: '#1976D2',
    inputBackground: 'rgba(255, 255, 255, 0.8)',
    inputText: '#000000',
    cardBackground: 'rgba(255, 255, 255, 0.9)',
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#00C853',
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#1976D2',
    },
    h3: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#1976D2',
    },
    body: {
      fontSize: 16,
      color: '#000000',
    },
    caption: {
      fontSize: 12,
      color: '#666666',
    },
    error: {
      fontSize: 12,
      color: '#D32F2F',
    },
  },
  isDark: false,
};

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // TODO: Implementar persistência do tema escolhido pelo usuário
  const [isDarkMode, setIsDarkMode] = useState(true); // Por padrão dark
  
  const theme = isDarkMode ? darkTheme : lightTheme;

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    console.log('Tema alterado para:', isDarkMode ? 'Claro' : 'Escuro');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Hook para acessar apenas as cores do tema
export function useThemeColors() {
  const { theme } = useTheme();
  return theme.colors;
}

// Hook para acessar apenas a tipografia do tema
export function useThemeTypography() {
  const { theme } = useTheme();
  return theme.typography;
}

