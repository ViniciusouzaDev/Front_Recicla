// src/services/coletaUploadService.ts
import api from './Api';

export interface UploadColetaResponse {
  success?: boolean;
  coleta?: Record<string, any>;
}

/**
 * Envia uma coleta com foto para o backend (multipart/form-data)
 */
export const uploadColeta = async (
  uri: string,
  local_coleta: string,
  data_coleta: string,
  hora_coleta: string,
  tipo_residuo: 'plastico' | 'papel' | 'metal' | 'vidro',
  latitude: number,
  longitude: number
): Promise<UploadColetaResponse> => {
  try {
    const formData = new FormData();

    // Foto (campo precisa se chamar 'foto' pois o multer espera esse nome)
    formData.append('arquivo_coleta', {
      uri,
      type: 'image/jpeg',
      name: 'coleta.jpg',
    } as any);

    // Campos conforme backend (nomes exatos do controller/service)
    formData.append('local_coleta', local_coleta);
    formData.append('data_coleta', data_coleta);
    formData.append('hora_coleta', hora_coleta);
    formData.append('tipo_residuo', tipo_residuo);
    formData.append('latitude', latitude.toString());
    formData.append('longitude', longitude.toString());

    const response = await api.post<UploadColetaResponse>(
      '/coleta/upload-coleta',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  } catch (error: any) {
    const msg = error.response?.data?.message || error.message || 'Erro desconhecido';
    console.error('Erro ao enviar coleta:', msg);
    throw new Error(msg);
  }
};
