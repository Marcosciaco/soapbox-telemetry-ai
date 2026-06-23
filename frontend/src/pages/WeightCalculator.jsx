import React, { useState } from 'react'
import { getWeightRecommendation } from '../services/api'
import SuccessMessage from '../components/SuccessMessage'
import ErrorMessage from '../components/ErrorMessage'
import { Weight, AlertCircle, MapPin } from 'lucide-react'

function WeightCalculator() {
  const [formData, setFormData] = useState({
    track_latitude: 44.73,
    track_longitude: 10.08,
    current_weight_kg: 32.0,
    track_type: 'asphalt',
    ambient_temp_c: 15.0,
  })
  const [recommendation, setRecommendation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

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
      const response = await getWeightRecommendation(formData)
      setRecommendation(response.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to calculate weight')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Weight Calculator</h1>
        <p className="text-gray-600 mt-2">Calculate optimal weight based on track elevation and conditions</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Form */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Weight className="w-6 h-6 text-purple-600" />
            Track Information
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label className="form-label">Track Latitude</label>
              <input
                type="number"
                name="track_latitude"
                value={formData.track_latitude}
                onChange={handleInputChange}
                className="input"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Track Longitude</label>
              <input
                type="number"
                name="track_longitude"
                value={formData.track_longitude}
                onChange={handleInputChange}
                className="input"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Current Weight (kg)</label>
              <input
                type="number"
                name="current_weight_kg"
                value={formData.current_weight_kg}
                onChange={handleInputChange}
                className="input"
                step="0.1"
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
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Ambient Temperature (°C)</label>
              <input
                type="number"
                name="ambient_temp_c"
                value={formData.ambient_temp_c}
                onChange={handleInputChange}
                className="input"
                step="0.1"
              />
            </div>

            <button type="submit" disabled={loading} className="w-full btn btn-secondary disabled:opacity-50">
              {loading ? 'Calculating...' : 'Calculate Weight'
              }
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {error && <ErrorMessage message={error} icon={<AlertCircle className="w-5 h-5" />} />}

          {recommendation && (
            <>
              <SuccessMessage message="Weight calculation completed" />

              <div className="card">
                <h3 className="text-lg font-bold mb-4">📈 Results</h3>
                <div className="space-y-3">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Track Elevation</p>
                    <p className="text-3xl font-bold text-blue-600">{recommendation.track_elevation_m.toFixed(0)} m</p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Optimal Weight</p>
                    <p className="text-3xl font-bold text-purple-600">{recommendation.optimal_weight_kg.toFixed(2)} kg</p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Weight Adjustment</p>
                    <p className="text-2xl font-bold text-green-600">{recommendation.weight_adjustment_g.toFixed(0)} g</p>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Air Density Factor</p>
                    <p className="text-2xl font-bold text-yellow-600">{recommendation.air_density_factor.toFixed(4)}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg mt-4">
                    <p className="text-sm text-gray-600 mb-2">Reasoning</p>
                    <p className="text-sm text-gray-700">{recommendation.reasoning}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default WeightCalculator
