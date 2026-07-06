import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1'
const DEFAULT_RESTAURANT_ID = import.meta.env.VITE_RESTAURANT_ID || ''

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
})

function getRestaurantId() {
  return localStorage.getItem('restaurantId') || DEFAULT_RESTAURANT_ID || null
}

api.interceptors.request.use(
  (config) => {
    const restaurantId = getRestaurantId()
    const isPublicRoute = config.url?.startsWith('/public/')

    if (restaurantId && !isPublicRoute) {
      config.headers['X-Restaurant-Id'] = restaurantId
    }

    return config
  },
  (error) => Promise.reject(error),
)

api.interceptors.response.use(
  (response) => {
    const payload = response.data

    if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
      response.data = payload.data
    }

    return response
  },
  (error) => {
    const apiError = error.response?.data
    const message =
      apiError?.message ||
      (Array.isArray(apiError?.message) ? apiError.message.join(', ') : null) ||
      error.message

    const err = new Error(message)
    err.status = error.response?.status
    return Promise.reject(err)
  },
)

export function setRestaurantId(restaurantId) {
  if (restaurantId) {
    localStorage.setItem('restaurantId', restaurantId)
  }
}

export default api
