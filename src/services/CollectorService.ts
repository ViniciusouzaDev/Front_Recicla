// src/services/CollectorService.ts
import api from './Api';
import { CollectionRequest } from '../types/CollectionTypes';
import { Coordinates } from '../../utils/locationUtils';

export type ScreenCollectionStatus = 'pending' | 'in_progress' | 'completed';

export interface ScreenCollection {
  id: string;
  coleta_id?: string;
  material: string;
  materialName: string;
  materialColor: string;
  materialIcon: string;
  address: string;
  photo: string;
  distance: number;
  points: number;
  status: ScreenCollectionStatus;
  createdAt: string;
  coordinates: Coordinates;
  user: {
    name: string;
    avatar: string;
  };
}

class CollectorService {

  /** Buscar todas as coletas */
  async getAllCollections(): Promise<CollectionRequest[]> {
    try {
      const r = await api.get('/coleta');
      const payload = r.data;
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      if (Array.isArray(payload?.coletas)) return payload.coletas;
      return [];
    } catch (err: any) {
      try {
        const r2 = await api.get('/coletas');
        const payload2 = r2.data;
        if (Array.isArray(payload2)) return payload2;
        if (Array.isArray(payload2?.data)) return payload2.data;
        if (Array.isArray(payload2?.coletas)) return payload2.coletas;
        return [];
      } catch (err2) {
        return [];
      }
    }
  }

  /** Buscar por status */
  async getCollectionsByStatus(status: 'Solicitada' | 'Em andamento' | 'Finalizada'): Promise<CollectionRequest[]> {
    if (status === 'Solicitada') {
      try {
        const r = await api.get('/coleta/disponiveis');
        const p = r.data;
        if (Array.isArray(p)) return p;
        if (Array.isArray(p?.data)) return p.data;
        return [];
      } catch (err) {
        try {
          const r2 = await api.get('/coleta');
          const p2 = r2.data;
          const list = Array.isArray(p2) ? p2 : (Array.isArray(p2?.data) ? p2.data : []);
          return list.filter((c: any) => /Solicitada|pendente/i.test(String(c.status)));
        } catch {
          return [];
        }
      }
    }

    if (status === 'Em andamento') {
      try {
        // Backend retorna apenas coletas do coletor autenticado (filtradas por coletor_id)
        const r = await api.get('/coleta/aceitas');
        const p = r.data;
        if (Array.isArray(p)) return p;
        if (Array.isArray(p?.data)) return p.data;
        return [];
      } catch (err) {
        console.warn('Erro ao buscar coletas aceitas, tentando fallback:', err);
        try {
          // Fallback: buscar todas e filtrar por status
          const r2 = await api.get('/coleta');
          const p2 = r2.data;
          const list = Array.isArray(p2) ? p2 : (Array.isArray(p2?.data) ? p2.data : []);
          // Filtrar por status 'em_andamento' ou 'Em andamento' ou 'aceita'
          return list.filter((c: any) => {
            const statusStr = String(c.status || '').toLowerCase();
            return /em_andamento|em andamento|aceita/i.test(statusStr);
          });
        } catch {
          return [];
        }
      }
    }

    if (status === 'Finalizada') {
      try {
        const r = await api.get('/coleta');
        const p = r.data;
        const list = Array.isArray(p) ? p : (Array.isArray(p?.data) ? p.data : []);
        return list.filter((c: any) => /finalizada|conclu[ií]da/i.test(String(c.status)));
      } catch (err) {
        try {
          const r2 = await api.get('/coletas');
          const p2 = r2.data;
          const list2 = Array.isArray(p2) ? p2 : (Array.isArray(p2?.data) ? p2.data : []);
          return list2.filter((c: any) => /finalizada|conclu[ií]da/i.test(String(c.status)));
        } catch {
          return [];
        }
      }
    }

    return [];
  }

