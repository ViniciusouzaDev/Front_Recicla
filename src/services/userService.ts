import api from "./Api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as jwtDecode from "jwt-decode"; // ✅ Forma compatível com todas as versões

export interface DecodedToken {
  usuario_id: number;
  email?: string;
  iat?: number;
  exp?: number;
}

/**
 * Obtém o ID do usuário a partir do token JWT armazenado.
 */
export async function getUserIdFromToken(): Promise<number | null> {
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

      const response = await api.get(`/usuarios/${userId}`, {
        headers: await getAuthHeaders(),
      });
      
      const data = response.data;
      console.log("📥 Resposta completa do perfil:", JSON.stringify(data, null, 2));
      
      // O backend pode retornar { success: true, data: {...} } ou diretamente o objeto
      // Verifica se tem success e data
      if (data?.success && data?.data) {
        console.log("✅ Perfil encontrado em data.data");
        return data.data;
      }
      
      // Se não, retorna data diretamente
      if (data) {
        console.log("✅ Perfil encontrado em data");
        return data;
      }
      
      throw new Error("Resposta do perfil está vazia");
    } catch (error: any) {
      console.error("❌ Erro ao buscar perfil:", error.response?.data || error.message);
      throw new Error("Erro ao buscar perfil do usuário");
    }
  },

  /**
   * Atualiza os dados do perfil do usuário autenticado
   */
  async updateProfile(profileData: {
    nome?: string;
    email?: string;
    telefone?: string;
    endereco?: string;
    [key: string]: any;
  }) {
    try {
      const userId = await getUserIdFromToken();
      if (!userId) throw new Error("Usuário não autenticado");

      console.log("💾 Atualizando perfil do usuário:", userId);
      console.log("📝 Dados a serem atualizados:", JSON.stringify(profileData, null, 2));

      const response = await api.put(`/usuarios/${userId}`, profileData, {
        headers: await getAuthHeaders(),
      });
      
      const data = response.data;
      console.log("✅ Resposta da atualização:", JSON.stringify(data, null, 2));
      
      // O backend pode retornar { success: true, data: {...} } ou diretamente o objeto
      if (data?.success && data?.data) {
        console.log("✅ Perfil atualizado com sucesso");
        return data.data;
      }
      
      if (data) {
        console.log("✅ Perfil atualizado com sucesso");
        return data;
      }
      
      throw new Error("Resposta da atualização está vazia");
    } catch (error: any) {
      console.error("❌ Erro ao atualizar perfil:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || error.response?.data?.error || "Erro ao atualizar perfil do usuário");
    }
  },

  /**
   * Histórico de pontuação do usuário
   */
  async getScoreHistory() {
    try {
      const userId = await getUserIdFromToken();
      if (!userId) throw new Error("Usuário não autenticado");

      // Tenta buscar do perfil primeiro (backend agora retorna historico_pontuacao)
      try {
        const profile = await this.getProfile();
        const profileData = profile?.data || profile;
        if (profileData?.historico_pontuacao && Array.isArray(profileData.historico_pontuacao)) {
          console.log("✅ Histórico encontrado no perfil");
          return profileData.historico_pontuacao;
        }
      } catch (e) {
        console.log("ℹ️ Histórico não encontrado no perfil, tentando rota específica");
      }

      // Fallback: busca da rota específica
      try {
        const { data } = await api.get(`/pontuacao/usuario/${userId}`, {
          headers: await getAuthHeaders(),
        });
        if (data?.data && Array.isArray(data.data)) {
          return data.data;
        }
        if (Array.isArray(data)) {
          return data;
        }
      } catch (e) {
        console.log("ℹ️ Rota /pontuacao/usuario/:id não disponível, tentando /usuarios/:id/historico");
      }

      // Tenta também a rota de histórico
      try {
        const { data: historicoData } = await api.get(`/usuarios/${userId}/historico`, {
          headers: await getAuthHeaders(),
        });
        if (historicoData?.data && Array.isArray(historicoData.data)) {
          return historicoData.data;
        }
        if (Array.isArray(historicoData)) {
          return historicoData;
        }
      } catch (e) {
        // Continua
      }
      
      return [];
    } catch (error: any) {
      console.error("❌ Erro ao buscar histórico de pontuação:", error.response?.data || error.message);
      throw new Error("Erro ao buscar histórico de pontuação");
    }
  },

  /**
   * Busca a pontuação total do usuário
   * O backend agora retorna pontuacao_total no perfil do usuário
   */
  async getTotalScore(): Promise<number> {
    try {
      const userId = await getUserIdFromToken();
      if (!userId) {
        console.warn("⚠️ Usuário não autenticado");
        return 0;
      }

      console.log("🔍 Buscando pontuação total para usuário:", userId);

      // Prioridade 1: Busca do perfil (backend retorna pontuacao_total)
      try {
        const profile = await this.getProfile();
        console.log("📋 Perfil do usuário recebido (completo):", JSON.stringify(profile, null, 2));
        
        // O backend retorna { success: true, data: { pontuacao_total: ... } }
        // getProfile() já extrai data.data, então profile já deve ter pontuacao_total
        // Mas verifica também profile.data caso ainda esteja aninhado
        const profileData = profile?.data || profile;
        
        // Verifica todos os campos possíveis
        const pontuacaoTotal = 
          profileData?.pontuacao_total ?? 
          profile?.pontuacao_total ??
          profileData?.total_pontos ??
          profile?.total_pontos;
        
        console.log("🔍 Tentando encontrar pontuacao_total:", {
          "profileData.pontuacao_total": profileData?.pontuacao_total,
          "profile.pontuacao_total": profile?.pontuacao_total,
          "profileData.total_pontos": profileData?.total_pontos,
          "profile.total_pontos": profile?.total_pontos,
        });
        
        if (pontuacaoTotal !== undefined && pontuacaoTotal !== null) {
          const pontos = Number(pontuacaoTotal);
          if (!isNaN(pontos)) {
            console.log("✅ Pontuação total encontrada no perfil:", pontos);
            return pontos;
          }
        }
        console.log("ℹ️ Campo pontuacao_total não encontrado no perfil. Campos disponíveis:", Object.keys(profile || {}));
      } catch (e: any) {
        console.warn("⚠️ Erro ao buscar pontuação do perfil:", e?.message);
      }

      // Prioridade 2: Busca diretamente da API de pontuação (usa pontuacao_total do backend)
      try {
        const { data } = await api.get(`/pontuacao/usuario/${userId}`, {
          headers: await getAuthHeaders(),
        });
        
        console.log("📊 Resposta da API de pontuação:", JSON.stringify(data, null, 2));
        
        // Pode retornar array direto ou dentro de data
        const registros = Array.isArray(data) ? data : (data?.data || []);
        
        if (Array.isArray(registros) && registros.length > 0) {
          // O backend retorna pontuacao_total em cada registro (todos têm o mesmo valor)
          // Pega o primeiro registro que tiver pontuacao_total
          const registroComTotal = registros.find((item: any) => 
            item.pontuacao_total !== undefined && item.pontuacao_total !== null
          );
          
          if (registroComTotal?.pontuacao_total !== undefined && registroComTotal?.pontuacao_total !== null) {
            const total = Number(registroComTotal.pontuacao_total);
            if (!isNaN(total)) {
              console.log("✅ Pontuação total encontrada nos registros (campo pontuacao_total):", total);
              return total;
            }
          }
          
          // Fallback: calcula a soma se pontuacao_total não estiver disponível
          const total = registros.reduce((acc: number, item: any) => {
            const pontos = Number(item.pontos ?? item.pontuacao ?? item.points ?? 0);
            return acc + (isNaN(pontos) ? 0 : pontos);
          }, 0);
          console.log("✅ Pontuação total calculada dos registros (fallback):", total);
          return total;
        } else {
          console.log("ℹ️ Nenhum registro de pontuação encontrado");
        }
      } catch (e: any) {
        console.warn("⚠️ Erro ao buscar pontuação da API:", e?.message);
      }

      // Prioridade 3: Calcula do histórico de pontuação (fallback)
      try {
        const scoreHistory = await this.getScoreHistory();
        console.log("📊 Histórico de pontuação:", scoreHistory);
        
        if (Array.isArray(scoreHistory) && scoreHistory.length > 0) {
          // Tenta buscar pontuacao_total do histórico primeiro
          const registroComTotal = scoreHistory.find((item: any) => 
            item.pontuacao_total !== undefined && item.pontuacao_total !== null
          );
          
          if (registroComTotal?.pontuacao_total !== undefined && registroComTotal?.pontuacao_total !== null) {
            const total = Number(registroComTotal.pontuacao_total);
            if (!isNaN(total)) {
              console.log("✅ Pontuação total encontrada no histórico (campo pontuacao_total):", total);
              return total;
            }
          }
          
          // Fallback: calcula a soma se pontuacao_total não estiver disponível
          const total = scoreHistory.reduce((acc: number, item: any) => {
            const pontos = Number(item.pontos ?? item.pontuacao ?? item.points ?? 0);
            return acc + (isNaN(pontos) ? 0 : pontos);
          }, 0);
          console.log("✅ Pontuação total calculada do histórico (fallback):", total);
          return total;
        } else {
          console.log("ℹ️ Histórico de pontuação vazio ou inválido");
        }
      } catch (e: any) {
        console.warn("⚠️ Erro ao calcular pontuação do histórico:", e?.message);
      }

      console.warn("⚠️ Não foi possível encontrar a pontuação total, retornando 0");
      return 0;
    } catch (error: any) {
      console.error("❌ Erro ao buscar pontuação total:", error);
      console.error("  - Response:", error?.response?.data);
      console.error("  - Status:", error?.response?.status);
      console.error("  - Message:", error?.message);
      return 0;
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
      
      // Garante que retorna um array
      if (Array.isArray(data)) {
        return data;
      }
      if (Array.isArray(data?.data)) {
        return data.data;
      }
      if (data?.historico && Array.isArray(data.historico)) {
        return data.historico;
      }
      
      // Se não for array, retorna array vazio
      console.warn("⚠️ getChartData não retornou um array, retornando array vazio");
      return [];
    } catch (error: any) {
      console.error("❌ Erro ao buscar dados de gráfico:", error.response?.data || error.message);
      // Retorna array vazio em caso de erro para não quebrar o dashboard
      return [];
    }
  },
};
