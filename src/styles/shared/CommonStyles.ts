import { StyleSheet } from 'react-native';

// Cores do tema
export const colors = {
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
};

// Tipografia
export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: '#00FF84',
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#00D1FF',
  },
  h3: {
    fontSize: 18,
    fontWeight: 'bold' as const,
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
};

export const commonStyles = StyleSheet.create({

  // Layout
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0A0A0A',
    opacity: 0.1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },

  // Botões
  primaryButton: {
    backgroundColor: '#00FF84',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00FF84',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  secondaryButton: {
    backgroundColor: '#00D1FF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00D1FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  // Inputs
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Fundo mais claro para melhor contraste
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00D1FF',
    marginBottom: 15,
    paddingHorizontal: 15,
    shadowColor: '#00D1FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#fff', // Texto branco para melhor contraste no tema dark
  },
  inputIcon: {
    marginRight: 12,
  },

  // Cards
  card: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#00D1FF',
    shadowColor: '#00D1FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  cardContent: {
    padding: 15,
  },

  // Headers
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00D1FF',
    flex: 1,
    textAlign: 'center',
  },

  // Seções
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00D1FF',
    marginBottom: 15,
    textShadowColor: '#00D1FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },

  // Avatar
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

  // Footer
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  footerLink: {
    color: '#00D1FF',
    fontWeight: '500',
  },

  // Estados vazios
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00FF84',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },

  // Erros
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 5,
    marginBottom: 10,
    marginLeft: 15,
  },

  // Sombras
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  shadowPrimary: {
    shadowColor: '#00FF84',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  shadowSecondary: {
    shadowColor: '#00D1FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});
