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
  // workoutPlan: {
  //   list: `${API_BASE_URL}/workout-plans/`,
  //   detail: (id: string | number) => `${API_BASE_URL}/workout-plans/${id}/`,
  //   create: `${API_BASE_URL}/workout-plans/`,
  //   update: (id: string | number) => `${API_BASE_URL}/workout-plans/${id}/`,
  //   delete: (id: string | number) => `${API_BASE_URL}/workout-plans/${id}/`,
  // },
  // trainermember: {
  //   list: `${API_BASE_URL}/trainer-members/`,
  //   detail: (id: string | number) => `${API_BASE_URL}/trainer-members/${id}/`,
  //   create: `${API_BASE_URL}/trainer-members/`,
  //   update: (id: string | number) => `${API_BASE_URL}/trainer-members/${id}/`,
  //   delete: (id: string | number) => `${API_BASE_URL}/trainer-members/${id}/`,
  // },
};
