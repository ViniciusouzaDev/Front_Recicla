import api from "./Api";
import AsyncStorage from "@react-native-async-storage/async-storage";

async function getAuthHeaders() {
  const token = await AsyncStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const rankingService = {
  async getAllRankings() {
    try {
      const { data } = await api.get("/pontuacao", {
        headers: await getAuthHeaders(),
      });
      return data;
    } catch (error: any) {
      console.error("Erro ao buscar ranking:", error.response?.data || error.message);
      throw new Error("Erro ao buscar ranking dos usuários");
    }
  },
};
