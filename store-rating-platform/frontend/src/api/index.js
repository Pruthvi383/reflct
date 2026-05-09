import { api } from "./client";

export const authApi = {
  register: (payload) => api.post("/auth/register", payload),
  login: (payload) => api.post("/auth/login", payload),
  changePassword: (payload) => api.patch("/auth/change-password", payload)
};

export const adminApi = {
  dashboard: () => api.get("/admin/dashboard"),
  users: (params) => api.get("/admin/users", { params }),
  user: (id) => api.get(`/admin/users/${id}`),
  createUser: (payload) => api.post("/admin/users", payload),
  stores: (params) => api.get("/admin/stores", { params }),
  createStore: (payload) => api.post("/admin/stores", payload)
};

export const userApi = {
  stores: (params) => api.get("/stores", { params }),
  rate: (payload) => api.post("/ratings", payload),
  updateRating: (id, payload) => api.patch(`/ratings/${id}`, payload)
};

export const ownerApi = {
  dashboard: (params) => api.get("/store-owner/dashboard", { params })
};
