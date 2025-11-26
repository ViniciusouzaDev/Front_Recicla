// src/services/tokenApi.ts
import api from './Api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface GerarTokenResponse {
  coletaId: string | number;
  token: string;
}

export interface ValidarTokenResponse {
  success: boolean;
  message?: string;
}

export interface TokenListaItem {
  id: string | number;
  coleta_id: string | number;
  token: string;
  criado_em?: string;
  usuario_id?: number;
  coletor_id?: number;
  usuario_nome?: string;
  coletor_nome?: string;
}

class TokenApi {
  private extractList(payload: any): any[] {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.tokens)) return payload.tokens;
    if (Array.isArray(payload?.rows)) return payload.rows;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.result)) return payload.result;
    return [];
  }
  /**
   * Gera um token para uma coleta
   * @param coletaId ID da coleta
   * @returns Token gerado e ID da coleta
   */
  async gerarToken(coletaId: string | number): Promise<GerarTokenResponse> {
    try {
      const r = await api.post('/tokens/gerar', { coletaId: String(coletaId) });
      const d = r.data || {};
      const cid = d.coletaId ?? d.coleta_id ?? coletaId;
      const tok = d.token;
      if (!tok) throw new Error('Token ausente');
      return { coletaId: cid, token: String(tok) };
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Erro ao gerar token';
      throw new Error(msg);
    }
  }

  /**
   * Valida um token para finalizar uma coleta
   * @param coletaId ID da coleta
   * @param token Token a ser validado
   * @returns Resultado da validação
   */
  async validarToken(coletaId: string | number, token: string): Promise<ValidarTokenResponse> {
    try {
      console.log('Validando token:', { coletaId, token });
      const r = await api.post('/tokens/validar', { coletaId: String(coletaId), token: String(token) });
      const d = r.data || {};
      
      // IMPORTANTE: Apenas aceita se success for explicitamente true
      // Não assume sucesso apenas pelo status HTTP
      const ok = d.success === true;
      const msg = d.message || d.error || undefined;
      
      console.log('Resposta da validação:', { success: ok, message: msg, data: d });
      
      return { success: ok, message: msg };
    } catch (error: any) {
      console.error('Erro ao validar token:', error);
      const msg = error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Erro ao validar token';
      throw new Error(msg);
    }
  }

  /**
   * Lista tokens pendentes para validação (admin)
   */
  async listarTokensPendentes(): Promise<TokenListaItem[]> {
    const adapt = (payload: any): TokenListaItem[] => {
      if (!payload) return [];
      const arr = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.tokens)
        ? payload.tokens
        : [];
      return arr
        .map((item: any) => ({
          id: item.id ?? item.coletaId ?? item.coleta_id ?? item.tokenId ?? item.token_id,
          token: String(item.token ?? item.codigo ?? item.codigo_validacao ?? ''),
          coletaId: item.coletaId ?? item.coleta_id ?? undefined,
        }))
        .filter((t: TokenListaItem) => t.id !== undefined && t.token);
    };

    try {
      const r1 = await api.get('/tokens');
      const list1 = adapt(r1.data);
      if (list1.length) return list1;
    } catch {}
    try {
      const r2 = await api.get('/tokens/pendentes');
      const list2 = adapt(r2.data);
      if (list2.length) return list2;
    } catch {}
    try {
      const r3 = await api.get('/token');
      const list3 = adapt(r3.data);
      if (list3.length) return list3;
    } catch {}
    return [];
  }

  async listarTokens(): Promise<TokenListaItem[]> {
    const passphrase = await AsyncStorage.getItem('admin_passphrase');
    const headers: any = passphrase ? { 'x-admin-passphrase': passphrase } : {};
    const routes = ['/tokens/pendentes', '/tokens', '/coleta/tokens', '/coleta/tokens/pendentes', '/token'];
    for (const path of routes) {
      try {
        const r = await api.get(path, { headers });
        const arr = this.extractList(r.data);
        const list: TokenListaItem[] = arr
          .map((item: any) => ({
            id: item.id,
            coleta_id: item.coleta_id ?? item.coletaId ?? item.id,
            token: String(item.token ?? item.codigo ?? item.codigo_validacao ?? ''),
            criado_em: item.criado_em ?? item.created_at ?? item.criadoEm ?? undefined,
          }))
          .filter(t => t.id !== undefined && t.token);
        if (list.length) {
          return list.sort((a, b) => {
            const ta = a.criado_em ? new Date(String(a.criado_em)).getTime() : 0;
            const tb = b.criado_em ? new Date(String(b.criado_em)).getTime() : 0;
            return tb - ta;
          });
        }
      } catch (error: any) {
        const status = error?.response?.status;
        if (status && status !== 401) continue;
      }
    }
    return [];
  }
}

export const tokenApi = new TokenApi();

