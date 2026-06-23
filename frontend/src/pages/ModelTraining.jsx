import React, { useState } from 'react'
import { addHistoricalRun, trainModel } from '../services/api'
import SuccessMessage from '../components/SuccessMessage'
import ErrorMessage from '../components/ErrorMessage'
import LoadingSpinner from '../components/LoadingSpinner'
import { Brain, AlertCircle, Plus } from 'lucide-react'

function ModelTraining() {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    run_id: '',
    tire_pressure: 45.0,
    ambient_temp: 20.0,
    track_temp: 35.0,
    humidity: 50.0,
    lap_time: 0.0,
    track_type: 'asphalt',
    date: new Date().toISOString().split('T')[0],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [trainResult, setTrainResult] = useState(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: isNaN(value) ? value : parseFloat(value),
    }))
  }

  const handleAddRun = async (e) => {
    e.preventDefault()
    if (!formData.run_id) {
      setError('Please enter a run ID')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await addHistoricalRun(formData)
      setSuccess(`Run ${formData.run_id} added successfully`)
      setFormData({
        run_id: '',
        tire_pressure: 45.0,
        ambient_temp: 20.0,
        track_temp: 35.0,
        humidity: 50.0,
        lap_time: 0.0,
        track_type: 'asphalt',
        date: new Date().toISOString().split('T')[0],
      })
      setShowForm(false)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add run')
    } finally {
      setLoading(false)
    }
  }

  const handleTrain = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    setTrainResult(null)

    try {
      const response = await trainModel()
      setTrainResult(response.data)
      if (response.data.status === 'success') {
        setSuccess(response.data.message)
      } else {
        setError(response.data.message)
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to train model')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Model Training</h1>
        <p className="text-gray-600 mt-2">Train ML models with historical run data</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Add Historical Run */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Plus className="w-6 h-6 text-green-600" />
            Add Historical Run
          </h2>

          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full btn btn-primary"
            >
              Add New Run
            </button>
          ) : (
            <form onSubmit={handleAddRun} className="space-y-4">
              <div className="form-group">
                <label className="form-label">Run ID</label>
                <input
                  type="text"
                  name="run_id"
                  value={formData.run_id}
                  onChange={handleInputChange}
                  placeholder="e.g., RUN001"
                  className="input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="form-label">Tire Pressure (PSI)</label>
                  <input
                    type="number"
                    name="tire_pressure"
                    value={formData.tire_pressure}
                    onChange={handleInputChange}
                    className="input"
                    step="0.1"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Lap Time (s)</label>
                  <input
                    type="number"
                    name="lap_time"
                    value={formData.lap_time}
                    onChange={handleInputChange}
                    className="input"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="form-label">Ambient Temp (°C)</label>
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
                  <label className="form-label">Track Temp (°C)</label>
                  <input
                    type="number"
                    name="track_temp"
                    value={formData.track_temp}
                    onChange={handleInputChange}
                    className="input"
                    step="0.1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
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
              </div>

              <div className="flex gap-2">
                <button type="submit" disabled={loading} className="flex-1 btn btn-primary disabled:opacity-50">
                  {loading ? 'Adding...' : 'Add Run'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 btn bg-gray-300 text-gray-900 hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Train Model */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-600" />
            Train Model
          </h2>

          <div className="space-y-4">
            <p className="text-gray-600 text-sm">
              Use collected historical run data to train ML models for better tire pressure recommendations.
            </p>

            {error && <ErrorMessage message={error} icon={<AlertCircle className="w-5 h-5" />} />}
            {success && <SuccessMessage message={success} />}

            {trainResult && (
              <div className="card bg-green-50">
                <p className="font-semibold text-green-900">Status: {trainResult.status.toUpperCase()}</p>
                <p className="text-green-700 text-sm mt-1">{trainResult.message}</p>
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-blue-900">💡 Tips for Better Models:</p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• Collect at least 20+ historical runs</li>
                <li>• Vary track conditions and types</li>
                <li>• Record accurate lap times</li>
                <li>• Include different tire pressures</li>
              </ul>
            </div>

            <button
              onClick={handleTrain}
              disabled={loading}
              className="w-full btn btn-secondary disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Training...
                </span>
              ) : (
                'Start Training'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModelTraining
