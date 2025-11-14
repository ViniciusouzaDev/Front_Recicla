// src/services/api.ts
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const api = axios.create({
  baseURL: "http://192.168.100.104:3000/api",   ///alterar conforme o IP do seu servidor endereço global para o serviço 
  headers: {
    "Content-Type": "application/json",
  },
});


// Interceptor para adicionar token automaticamente
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
