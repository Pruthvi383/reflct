import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001/api"
});

let requestInterceptor = null;
let responseInterceptor = null;

export function attachAuthHandlers(getToken, logout) {
  if (requestInterceptor !== null) api.interceptors.request.eject(requestInterceptor);
  if (responseInterceptor !== null) api.interceptors.response.eject(responseInterceptor);
  requestInterceptor = api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  responseInterceptor = api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) logout();
      return Promise.reject(error);
    }
  );
}

export const messageFromError = (error) => error.response?.data?.message || error.message || "Something went wrong";
