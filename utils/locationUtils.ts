// Utilitários para manipulação de localização GPS
// TODO: Integrar com Google Maps para funcionalidades avançadas
import * as Location from 'expo-location';
import { MapLocation } from '../src/services/MapService';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Calcula a distância entre duas coordenadas GPS usando a fórmula de Haversine
 * @param coord1 Primeira coordenada (lat, lng)
 * @param coord2 Segunda coordenada (lat, lng)
 * @returns Distância em quilômetros
 */
export const calculateDistance = (coord1: Coordinates, coord2: Coordinates): number => {
  const R = 6371; // Raio da Terra em quilômetros
  const dLat = toRadians(coord2.latitude - coord1.latitude);
  const dLon = toRadians(coord2.longitude - coord1.longitude);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.latitude)) * Math.cos(toRadians(coord2.latitude)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

/**
 * Converte graus para radianos
 */
const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Verifica se o usuário está próximo o suficiente de uma coleta
 * @param userLocation Localização atual do usuário
 * @param collectionLocation Localização da coleta
 * @param maxDistance Distância máxima permitida em quilômetros (padrão: 2km)
 * @returns true se estiver próximo o suficiente
 */
export const isUserNearCollection = (
  userLocation: Coordinates, 
  collectionLocation: Coordinates, 
  maxDistance: number = 2.0
): boolean => {
  const distance = calculateDistance(userLocation, collectionLocation);
  return distance <= maxDistance;
};

/**
 * Formata a distância para exibição
 * @param distance Distância em quilômetros
 * @returns String formatada da distância
 */
export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance.toFixed(1)}km`;
};

/**
 * Obtém a localização atual do usuário
 * @returns Promise com as coordenadas ou null se não conseguir obter
 */
export const getCurrentLocation = async (): Promise<Coordinates | null> => {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permissão de localização não concedida');
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error('Erro ao obter localização:', error);
    return null;
  }
};

/**
 * Valida se as coordenadas são válidas
 * @param coordinates Coordenadas para validar
 * @returns true se as coordenadas são válidas
 */
export const isValidCoordinates = (coordinates: Coordinates): boolean => {
  return (
    coordinates.latitude >= -90 && coordinates.latitude <= 90 &&
    coordinates.longitude >= -180 && coordinates.longitude <= 180 &&
    !isNaN(coordinates.latitude) && !isNaN(coordinates.longitude)
  );
};

/**
 * Converte Coordinates para MapLocation
 * TODO: Usar MapService quando Google Maps estiver implementado
 */
export const coordinatesToMapLocation = (coordinates: Coordinates): MapLocation => {
  return {
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
  };
};

/**
 * Converte MapLocation para Coordinates
 * TODO: Usar MapService quando Google Maps estiver implementado
 */
export const mapLocationToCoordinates = (mapLocation: MapLocation): Coordinates => {
  return {
    latitude: mapLocation.latitude,
    longitude: mapLocation.longitude,
  };
};
