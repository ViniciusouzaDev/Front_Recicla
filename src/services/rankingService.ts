// src/services/rankingService.ts

import api from "./Api";
import AsyncStorage from "@react-native-async-storage/async-storage";

async function getAuthHeaders() {
  const token = await AsyncStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const rankingService = {
  async getAllRankings(): Promise<any[]> {
    try {
      const response = await api.get("/pontuacao/ranking", {
        headers: await getAuthHeaders(),
      });

      const payload = response.data;
      if (Array.isArray(payload)) {
        return payload;
      }
      if (Array.isArray(payload?.data)) {
        return payload.data;
      }
      return [];
    } catch (error: any) {
      console.error("Erro ao buscar ranking:", error.response?.data || error.message);
      return [];
    }
  },
};
