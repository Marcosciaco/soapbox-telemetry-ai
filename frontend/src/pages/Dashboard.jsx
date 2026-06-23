import React, { useState, useEffect } from 'react'
import { getMetrics } from '../services/api'
import MetricCard from '../components/MetricCard'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import { AlertCircle, TrendingUp, Zap, Wind } from 'lucide-react'

function Dashboard() {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getMetrics()
      setMetrics(response.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load metrics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Performance Dashboard</h1>
          <p className="text-gray-600 mt-2">Real-time telemetry analysis for soapbox racing</p>
        </div>
        <button
          onClick={fetchMetrics}
          className="btn btn-primary"
        >
          Refresh
        </button>
      </div>

      {error && (
        <ErrorMessage
          message={error}
          icon={<AlertCircle className="w-5 h-5" />}
        />
      )}

      {metrics ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Max Speed"
            value={metrics.max_speed?.toFixed(1) || 'N/A'}
            unit="km/h"
            icon={<TrendingUp className="w-6 h-6" />}
            color="from-blue-500 to-blue-600"
          />
          <MetricCard
            title="Avg Speed"
            value={metrics.avg_speed?.toFixed(1) || 'N/A'}
            unit="km/h"
            icon={<Wind className="w-6 h-6" />}
            color="from-purple-500 to-purple-600"
          />
          <MetricCard
            title="Peak G-Force"
            value={metrics.peak_gforce?.toFixed(2) || 'N/A'}
            unit="G"
            icon={<Zap className="w-6 h-6" />}
            color="from-yellow-500 to-yellow-600"
          />
          <MetricCard
            title="Braking Zones"
            value={metrics.braking_zones || 0}
            unit="detected"
            icon={<AlertCircle className="w-6 h-6" />}
            color="from-red-500 to-red-600"
          />
        </div>
      ) : (
        <div className="card text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No telemetry data loaded yet</p>
          <p className="text-gray-500 text-sm mt-2">Upload a telemetry file to see metrics</p>
        </div>
      )}
    </div>
  )
}

export default Dashboard
