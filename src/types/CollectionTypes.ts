// TODO: Implementar integração com backend para persistir status das coletas
export interface CollectionRequest {
  id: string;
  userId: string;
  materialType: string;
  materialName: string;
  photoUri: string;
  address: string;
  latitude?: number;
  longitude?: number;
  status: CollectionStatus;
  createdAt: Date;
  updatedAt: Date;
  collectorId?: string;
  collectorName?: string;
  estimatedTime?: string;
  notes?: string;
}

export type CollectionStatus = 'Solicitada' | 'Em andamento' | 'Concluída' | 'Cancelada';

export interface CollectionStatusUpdate {
  collectionId: string;
  status: CollectionStatus;
  collectorId?: string;
  collectorName?: string;
  estimatedTime?: string;
  notes?: string;
  updatedAt: Date;
}

// TODO: Implementar notificações push para mudanças de status
export interface CollectionNotification {
  id: string;
  collectionId: string;
  userId: string;
  type: 'status_update' | 'collector_assigned' | 'collection_completed';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

// TODO: Implementar sistema de avaliação pós-coleta
export interface CollectionRating {
  collectionId: string;
  userId: string;
  collectorId: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: Date;
}
