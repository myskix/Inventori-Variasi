import axios from 'axios';

// Configure the base URL to point to our new Express backend
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api/v1' : 'http://localhost:5001/api/v1');

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle global errors (like 401 Unauthorized)
apiClient.interceptors.response.use(
  (response) => response.data, // Simplify response to just data
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    // Return standard error message or generic one
    const message = error.response?.data?.message || 'Terjadi kesalahan pada jaringan/server.';
    return Promise.reject(new Error(message));
  }
);

export const api = {
  // --- AUTH ---
  login: (username, password) => apiClient.post('/auth/login', { username, password }),
  getProfile: () => apiClient.get('/auth/profile'),

  // --- DASHBOARD ---
  getDashboardMetrics: () => apiClient.get('/dashboard'),

  // --- CATEGORIES ---
  getCategories: () => apiClient.get('/categories'),
  getActiveCategories: () => apiClient.get('/categories').then(res => res.filter(c => c.is_active)),
  createCategory: (data) => apiClient.post('/categories', data),
  updateCategory: (id, data) => apiClient.put(`/categories/${id}`, data),
  deleteCategory: (id) => apiClient.delete(`/categories/${id}`),

  // --- PRODUCTS ---
  getProducts: () => apiClient.get('/products'),
  getActiveProducts: () => apiClient.get('/products').then(res => res.filter(p => p.is_active && p.stok_saat_ini > 0)),
  createProduct: (data) => apiClient.post('/products', data),
  updateProduct: (id, data) => apiClient.put(`/products/${id}`, data),
  deleteProduct: (id) => apiClient.delete(`/products/${id}`),
  restoreProduct: (id) => apiClient.post(`/products/${id}/restore`),
  updateProductStock: (id, change_qty, log_type, remarks) => apiClient.post(`/products/${id}/stock`, { change_qty, log_type, remarks }),

  // --- TRANSACTIONS & POS ---
  getTransactions: () => apiClient.get('/transactions'),
  createTransaction: (data) => apiClient.post('/transactions', data),
  cancelTransaction: (id) => apiClient.post(`/transactions/${id}/cancel`),

  // --- WARRANTY ---
  checkWarranty: (params) => apiClient.get('/warranties/check', { params }), // params: { plat, phone, invoice, name }
  claimWarranty: (id) => apiClient.post(`/warranties/${id}/claim`),

  // --- STOCK LOGS ---
  getStockLogs: () => apiClient.get('/logs/stock')
};
