import { CollectionRequest, CollectionStatus, CollectionStatusUpdate } from '../types/CollectionTypes';

// TODO: Implementar integração com API real
class CollectionService {
  private collections: CollectionRequest[] = [];
  private nextId = 1;

  constructor() {
    // Adicionar algumas coletas de exemplo para demonstração
    this.initializeMockData();
  }

  private initializeMockData() {
    const mockCollections: CollectionRequest[] = [
      {
        id: 'collection_1',
        userId: 'user_123',
        materialType: 'paper',
        materialName: 'Papel',
        photoUri: 'https://via.placeholder.com/300x200/00D1FF/FFFFFF?text=Papel',
        address: 'Rua das Flores, 123 - Centro, São Paulo',
        latitude: -23.5505,
        longitude: -46.6333,
        status: 'Solicitada',
        createdAt: new Date('2024-01-15T10:30:00Z'),
        updatedAt: new Date('2024-01-15T10:30:00Z'),
      },
      {
        id: 'collection_2',
        userId: 'user_123',
        materialType: 'plastic',
        materialName: 'Plástico',
        photoUri: 'https://via.placeholder.com/300x200/FF6B00/FFFFFF?text=Plástico',
        address: 'Av. Paulista, 456 - Bela Vista, São Paulo',
        latitude: -23.5613,
        longitude: -46.6565,
        status: 'Em andamento',
        createdAt: new Date('2024-01-15T11:15:00Z'),
        updatedAt: new Date('2024-01-15T11:15:00Z'),
        collectorId: 'collector_123',
        collectorName: 'João Coletor',
        estimatedTime: '30 minutos',
      },
      {
        id: 'collection_3',
        userId: 'user_123',
        materialType: 'glass',
        materialName: 'Vidro',
        photoUri: 'https://via.placeholder.com/300x200/00FF84/FFFFFF?text=Vidro',
        address: 'Rua Augusta, 789 - Consolação, São Paulo',
        latitude: -23.5475,
        longitude: -46.6405,
        status: 'Concluída',
        createdAt: new Date('2024-01-15T09:45:00Z'),
        updatedAt: new Date('2024-01-15T12:00:00Z'),
        collectorId: 'collector_456',
        collectorName: 'Maria Coletora',
        notes: 'Coleta realizada com sucesso',
      },
      {
        id: 'collection_4',
        userId: 'user_456',
        materialType: 'metal',
        materialName: 'Metal',
        photoUri: 'https://via.placeholder.com/300x200/FFD600/FFFFFF?text=Metal',
        address: 'Rua Oscar Freire, 321 - Jardins, São Paulo',
        latitude: -23.5687,
        longitude: -46.6693,
        status: 'Solicitada',
        createdAt: new Date('2024-01-15T08:20:00Z'),
        updatedAt: new Date('2024-01-15T08:20:00Z'),
      },
      {
        id: 'collection_5',
        userId: 'user_789',
        materialType: 'plastic',
        materialName: 'Plástico',
        photoUri: 'https://via.placeholder.com/300x200/FF6B00/FFFFFF?text=Plástico',
        address: 'Rua Haddock Lobo, 456 - Cerqueira César, São Paulo',
        latitude: -23.5613,
        longitude: -46.6565,
        status: 'Em andamento',
        createdAt: new Date('2024-01-15T14:30:00Z'),
        updatedAt: new Date('2024-01-15T14:30:00Z'),
        collectorId: 'collector_789',
        collectorName: 'Pedro Coletor',
        estimatedTime: '15 minutos',
      },
    ];

    this.collections = mockCollections;
    this.nextId = 6;
  }

  // Método para obter todas as coletas (para debug e desenvolvimento)
  getAllCollections(): CollectionRequest[] {
    return this.collections;
  }

