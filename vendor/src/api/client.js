import axios from 'axios'

export const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
})

apiClient.defaults.withCredentials = true

// Request interceptor to attach token from localStorage
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('vendorToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => {
    // Unwrap the `data` property from the success envelope
    if (response.data && response.data.success !== undefined) {
      // The envelope format is { success: true, data: {}, meta: {} }
      // We return both data and meta attached to data so hooks can read `meta`
      const result = response.data.data || {}
      if (response.data.meta) {
        result._meta = response.data.meta
      }
      return result
    }
    return response.data
  },
  (error) => {
    // Normalize errors into { code, message, fields }
    let normalizedError = {
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred',
      fields: {}
    }

    if (error.response && error.response.data) {
      const serverError = error.response.data.error || {}
      normalizedError = {
        code: serverError.code || 'UNKNOWN_ERROR',
        message: serverError.message || error.message,
        fields: serverError.fields || {}
      }
    } else if (error.request) {
      normalizedError.code = 'NETWORK_ERROR'
      normalizedError.message = 'Network error. Please check your connection.'
    } else {
      normalizedError.message = error.message
    }

    return Promise.reject(normalizedError)
  }
)
