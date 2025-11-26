// src/services/adminService.ts
import api from './Api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ColetaDetalhes {
  id: string | number;
  coleta_id: string | number;
  token: string;
  usuario: {
    id: number;
    nome: string;
    email?: string;
  };
  coletor?: {
    id: number;
    nome: string;
    email?: string;
  };
  status: string;
  material?: string;
  endereco?: string;
  criado_em?: string;
}

export interface AdicionarPontosRequest {
  coletaId: string | number;
  pontosUsuario: number; // Pontos para o usuário que registrou
  pontosColetor: number; // Pontos para o coletor que levou
}

class AdminService {
  private async getAdminHeaders() {
    const passphrase = await AsyncStorage.getItem('admin_passphrase');
    const headers: any = { 'Content-Type': 'application/json' };
    if (passphrase) {
      headers['x-admin-passphrase'] = passphrase;
    }
    return headers;
  }

  /**
   * Busca detalhes de uma coleta incluindo informações do usuário e coletor
   */
  async buscarDetalhesColeta(coletaId: string | number): Promise<ColetaDetalhes | null> {
    try {
      const headers = await this.getAdminHeaders();
      console.log('🔍 Buscando detalhes da coleta:', { coletaId, headers });
      
      const response = await api.get(`/coleta/${coletaId}`, { headers });
      console.log('✅ Resposta recebida:', { status: response.status, data: response.data });
      
      // A API pode retornar diretamente ou dentro de data
      const data = response.data?.data || response.data?.coleta || response.data;

      if (!data) {
        console.warn('⚠️ Nenhum dado retornado da API');
        return null;
      }

      const detalhes: ColetaDetalhes = {
        id: data.id ?? data.coleta_id ?? coletaId,
        coleta_id: data.coleta_id ?? data.id ?? coletaId,
        token: data.token ?? data.codigo_validacao ?? '',
        usuario: {
          id: data.usuario_id ?? data.usuario?.id ?? data.usuario?.usuario_id ?? 0,
          nome: data.usuario?.nome ?? data.nome_usuario ?? 'Usuário desconhecido',
          email: data.usuario?.email ?? data.email_usuario,
        },
        coletor: data.coletor_id ? {
          id: data.coletor_id ?? data.coletor?.id ?? data.coletor?.usuario_id ?? 0,
          nome: data.coletor?.nome ?? data.nome_coletor ?? 'Coletor desconhecido',
          email: data.coletor?.email ?? data.email_coletor,
        } : undefined,
        status: data.status ?? '',
        material: data.tipo_residuo ?? data.material ?? '',
        endereco: data.local_coleta ?? data.endereco ?? '',
        criado_em: data.data_coleta ?? data.created_at ?? data.criado_em,
      };

      console.log('📦 Detalhes processados:', detalhes);
      return detalhes;
    } catch (error: any) {
      console.error('❌ Erro ao buscar detalhes da coleta:');
      console.error('  - Status:', error?.response?.status);
      console.error('  - Data:', error?.response?.data);
      console.error('  - Message:', error?.message);
      throw new Error(error?.response?.data?.message || error?.message || 'Erro ao buscar detalhes da coleta');
    }
  }

  /**
   * Adiciona pontos para o usuário que registrou a coleta e para o coletor
   */
  async adicionarPontos(request: AdicionarPontosRequest): Promise<boolean> {
    try {
      const headers = await this.getAdminHeaders();
      const payload = {
        coletaId: String(request.coletaId),
        pontosUsuario: Number(request.pontosUsuario),
        pontosColetor: Number(request.pontosColetor),
        // Aliases para compatibilidade
        coleta_id: String(request.coletaId),
        pontos_usuario: Number(request.pontosUsuario),
        pontos_coletor: Number(request.pontosColetor),
      };

      console.log('💾 Adicionando pontos:', { payload, headers });

      // Tenta diferentes rotas possíveis (na ordem que o backend implementou)
      const routes = [
        '/coleta/pontos/adicionar',
        '/admin/pontos/adicionar',
        '/api/admin/pontos/adicionar',
        '/api/pontuacao/admin/adicionar',
        '/pontuacao/admin/adicionar',
        '/admin/adicionar-pontos',
      ];

      for (const route of routes) {
        try {
          console.log(`🔄 Tentando rota: ${route}`);
          const response = await api.post(route, payload, { headers });
          console.log(`✅ Resposta da rota ${route}:`, { status: response.status, data: response.data });
          if (response.status === 200 || response.status === 201) {
            console.log('✅ Pontos adicionados com sucesso via', route);
            return true;
          }
        } catch (e: any) {
          console.warn(`❌ Erro na rota ${route}:`, {
            status: e?.response?.status,
            data: e?.response?.data,
            message: e?.message,
          });
          // Continua tentando outras rotas se for 404
          if (e?.response?.status === 404) continue;
          // Se for outro erro e não for 404, pode ser erro de validação - retorna o erro
          if (e?.response?.status !== 404) {
            throw new Error(e?.response?.data?.message || e?.message || `Erro ao adicionar pontos via ${route}`);
          }
        }
      }

      throw new Error('Nenhuma rota de adicionar pontos encontrada no backend');
    } catch (error: any) {
      console.error('❌ Erro ao adicionar pontos:', error);
      throw new Error(error?.response?.data?.message || error?.message || 'Erro ao adicionar pontos');
    }
  }

  /**
   * Lista todas as coletas com tokens (para admin)
   */
  async listarColetasComTokens(): Promise<ColetaDetalhes[]> {
    try {
      const headers = await this.getAdminHeaders();
      const response = await api.get('/admin/coletas/tokens', { headers });
      const data = response.data || response.data?.data || response.data?.coletas || [];

      if (!Array.isArray(data)) return [];

      return data.map((item: any) => ({
        id: item.id ?? item.coleta_id ?? 0,
        coleta_id: item.coleta_id ?? item.id ?? 0,
        token: item.token ?? item.codigo_validacao ?? '',
        usuario: {
          id: item.usuario_id ?? item.usuario?.id ?? item.usuario?.usuario_id ?? 0,
          nome: item.usuario?.nome ?? item.nome_usuario ?? 'Usuário desconhecido',
          email: item.usuario?.email ?? item.email_usuario,
        },
        coletor: item.coletor_id ? {
          id: item.coletor_id ?? item.coletor?.id ?? item.coletor?.usuario_id ?? 0,
          nome: item.coletor?.nome ?? item.nome_coletor ?? 'Coletor desconhecido',
          email: item.coletor?.email ?? item.email_coletor,
        } : undefined,
        status: item.status ?? '',
        material: item.tipo_residuo ?? item.material ?? '',
        endereco: item.local_coleta ?? item.endereco ?? '',
        criado_em: item.data_coleta ?? item.created_at ?? item.criado_em,
      }));
    } catch (error: any) {
      console.error('Erro ao listar coletas com tokens:', error);
      // Se a rota não existir, retorna array vazio
      return [];
    }
  }
}

export const adminService = new AdminService();