  /** Aceitar coleta - envia apenas coletaId, o backend pega coletor_id do token JWT */
  async assignCollectorToCollection(collectionId: string): Promise<boolean> {
    // O backend agora pega o coletor_id automaticamente do token JWT
    // Enviamos apenas o coletaId
    const payload: any = {
      coletaId: String(collectionId),
      // aliases para máxima compatibilidade com diferentes formatos
      coleta_id: String(collectionId),
      id_coleta: String(collectionId),
      idColeta: String(collectionId),
    };

    try {
      console.log('Enviando requisição para aceitar coleta:', { collectionId, payload });
      const r = await api.post('/coleta/aceitar', payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('Resposta do backend ao aceitar coleta:', { status: r.status, data: r.data });
      if (r.status === 200 || r.status === 201) {
        console.log('✅ Coleta aceita com sucesso. Backend associou coletor_id automaticamente.');
        return true;
      }
      console.warn('Status HTTP inesperado ao aceitar coleta:', r.status);
      return false;
    } catch (e: any) {
      console.error('❌ Falha na rota /coleta/aceitar:');
      console.error('  - Status:', e?.response?.status);
      console.error('  - Data:', e?.response?.data);
      console.error('  - Message:', e?.message);
      console.error('  - Erro completo:', e);
      return false;
    }
  }

  /** Finalizar coleta - usa rota POST /coleta/:id/finalizar */
  async completeCollection(collectionId: string, note: string): Promise<boolean> {
    const payload: any = {
      status: 'finalizada',
      observacao: note || 'Coleta finalizada',
      note: note || 'Coleta finalizada',
    };

    try {
      console.log('Enviando requisição para finalizar coleta:', { collectionId, payload });
      // Tenta primeiro a rota POST /coleta/:id/finalizar
      const r1 = await api.post(`/coleta/${collectionId}/finalizar`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('Resposta do backend ao finalizar coleta (POST):', { status: r1.status, data: r1.data });
      if (r1.status === 200 || r1.status === 201) {
        console.log('✅ Coleta finalizada com sucesso via POST /coleta/:id/finalizar');
        return true;
      }
      console.warn('Status HTTP inesperado ao finalizar coleta (POST):', r1.status);
    } catch (e1: any) {
      console.warn('❌ Falha na rota POST /coleta/:id/finalizar:');
      console.warn('  - Status:', e1?.response?.status);
      console.warn('  - Data:', e1?.response?.data);
      console.warn('  - Message:', e1?.message);
      console.warn('Tentando fallback PUT /coleta/:id...');
      // Fallback: tenta rota PUT /coleta/:id
      try {
        const r2 = await api.put(`/coleta/${collectionId}`, payload, {
          headers: { 'Content-Type': 'application/json' },
        });
        console.log('Resposta do backend ao finalizar coleta (PUT):', { status: r2.status, data: r2.data });
        if (r2.status === 200 || r2.status === 201) {
          console.log('✅ Coleta finalizada com sucesso via PUT /coleta/:id');
          return true;
        }
        console.warn('Status HTTP inesperado ao finalizar coleta (PUT):', r2.status);
      } catch (e2: any) {
        console.error('❌ Falha na rota PUT /coleta/:id:');
        console.error('  - Status:', e2?.response?.status);
        console.error('  - Data:', e2?.response?.data);
        console.error('  - Message:', e2?.message);
        return false;
      }
    }
    return false;
  }

  /** Converter para exibição */
  convertCollectionsForScreen(
    collections: any,
    userLocation?: Coordinates
  ): ScreenCollection[] {
    const list: any[] = Array.isArray(collections)
      ? collections
      : Array.isArray(collections?.data)
        ? collections.data
        : Array.isArray(collections?.coletas)
          ? collections.coletas
          : [];

    return list.map((collection: any) => {

      const rawType = collection.tipo_residuo || collection.materialType || '';
      const normType = this.normalizeMaterialType(rawType);

      const latitude = Number(collection.latitude ?? collection.lat) || -23.5505;
      const longitude = Number(collection.longitude ?? collection.lng ?? collection.long) || -46.6333;

      let photo = '';
      if (collection.arquivo_coleta) {
        const base = (api.defaults.baseURL || '').replace(/\/+$/, '').replace(/\/(api)$/, '');
        photo = `${base}/uploads/${collection.arquivo_coleta}`;
      }

      // Mapear status do backend para o formato do frontend
      // Backend retorna: 'pendente', 'em_andamento', 'finalizada'
      // Frontend usa: 'pending', 'in_progress', 'completed'
      const statusRaw = String(collection.status || '').toLowerCase();
      const status = 
        /pendente|solicitada/i.test(statusRaw)
          ? 'pending'
          : /em_andamento|em andamento|aceita|in_progress/i.test(statusRaw)
            ? 'in_progress'
            : /finalizada|conclu[ií]da|completed/i.test(statusRaw)
              ? 'completed'
              : 'completed';

      return {
        id: String(
          collection.id 
          ?? collection.coleta_id 
          ?? collection.coletaId 
          ?? collection.id_coleta 
          ?? collection.idColeta 
          ?? ''
        ),
        coleta_id: String(
          collection.coleta_id ?? collection.coletaId ?? collection.id_coleta ?? collection.idColeta ?? collection.id ?? ''
        ),
        material: normType,
        materialName: this.materialDisplayName(normType),
        materialColor: this.getMaterialColor(normType),
        materialIcon: this.getMaterialIcon(normType),
        address: collection.local_coleta || '',
        photo,
        distance: userLocation
          ? this.calculateDistance(userLocation, { latitude, longitude })
          : 0,
        points: this.getMaterialPoints(normType),
        status,
        createdAt: collection.data_coleta && collection.hora_coleta
          ? `${collection.data_coleta}T${collection.hora_coleta}`
          : new Date(collection.createdAt || new Date()).toISOString(),
        coordinates: { latitude, longitude },
        user: {
          name: collection.usuario?.nome || 'Usuário',
          avatar: '',
        },
      };
    });
  }

  /* Helpers */
  private getMaterialColor(materialType: string): string {
    switch (materialType) {
      case 'paper': return '#00D1FF';
      case 'glass': return '#00FF84';
      case 'metal': return '#FFD600';
      case 'plastic': return '#FF6B00';
      default: return '#00D1FF';
    }
  }

  private getMaterialIcon(materialType: string): string {
    switch (materialType) {
      case 'paper': return '📄';
      case 'glass': return '🍾';
      case 'metal': return '🥫';
      case 'plastic': return '🥤';
      default: return '♻️';
    }
  }

  private getMaterialPoints(materialType: string): number {
    switch (materialType) {
      case 'paper': return 50;
      case 'glass': return 100;
      case 'metal': return 60;
      case 'plastic': return 75;
      default: return 50;
    }
  }

  private normalizeMaterialType(raw: string): string {
    const v = (raw || '').toLowerCase();
    if (v.includes('papel')) return 'paper';
    if (v.includes('vidro')) return 'glass';
    if (v.includes('metal')) return 'metal';
    if (v.includes('plast')) return 'plastic';
    return 'plastic';
  }

  private materialDisplayName(norm: string): string {
    switch (norm) {
      case 'paper': return 'Papel';
      case 'glass': return 'Vidro';
      case 'metal': return 'Metal';
      case 'plastic': return 'Plástico';
      default: return 'Material';
    }
  }

  private calculateDistance(from: Coordinates, to: Coordinates): number {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(to.latitude - from.latitude);
    const dLon = toRad(to.longitude - from.longitude);
    const lat1 = toRad(from.latitude);
    const lat2 = toRad(to.latitude);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(2));
  }
}

export const collectorService = new CollectorService();
