// src/api/axiosInstance.ts
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:4322",
  withCredentials: true,
});

// Interceptor para manejar errores 401 globalmente
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // ⚠️ NO redireccionamos globalmente
    return Promise.reject(error); // Dejamos que el componente lo maneje
  }
);

export default axiosInstance; // ✅ ESTA instancia es la que debe usarse
