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
  /**
   * Buscar todas as coletas do backend
   */
  async getAllCollections(): Promise<CollectionRequest[]> {
    const response = await api.get<CollectionRequest[]>('/coletas');
    return response.data;
  }

  /**
   * Buscar coletas por status
   */
  async getCollectionsByStatus(status: 'Solicitada' | 'Em andamento' | 'Finalizada'): Promise<CollectionRequest[]> {
    const response = await api.get<CollectionRequest[]>(`/coletas?status=${status}`);
    return response.data;
  }

  /**
   * Aceitar uma coleta (atribuir coletor)
   */
  async assignCollectorToCollection(
    collectionId: string,
    collectorId: string,
    collectorName: string
  ): Promise<boolean> {
    try {
      const response = await api.post(`/coletas/${collectionId}/aceitar`, { collectorId, collectorName });
      return response.status === 200;
    } catch (error) {
      console.error('Erro ao aceitar coleta:', error);
      return false;
    }
  }

  /**
   * Finalizar uma coleta
   */
  async completeCollection(collectionId: string, note: string): Promise<boolean> {
    try {
      const response = await api.post(`/coletas/${collectionId}/finalizar`, { note });
      return response.status === 200;
    } catch (error) {
      console.error('Erro ao finalizar coleta:', error);
      return false;
    }
  }

  /**
   * Converte coletas do backend para formato usado na tela
   */
  convertCollectionsForScreen(
    collections: CollectionRequest[],
    userLocation?: Coordinates
  ): ScreenCollection[] {
    return collections.map(collection => {
      const latitude = collection.latitude ?? -23.5505;
      const longitude = collection.longitude ?? -46.6333;

      return {
        id: collection.id,
        material: collection.materialType,
        materialName: collection.materialName,
        materialColor: this.getMaterialColor(collection.materialType),
        materialIcon: this.getMaterialIcon(collection.materialType),
        address: collection.address,
        photo: collection.photoUri,
        distance: userLocation
          ? this.calculateDistance(userLocation, { latitude, longitude })
          : 0,
        points: this.getMaterialPoints(collection.materialType),
        status:
          collection.status === 'Solicitada'
            ? 'pending'
            : collection.status === 'Em andamento'
            ? 'in_progress'
            : 'completed',
        createdAt: collection.createdAt
          ? new Date(collection.createdAt).toISOString()
          : new Date().toISOString(),
        coordinates: { latitude, longitude },
        user: {
          name: (collection as any).user?.name ?? (collection as any).userName ?? '',
          avatar: (collection as any).user?.avatar ?? (collection as any).userAvatar ?? '',
        },
      };
    });
  }

  /* Helpers privados */
  private getMaterialColor(materialType: string): string {
    switch (materialType) {
      case 'paper':
        return '#00D1FF';
      case 'glass':
        return '#00FF84';
      case 'metal':
        return '#FFD600';
      case 'plastic':
        return '#FF6B00';
      default:
        return '#00D1FF';
    }
  }

  private getMaterialIcon(materialType: string): string {
    switch (materialType) {
      case 'paper':
        return '📄';
      case 'glass':
        return '🍾';
      case 'metal':
        return '🥫';
      case 'plastic':
        return '🥤';
      default:
        return '♻️';
    }
  }

  private getMaterialPoints(materialType: string): number {
    switch (materialType) {
      case 'paper':
        return 50;
      case 'glass':
        return 100;
      case 'metal':
        return 60;
      case 'plastic':
        return 75;
      default:
        return 50;
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
    return parseFloat((R * c).toFixed(2)); // distância em km com 2 casas decimais
  }
}

export const collectorService = new CollectorService();
