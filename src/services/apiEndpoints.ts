const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const apiEndpoints = {
  auth: {
    login: `${API_BASE_URL}/api/token/`,
    refresh: `${API_BASE_URL}/api/token/refresh/`,
    logout: `${API_BASE_URL}/logout/`,
  },
  users: {
    list: `${API_BASE_URL}/users/`,
    self: `${API_BASE_URL}/self/`,
    detail: (id: string | number) => `${API_BASE_URL}/users/${id}/`,
    create: `${API_BASE_URL}/users/`,
    update: (id: string | number) => `${API_BASE_URL}/users/${id}/`,
    delete: (id: string | number) => `${API_BASE_URL}/users/${id}/`,
  },
};
