// src/screens/admin/AdminTokensScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { tokenApi, TokenListaItem } from '../../services/tokenApi';
import { adminService, ColetaDetalhes } from '../../services/adminService';

interface AdminTokensScreenProps {
  navigation: any;
}

export default function AdminTokensScreen({ navigation }: AdminTokensScreenProps) {
  const [tokens, setTokens] = useState<TokenListaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedToken, setSelectedToken] = useState<TokenListaItem | null>(null);
  const [coletaDetalhes, setColetaDetalhes] = useState<ColetaDetalhes | null>(null);
  const [loadingDetalhes, setLoadingDetalhes] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [pontosUsuario, setPontosUsuario] = useState('');
  const [pontosColetor, setPontosColetor] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    try {
      setLoading(true);
      const list = await tokenApi.listarTokens();
      setTokens(list);
    } catch (e) {
      console.error('Erro ao buscar tokens:', e);
      setTokens([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTokens();
    setRefreshing(false);
  };

  const handleTokenPress = async (token: TokenListaItem) => {
    console.log('🔘 Token pressionado:', token);
    console.log('🔘 Modal visible antes:', modalVisible);
    
    // Abre o modal imediatamente
    setSelectedToken(token);
    setModalVisible(true);
    setLoadingDetalhes(true);
    setPontosUsuario('');
    setPontosColetor('');
    setColetaDetalhes(null);
    
    console.log('🔘 Modal deve estar visível agora');

    try {
      console.log('📡 Buscando detalhes da coleta:', token.coleta_id);
      const detalhes = await adminService.buscarDetalhesColeta(token.coleta_id);
      console.log('✅ Detalhes recebidos:', detalhes);
      setColetaDetalhes(detalhes);
    } catch (error: any) {
      console.error('❌ Erro ao buscar detalhes:', error);
      Alert.alert(
        'Erro',
        error.message || 'Não foi possível buscar detalhes da coleta. Verifique se a coleta existe e se você tem permissão de admin.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Mantém o modal aberto mas sem detalhes
            },
          },
        ]
      );
      setColetaDetalhes(null);
    } finally {
      setLoadingDetalhes(false);
    }
  };

  const handleAdicionarPontos = async () => {
    if (!selectedToken || !coletaDetalhes) {
      Alert.alert('Erro', 'Selecione uma coleta primeiro.');
      return;
    }

    const pontosUser = Number(pontosUsuario);
    const pontosCol = Number(pontosColetor);

    if (isNaN(pontosUser) || pontosUser < 0) {
      Alert.alert('Erro', 'Pontos do usuário devem ser um número válido maior ou igual a zero.');
      return;
    }

    if (isNaN(pontosCol) || pontosCol < 0) {
      Alert.alert('Erro', 'Pontos do coletor devem ser um número válido maior ou igual a zero.');
      return;
    }

    if (pontosUser === 0 && pontosCol === 0) {
      Alert.alert('Aviso', 'Digite pelo menos um valor de pontos para adicionar.');
      return;
    }

    setSalvando(true);
    try {
      const sucesso = await adminService.adicionarPontos({
        coletaId: selectedToken.coleta_id,
        pontosUsuario: pontosUser,
        pontosColetor: pontosCol,
      });

      if (sucesso) {
        Alert.alert(
          'Sucesso!',
          `Pontos adicionados com sucesso!\n\nUsuário: ${pontosUser} pontos\nColetor: ${pontosCol} pontos`,
          [
            {
              text: 'OK',
              onPress: () => {
                setModalVisible(false);
                setSelectedToken(null);
                setColetaDetalhes(null);
                setPontosUsuario('');
                setPontosColetor('');
                fetchTokens(); // Atualiza a lista
              },
            },
          ]
        );
      } else {
        throw new Error('Não foi possível adicionar os pontos.');
      }
    } catch (error: any) {
      console.error('Erro ao adicionar pontos:', error);
      Alert.alert('Erro', error.message || 'Não foi possível adicionar os pontos. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  const renderTokenItem = ({ item }: { item: TokenListaItem }) => {
    console.log('Rendering token item:', item);
    return (
      <TouchableOpacity
        style={styles.itemCard}
        onPress={() => {
          console.log('Token item pressed:', item);
          handleTokenPress(item);
        }}
        activeOpacity={0.7}
      >
      <View style={styles.itemHeader}>
        <View style={styles.tokenBadge}>
          <Ionicons name="key" size={16} color="#00FF84" />
          <Text style={styles.tokenText}>{item.token}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#666" />
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.infoText}>
          <Text style={styles.infoLabel}>Coleta ID: </Text>
          {String(item.coleta_id)}
        </Text>
        {item.usuario_nome && (
          <Text style={styles.infoText}>
            <Text style={styles.infoLabel}>Usuário: </Text>
            {item.usuario_nome}
          </Text>
        )}
        {item.coletor_nome && (
          <Text style={styles.infoText}>
            <Text style={styles.infoLabel}>Coletor: </Text>
            {item.coletor_nome}
          </Text>
        )}
        {item.criado_em && (
          <Text style={styles.infoText}>
            <Text style={styles.infoLabel}>Criado em: </Text>
            {new Date(item.criado_em).toLocaleDateString('pt-BR')}
          </Text>
        )}
      </View>
    </TouchableOpacity>
    );
  };

  const renderModal = () => {
    console.log('🎭 Renderizando modal, visible:', modalVisible);
    return (
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          console.log('Modal onRequestClose chamado');
          setModalVisible(false);
        }}
      >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Adicionar Pontos</Text>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                setSelectedToken(null);
                setColetaDetalhes(null);
              }}
            >
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {loadingDetalhes ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00FF84" />
                <Text style={styles.loadingText}>Carregando detalhes...</Text>
              </View>
            ) : coletaDetalhes ? (
              <>
                {/* Informações da Coleta */}
                <View style={styles.detalhesSection}>
                  <Text style={styles.sectionTitle}>Informações da Coleta</Text>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Token: </Text>
                    <Text style={styles.infoValue}>{coletaDetalhes.token}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Coleta ID: </Text>
                    <Text style={styles.infoValue}>{String(coletaDetalhes.coleta_id)}</Text>
                  </View>
                  {coletaDetalhes.material && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Material: </Text>
                      <Text style={styles.infoValue}>{coletaDetalhes.material}</Text>
                    </View>
                  )}
                  {coletaDetalhes.status && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Status: </Text>
                      <Text style={styles.infoValue}>{coletaDetalhes.status}</Text>
                    </View>
                  )}
                </View>

                {/* Informações do Usuário */}
                <View style={styles.detalhesSection}>
                  <Text style={styles.sectionTitle}>Usuário que Registrou</Text>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Nome: </Text>
                    <Text style={styles.infoValue}>{coletaDetalhes.usuario.nome}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>ID: </Text>
                    <Text style={styles.infoValue}>{coletaDetalhes.usuario.id}</Text>
                  </View>
                  {coletaDetalhes.usuario.email && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Email: </Text>
                      <Text style={styles.infoValue}>{coletaDetalhes.usuario.email}</Text>
                    </View>
                  )}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Pontos para o Usuário</Text>
                    <TextInput
                      style={styles.input}
                      value={pontosUsuario}
                      onChangeText={setPontosUsuario}
                      placeholder="Digite os pontos"
                      placeholderTextColor="#666"
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                {/* Informações do Coletor */}
                {coletaDetalhes.coletor ? (
                  <View style={styles.detalhesSection}>
                    <Text style={styles.sectionTitle}>Coletor Responsável</Text>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Nome: </Text>
                      <Text style={styles.infoValue}>{coletaDetalhes.coletor.nome}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>ID: </Text>
                      <Text style={styles.infoValue}>{coletaDetalhes.coletor.id}</Text>
                    </View>
                    {coletaDetalhes.coletor.email && (
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Email: </Text>
                        <Text style={styles.infoValue}>{coletaDetalhes.coletor.email}</Text>
                      </View>
                    )}
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Pontos para o Coletor</Text>
                      <TextInput
                        style={styles.input}
                        value={pontosColetor}
                        onChangeText={setPontosColetor}
                        placeholder="Digite os pontos"
                        placeholderTextColor="#666"
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                ) : (
                  <View style={styles.detalhesSection}>
                    <Text style={styles.sectionTitle}>Coletor Responsável</Text>
                    <Text style={styles.warningText}>
                      Nenhum coletor associado a esta coleta ainda.
                    </Text>
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Pontos para o Coletor</Text>
                      <TextInput
                        style={[styles.input, styles.inputDisabled]}
                        value={pontosColetor}
                        onChangeText={setPontosColetor}
                        placeholder="Aguardando coletor..."
                        placeholderTextColor="#666"
                        keyboardType="numeric"
                        editable={false}
                      />
                    </View>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={48} color="#FF6B00" />
                <Text style={styles.errorText}>
                  Não foi possível carregar os detalhes da coleta.
                </Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.button, styles.buttonCancel]}
              onPress={() => {
                setModalVisible(false);
                setSelectedToken(null);
                setColetaDetalhes(null);
              }}
            >
              <Text style={styles.buttonCancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonSave, salvando && styles.buttonDisabled]}
              onPress={handleAdicionarPontos}
              disabled={salvando || loadingDetalhes}
            >
              {salvando ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.buttonSaveText}>Adicionar Pontos</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Gerenciar Pontos</Text>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#00FF84" />
          <Text style={styles.loadingText}>Carregando tokens...</Text>
        </View>
      ) : (
        <FlatList
          data={tokens}
          keyExtractor={(item) => String(item.id)}
          onRefresh={onRefresh}
          refreshing={refreshing}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#00FF84"
              colors={['#00FF84']}
            />
          }
          renderItem={renderTokenItem}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Ionicons name="key-outline" size={64} color="#666" />
              <Text style={styles.emptyText}>Nenhum token encontrado.</Text>
              <Text style={styles.emptySubtext}>
                Os tokens aparecerão aqui quando houver coletas pendentes.
              </Text>
            </View>
          )}
          contentContainerStyle={tokens.length === 0 ? styles.emptyList : undefined}
        />
      )}

      {renderModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  backButton: {
    padding: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#999',
    marginTop: 12,
    fontSize: 14,
  },
  itemCard: {
    backgroundColor: '#1A1A1A',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tokenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A2A1A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tokenText: {
    color: '#00FF84',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  itemInfo: {
    gap: 6,
  },
  infoText: {
    color: '#CCC',
    fontSize: 14,
  },
  infoLabel: {
    color: '#999',
    fontWeight: '500',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 64,
  },
  emptyText: {
    color: '#999',
    fontSize: 18,
    fontWeight: '500',
    marginTop: 16,
  },
  emptySubtext: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  emptyList: {
    flexGrow: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 16,
    zIndex: 1001,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  modalBody: {
    padding: 20,
    maxHeight: '70%',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  detalhesSection: {
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  sectionTitle: {
    color: '#00FF84',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  infoValue: {
    color: '#FFF',
    fontSize: 14,
  },
  inputContainer: {
    marginTop: 16,
  },
  inputLabel: {
    color: '#CCC',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 12,
    color: '#FFF',
    fontSize: 16,
  },
  inputDisabled: {
    opacity: 0.5,
  },
  warningText: {
    color: '#FF6B00',
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  errorText: {
    color: '#FF6B00',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonCancel: {
    backgroundColor: '#2A2A2A',
  },
  buttonCancelText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSave: {
    backgroundColor: '#00FF84',
  },
  buttonSaveText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
