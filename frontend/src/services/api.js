import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Telemetry endpoints
export const uploadTelemetry = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/api/telemetry/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const getMetrics = () => api.get('/api/analysis/metrics')
export const getLaps = () => api.get('/api/analysis/laps')
export const getBrakingZones = (lapNum) =>
  api.get('/api/analysis/braking', { params: { lap_num: lapNum } })

// Tire optimization endpoints
export const getTirePressureRecommendation = (data) =>
  api.post('/api/optimize/tire-pressure', data)
export const getPressureLimits = () => api.get('/api/optimize/pressure-limits')

// Weight calculation endpoints
export const getWeightRecommendation = (data) => api.post('/api/optimize/weight', data)

// Model training endpoints
export const addHistoricalRun = (data) => api.post('/api/historical-run/add', data)
export const trainModel = () => api.post('/api/model/train')

export default api
