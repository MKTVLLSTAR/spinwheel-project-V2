import axios from "axios";
import toast from "react-hot-toast";

// API Base URL
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Token management
export const getAuthToken = () => {
  return localStorage.getItem("spinwheel_admin_token");
};

export const setAuthToken = (token) => {
  localStorage.setItem("spinwheel_admin_token", token);
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

export const removeAuthToken = () => {
  localStorage.removeItem("spinwheel_admin_token");
  delete api.defaults.headers.common["Authorization"];
};

// Set token on app init
const token = getAuthToken();
if (token) {
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeAuthToken();
      window.location.href = "/admin/login";
      toast.error("Session expired. Please login again.");
    } else if (error.response?.status === 429) {
      toast.error("Too many requests. Please try again later.");
    } else if (!error.response) {
      toast.error("Network error. Please check your connection.");
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  verify: () => api.get("/auth/verify"),
  logout: () => api.post("/auth/logout"),
};

// Admin API
export const adminAPI = {
  // User management
  getUsers: () => api.get("/admin/users"),
  createUser: (userData) => api.post("/admin/users", userData),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),

  // Token management
  getTokens: (params) => api.get("/admin/tokens", { params }),
  createToken: () => api.post("/admin/tokens"),

  // Spin results
  getSpinResults: (params) => api.get("/admin/spin-results", { params }),
};

// Prize API
export const prizeAPI = {
  getPrizes: () => api.get("/prizes"),
  updatePrizes: (prizes) => api.put("/prizes/bulk-update", { prizes }),
  updatePrize: (position, prizeData) =>
    api.put(`/prizes/${position}`, prizeData),
};

// Spin API (Public)
export const spinAPI = {
  verifyToken: (tokenId) => api.post("/spin/verify-token", { tokenId }),
  spin: (tokenId) => api.post("/spin/spin", { tokenId }),
};

// Utility function for API error handling
export const handleAPIError = (error, customMessage = null) => {
  const message =
    customMessage ||
    error.response?.data?.message ||
    error.message ||
    "An unexpected error occurred";

  console.error("API Error:", error);
  toast.error(message);

  return {
    success: false,
    message,
    error,
  };
};

// Utility function for API success handling
export const handleAPISuccess = (response, customMessage = null) => {
  const message =
    customMessage ||
    response.data?.message ||
    "Operation completed successfully";

  if (customMessage) {
    toast.success(message);
  }

  return {
    success: true,
    message,
    data: response.data,
  };
};

export default api;
