import React, { useState, useEffect } from 'react'
import { getTirePressureRecommendation, getPressureLimits } from '../services/api'
import SuccessMessage from '../components/SuccessMessage'
import ErrorMessage from '../components/ErrorMessage'
import LoadingSpinner from '../components/LoadingSpinner'
import { Gauge, AlertCircle, Info } from 'lucide-react'

function TireOptimizer() {
  const [formData, setFormData] = useState({
    ambient_temp: 20,
    track_temp: 35,
    humidity: 50,
    track_type: 'asphalt',
  })
  const [recommendation, setRecommendation] = useState(null)
  const [limits, setLimits] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchLimits()
  }, [])

  const fetchLimits = async () => {
    try {
      const response = await getPressureLimits()
      setLimits(response.data)
    } catch (err) {
      console.error('Failed to fetch limits:', err)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: isNaN(value) ? value : parseFloat(value),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setRecommendation(null)

    try {
      const response = await getTirePressureRecommendation(formData)
      setRecommendation(response.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to get recommendation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Tire Pressure Optimizer</h1>
        <p className="text-gray-600 mt-2">Get dynamic tire pressure recommendations based on track conditions</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Form */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Gauge className="w-6 h-6 text-blue-600" />
            Input Conditions
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label className="form-label">Ambient Temperature (°C)</label>
              <input
                type="number"
                name="ambient_temp"
                value={formData.ambient_temp}
                onChange={handleInputChange}
                className="input"
                step="0.1"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Track Temperature (°C)</label>
              <input
                type="number"
                name="track_temp"
                value={formData.track_temp}
                onChange={handleInputChange}
                className="input"
                step="0.1"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Humidity (%)</label>
              <input
                type="number"
                name="humidity"
                value={formData.humidity}
                onChange={handleInputChange}
                className="input"
                min="0"
                max="100"
                step="1"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Track Type</label>
              <select
                name="track_type"
                value={formData.track_type}
                onChange={handleInputChange}
                className="input"
              >
                <option value="asphalt">Asphalt</option>
                <option value="technical">Technical</option>
                <option value="high-speed">High-Speed</option>
                <option value="wet">Wet</option>
              </select>
            </div>

            <button type="submit" disabled={loading} className="w-full btn btn-primary disabled:opacity-50">
              {loading ? 'Calculating...' : 'Get Recommendation'}
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {error && <ErrorMessage message={error} icon={<AlertCircle className="w-5 h-5" />} />}

          {recommendation && (
            <>
              <SuccessMessage message="Recommendation calculated successfully" />

              <div className="card">
                <h3 className="text-lg font-bold mb-4">📊 Recommendation</h3>
                <div className="space-y-3">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Recommended Pressure</p>
                    <p className="text-3xl font-bold text-blue-600">{recommendation.recommended_pressure.toFixed(1)} PSI</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Min Pressure</p>
                      <p className="text-xl font-bold text-green-600">{recommendation.min_pressure.toFixed(1)} PSI</p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Max Pressure</p>
                      <p className="text-xl font-bold text-red-600">{recommendation.max_pressure.toFixed(1)} PSI</p>
                    </div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Confidence</p>
                    <p className="text-lg font-bold text-purple-600">{(recommendation.confidence * 100).toFixed(0)}%</p>
                  </div>
                  {recommendation.warning && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                      <p className="text-sm font-medium text-yellow-800">⚠️ {recommendation.warning}</p>
                    </div>
                  )}
                  <p className="text-sm text-gray-600 italic pt-2">{recommendation.reasoning}</p>
                </div>
              </div>
            </>
          )}

          {limits && (
            <div className="card bg-blue-50">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                Pressure Limits
              </h3>
              <div className="text-sm text-gray-700 space-y-2">
                {Object.entries(limits).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="font-medium capitalize">{key.replace(/_/g, ' ')}</span>
                    <span>{JSON.stringify(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TireOptimizer
