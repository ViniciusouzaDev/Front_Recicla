// src/services/IAService.ts
import api from './Api';

export interface IAResponse {
  sucesso?: boolean;
  mensagem?: string;
  coleta?: Record<string, any>;
  resultadoIA?: {
    materialDetected?: string;
    confidence?: number;
    [key: string]: any;
  };
  previewUri?: string;
  [key: string]: any;
}

/**
 * Envia uma foto para o backend para processamento via IA e criação de coleta
 * @param uri URI da imagem capturada
 * @param usuario_id ID do usuário autenticado
 * @param local_coletou Localização (texto) da coleta
 * @param data_coletou Data da coleta (YYYY-MM-DD)
 * @param hora_coletou Hora da coleta (HH:MM:SS)
 * @param tipo_residuo (Opcional) Tipo de resíduo indicado manualmente
 */
export const processPhotoWithIA = async (
  uri: string,
  usuario_id: string,
  local_coletou: string,
  data_coletou: string,
  hora_coletou: string,
  tipo_residuo?: string
): Promise<IAResponse> => {
  try {
    const formData = new FormData();

    // Foto (campo precisa se chamar 'foto' pois o multer espera esse nome)
    formData.append('arquivo_coleta', {
      uri,
      type: 'image/jpeg',
      name: 'coleta.jpg',
    } as any);

    // Campos conforme backend (nomes exatos do controller/service)
    formData.append('usuario_id', usuario_id);
    formData.append('local_coletou', local_coletou);
    formData.append('data_coletou', data_coletou);
    formData.append('hora_coletou', hora_coletou);

    if (tipo_residuo) {
      formData.append('tipo_residuo', tipo_residuo);
    }

    const response = await api.post<IAResponse>(
      '/coleta/upload-coleta',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    // Garante uma URI de preview da imagem
    if (!response.data.previewUri) {
      response.data.previewUri = uri;
    }

    return response.data;
  } catch (error: any) {
    const msg = error.response?.data?.message || error.message || 'Erro desconhecido';
    console.error('Erro ao enviar imagem para IA:', msg);
    throw new Error(msg);
  }
};
