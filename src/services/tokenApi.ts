// src/services/tokenApi.ts
import api from './Api';

export interface GerarTokenResponse {
  coletaId: string;
  token: string;
}

export interface ValidarTokenResponse {
  success: boolean;
  message?: string;
}

class TokenApi {
  /**
   * Gera um token para uma coleta
   * @param coletaId ID da coleta
   * @returns Token gerado e ID da coleta
   */
  async gerarToken(coletaId: string): Promise<GerarTokenResponse> {
    try {
      const response = await api.post<GerarTokenResponse>('/tokens/gerar', {
        coletaId,
      });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao gerar token:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao gerar token';
      throw new Error(errorMessage);
    }
  }

  /**
   * Valida um token para finalizar uma coleta
   * @param coletaId ID da coleta
   * @param token Token a ser validado
   * @returns Resultado da validação
   */
  async validarToken(coletaId: string, token: string): Promise<ValidarTokenResponse> {
    try {
      const response = await api.post<ValidarTokenResponse>('/tokens/validar', {
        coletaId,
        token,
      });
      return response.data;
    } catch (error: any) {
      console.error('Erro ao validar token:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao validar token';
      throw new Error(errorMessage);
    }
  }
}

export const tokenApi = new TokenApi();