  // Criar nova solicitação de coleta
  async createCollectionRequest(data: {
    userId: string;
    materialType: string;
    materialName: string;
    photoUri: string;
    address: string;
    latitude?: number;
    longitude?: number;
  }): Promise<CollectionRequest> {
    const collection: CollectionRequest = {
      id: `collection_${this.nextId++}`,
      userId: data.userId,
      materialType: data.materialType,
      materialName: data.materialName,
      photoUri: data.photoUri,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      status: 'Solicitada',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.collections.push(collection);
    
    // TODO: Implementar notificação para coletores próximos
    console.log('Nova coleta solicitada:', collection);
    
    return collection;
  }

  // Atualizar status da coleta
  async updateCollectionStatus(update: CollectionStatusUpdate): Promise<CollectionRequest | null> {
    const collection = this.collections.find(c => c.id === update.collectionId);
    
    if (!collection) {
      return null;
    }

    collection.status = update.status;
    collection.updatedAt = update.updatedAt;
    
    if (update.collectorId) {
      collection.collectorId = update.collectorId;
    }
    
    if (update.collectorName) {
      collection.collectorName = update.collectorName;
    }
    
    if (update.estimatedTime) {
      collection.estimatedTime = update.estimatedTime;
    }
    
    if (update.notes) {
      collection.notes = update.notes;
    }

    // TODO: Implementar notificação para o usuário sobre mudança de status
    console.log('Status da coleta atualizado:', collection);
    
    return collection;
  }

  // Buscar coletas por usuário
  async getCollectionsByUser(userId: string): Promise<CollectionRequest[]> {
    return this.collections.filter(c => c.userId === userId);
  }

  // Buscar coletas por coletor
  async getCollectionsByCollector(collectorId: string): Promise<CollectionRequest[]> {
    return this.collections.filter(c => c.collectorId === collectorId);
  }

  // Buscar coletas por status
  async getCollectionsByStatus(status: CollectionStatus): Promise<CollectionRequest[]> {
    return this.collections.filter(c => c.status === status);
  }

  // Buscar coleta por ID
  async getCollectionById(id: string): Promise<CollectionRequest | null> {
    return this.collections.find(c => c.id === id) || null;
  }

  // TODO: Implementar busca por proximidade geográfica
  async getCollectionsNearby(latitude: number, longitude: number, radiusKm: number): Promise<CollectionRequest[]> {
    // Por enquanto retorna todas as coletas solicitadas
    return this.collections.filter(c => c.status === 'Solicitada');
  }

  // TODO: Implementar sistema de atribuição automática de coletores
  async assignCollectorToCollection(collectionId: string, collectorId: string, collectorName: string): Promise<boolean> {
    const collection = this.collections.find(c => c.id === collectionId);
    
    if (!collection || collection.status !== 'Solicitada') {
      return false;
    }

    collection.collectorId = collectorId;
    collection.collectorName = collectorName;
    collection.status = 'Em andamento';
    collection.updatedAt = new Date();

    console.log('Coletor atribuído à coleta:', collection);
    return true;
  }

  // TODO: Implementar cancelamento de coleta
  async cancelCollection(collectionId: string, reason?: string): Promise<boolean> {
    const collection = this.collections.find(c => c.id === collectionId);
    
    if (!collection || collection.status === 'Concluída') {
      return false;
    }

    collection.status = 'Cancelada';
    collection.updatedAt = new Date();
    
    if (reason) {
      collection.notes = reason;
    }

    console.log('Coleta cancelada:', collection);
    return true;
  }

  // TODO: Implementar conclusão de coleta
  async completeCollection(collectionId: string, notes?: string): Promise<boolean> {
    const collection = this.collections.find(c => c.id === collectionId);
    
    if (!collection || collection.status !== 'Em andamento') {
      return false;
    }

    collection.status = 'Concluída';
    collection.updatedAt = new Date();
    
    if (notes) {
      collection.notes = notes;
    }

    console.log('Coleta concluída:', collection);
    return true;
  }

  // TODO: Implementar busca de coletas concluídas por usuário
  async getCompletedCollectionsByUser(userId: string): Promise<CollectionRequest[]> {
    return this.collections.filter(c => c.userId === userId && c.status === 'Concluída');
  }
}

export const collectionService = new CollectionService();
