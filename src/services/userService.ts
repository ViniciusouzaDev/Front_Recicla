import api from "./Api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as jwtDecode from "jwt-decode"; // ✅ Forma compatível com todas as versões

interface DecodedToken {
  usuario_id: number;
  email?: string;
  iat?: number;
  exp?: number;
}

/**
 * Obtém o ID do usuário a partir do token JWT armazenado.
 */
async function getUserIdFromToken(): Promise<number | null> {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      console.warn("⚠️ Nenhum token encontrado no AsyncStorage.");
      return null;
    }

    // ✅ Decodificação compatível com qualquer versão de jwt-decode
    const decoded: DecodedToken = (
      (jwtDecode as any).jwtDecode
        ? (jwtDecode as any).jwtDecode(token)
        : (jwtDecode as any).default
        ? (jwtDecode as any).default(token)
        : (jwtDecode as any)(token)
    ) as DecodedToken;

    if (!decoded?.usuario_id) {
      console.warn("⚠️ Token não contém o campo 'usuario_id'.", decoded);
      return null;
    }

    console.log("✅ Token decodificado:", decoded);
    return decoded.usuario_id;
  } catch (error) {
    console.error("❌ Erro ao decodificar token:", error);
    return null;
  }
}

/**
 * Retorna o header de autenticação (Authorization: Bearer token)
 */
async function getAuthHeaders() {
  const token = await AsyncStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Serviços do usuário
 */
export const userService = {
  /**
   * Busca os dados de perfil do usuário autenticado
   */
  async getProfile() {
    try {
      const userId = await getUserIdFromToken();
      if (!userId) throw new Error("Usuário não autenticado");

      const { data } = await api.get(`/usuarios/${userId}`, {
        headers: await getAuthHeaders(),
      });
      return data;
    } catch (error: any) {
      console.error("❌ Erro ao buscar perfil:", error.response?.data || error.message);
      throw new Error("Erro ao buscar perfil do usuário");
    }
  },

  /**
   * Histórico de pontuação do usuário
   */
  async getScoreHistory() {
    try {
      const userId = await getUserIdFromToken();
      if (!userId) throw new Error("Usuário não autenticado");

      const { data } = await api.get(`/pontuacao/usuario/${userId}`, {
        headers: await getAuthHeaders(),
      });
      return data;
    } catch (error: any) {
      console.error("❌ Erro ao buscar histórico de pontuação:", error.response?.data || error.message);
      throw new Error("Erro ao buscar histórico de pontuação");
    }
  },

  /**
   * Progresso do usuário
   */
  async getProgress() {
    try {
      const userId = await getUserIdFromToken();
      if (!userId) throw new Error("Usuário não autenticado");

      const { data } = await api.get(`/usuarios/${userId}/progresso`, {
        headers: await getAuthHeaders(),
      });
      return data;
    } catch (error: any) {
      console.error("❌ Erro ao buscar progresso:", error.response?.data || error.message);
      throw new Error("Erro ao buscar progresso do usuário");
    }
  },

  /**
   * Conquistas do usuário
   */
  async getAchievements() {
    try {
      const userId = await getUserIdFromToken();
      if (!userId) throw new Error("Usuário não autenticado");

      const { data } = await api.get(`/conquistas/${userId}`, {
        headers: await getAuthHeaders(),
      });
      return data;
    } catch (error: any) {
      console.error("❌ Erro ao buscar conquistas:", error.response?.data || error.message);
      throw new Error("Erro ao buscar conquistas do usuário");
    }
  },

  /**
   * Dados de gráfico do histórico do usuário
   */
  async getChartData() {
    try {
      const userId = await getUserIdFromToken();
      if (!userId) throw new Error("Usuário não autenticado");

      const { data } = await api.get(`/usuarios/${userId}/historico`, {
        headers: await getAuthHeaders(),
      });
      return data;
    } catch (error: any) {
      console.error("❌ Erro ao buscar dados de gráfico:", error.response?.data || error.message);
      throw new Error("Erro ao buscar dados de gráfico do usuário");
    }
  },
};
