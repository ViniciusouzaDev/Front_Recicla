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
      console.log("🔍 Buscando ranking do backend...");
      const headers = await getAuthHeaders();
      console.log("🔑 Headers de autenticação:", headers);
      
      const response = await api.get("/pontuacao/ranking", {
        headers: headers,
      });

      console.log("📥 Resposta completa do backend:", JSON.stringify(response.data, null, 2));
      console.log("📥 Status da resposta:", response.status);

      const payload = response.data;
      let rankings = [];
      
      // Tenta diferentes estruturas de resposta
      if (Array.isArray(payload)) {
        rankings = payload;
        console.log("✅ Ranking encontrado como array direto:", rankings.length, "itens");
      } else if (payload?.success && Array.isArray(payload?.data)) {
        rankings = payload.data;
        console.log("✅ Ranking encontrado em payload.data:", rankings.length, "itens");
      } else if (Array.isArray(payload?.data)) {
        rankings = payload.data;
        console.log("✅ Ranking encontrado em payload.data (sem success):", rankings.length, "itens");
      } else if (payload?.data && Array.isArray(payload.data)) {
        rankings = payload.data;
        console.log("✅ Ranking encontrado em data:", rankings.length, "itens");
      } else {
        console.warn("⚠️ Estrutura de resposta não reconhecida:", Object.keys(payload || {}));
        console.warn("⚠️ Payload completo:", JSON.stringify(payload, null, 2));
      }
      
      console.log("📊 Ranking final processado:", rankings.length, "itens");
      if (rankings.length > 0) {
        console.log("📊 Primeiro item do ranking:", JSON.stringify(rankings[0], null, 2));
      }
      
      return rankings;
    } catch (error: any) {
      console.error("❌ Erro ao buscar ranking:");
      console.error("  - Mensagem:", error.message);
      console.error("  - Status:", error.response?.status);
      console.error("  - Data:", JSON.stringify(error.response?.data, null, 2));
      console.error("  - Erro completo:", error);
      return [];
    }
  },
};
