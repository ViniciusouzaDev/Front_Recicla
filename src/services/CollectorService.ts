// src/services/CollectorService.ts
import api from './Api';
import { CollectionRequest } from '../types/CollectionTypes';
import { Coordinates } from '../../utils/locationUtils';

export type ScreenCollectionStatus = 'pending' | 'in_progress' | 'completed';

export interface ScreenCollection {
  id: string;
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
      const r = await api.get('/coleta/disponiveis');
      const p = r.data;
      if (Array.isArray(p)) return p;
      if (Array.isArray(p?.data)) return p.data;
      return [];
    }

    if (status === 'Em andamento') {
      const r = await api.get('/coleta/aceitas');
      const p = r.data;
      if (Array.isArray(p)) return p;
      if (Array.isArray(p?.data)) return p.data;
      return [];
    }

    if (status === 'Finalizada') {
      const r = await api.get('/coleta');
      const p = r.data;
      const list = Array.isArray(p) ? p : (Array.isArray(p?.data) ? p.data : []);
      return list.filter((c: any) => /finalizada|conclu[ií]da/i.test(String(c.status)));
    }

    return [];
  }

  /** Aceitar coleta */
  async assignCollectorToCollection(collectionId: string): Promise<boolean> {
    try {
      const response = await api.post('/coleta/aceitar', {
        coletaId: collectionId
      });

      return response.status === 200;
    } catch (error: any) {
      console.error('Erro ao aceitar coleta:', error);
      return false;
    }
  }

  /** Finalizar coleta */
  async completeCollection(collectionId: string, note: string): Promise<boolean> {
    try {
      const response = await api.post(`/coleta/${collectionId}/finalizar`, { note });
      return response.status === 200;
    } catch (error) {
      console.error('Erro ao finalizar coleta:', error);
      return false;
    }
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

      const status = /Solicitada|pendente/i.test(collection.status)
        ? 'pending'
        : /Em andamento|aceita/i.test(collection.status)
          ? 'in_progress'
          : /finalizada|conclu[ií]da/i.test(collection.status)
            ? 'completed'
            : 'completed';

      return {
        id: String(collection.id ?? collection.coleta_id ?? ''),
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
