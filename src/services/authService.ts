// src/services/authService.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./Api"; // sua instância do Axios

interface LoginResponse {
  token: string;
}

export async function login(email: string, senha: string): Promise<string> {
  try {
    // Corrigido endpoint para refletir seu backend
    const response = await api.post<LoginResponse>("/auth/login", { email, senha });
    const { token } = response.data;

    if (!token) {
      throw new Error("Token não recebido do servidor");
    }

    // Salva o token localmente
    await AsyncStorage.setItem("token", token);

    return token;
  } catch (error: any) {
    // Log detalhado para debug
    console.error("Erro ao fazer login:", error.response?.data || error.message);

    // Retorna uma mensagem amigável
    throw new Error(error.response?.data?.error || "Erro ao fazer login");
  }
}

export async function logout(): Promise<void> {
  await AsyncStorage.removeItem("token");
}

export async function getToken(): Promise<string | null> {
  return await AsyncStorage.getItem("token");
}
