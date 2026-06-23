import React, { useState, useEffect } from 'react'
import { getLaps, getBrakingZones } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Activity, AlertCircle } from 'lucide-react'

function LapAnalysis() {
  const [laps, setLaps] = useState([])
  const [selectedLap, setSelectedLap] = useState(null)
  const [brakingZones, setBrakingZones] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchLaps()
  }, [])

  const fetchLaps = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getLaps()
      setLaps(response.data.laps || [])
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load laps')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectLap = async (lapNum) => {
    setSelectedLap(lapNum)
    try {
      const response = await getBrakingZones(lapNum)
      setBrakingZones(response.data || [])
    } catch (err) {
      console.error('Failed to load braking zones:', err)
      setBrakingZones([])
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Lap Analysis</h1>
        <p className="text-gray-600 mt-2">Detailed metrics and zones for each lap</p>
      </div>

      {error && <ErrorMessage message={error} icon={<AlertCircle className="w-5 h-5" />} />}

      {laps.length === 0 ? (
        <div className="card text-center py-12">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No lap data available</p>
          <p className="text-gray-500 text-sm mt-2">Upload telemetry data to analyze laps</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Lap List */}
          <div className="card">
            <h2 className="text-lg font-bold mb-4">Laps</h2>
            <div className="space-y-2">
              {laps.map((lap) => (
                <button
                  key={lap.lap_number}
                  onClick={() => handleSelectLap(lap.lap_number)}
                  className={`w-full text-left p-3 rounded-lg transition ${
                    selectedLap === lap.lap_number
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <div className="font-semibold">Lap {lap.lap_number}</div>
                  <div className="text-sm opacity-75">
                    Time: {lap.lap_time_s?.toFixed(2)}s • Speed: {lap.max_speed?.toFixed(1)} km/h
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chart */}
          <div className="md:col-span-2 card">
            {selectedLap !== null && brakingZones.length > 0 ? (
              <>
                <h2 className="text-lg font-bold mb-4">Braking Zones - Lap {selectedLap}</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={brakingZones}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="zone_id" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="speed_kmh" fill="#3b82f6" name="Speed (km/h)" />
                    <Bar dataKey="brake_intensity" fill="#ef4444" name="Brake Intensity" />
                  </BarChart>
                </ResponsiveContainer>
              </>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <p className="text-gray-500">Select a lap to view braking zones</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default LapAnalysis
