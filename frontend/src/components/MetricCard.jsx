import React from 'react'

function MetricCard({ title, value, unit, icon, color }) {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-lg shadow-lg p-6 text-white`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm opacity-90 font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          <p className="text-xs opacity-75 mt-1">{unit}</p>
        </div>
        <div className="opacity-80">{icon}</div>
      </div>
    </div>
  )
}

export default MetricCard
