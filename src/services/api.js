import axios from 'axios'

// Axios instance for future backend API integration
// When the Express backend (pos-variasi-be) is ready,
// update the baseURL to point to the server.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor: attach auth token if available
api.interceptors.request.use(
  (config) => {
    const storedUser = localStorage.getItem('pos_user')
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        if (user.token) {
          config.headers.Authorization = `Bearer ${user.token}`
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('pos_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
