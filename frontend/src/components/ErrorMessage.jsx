import React from 'react'

function ErrorMessage({ message, icon }) {
  return (
    <div className="card bg-red-50 border-l-4 border-red-600 flex items-start gap-4">
      <div className="text-red-600 mt-1">{icon}</div>
      <div>
        <h3 className="font-semibold text-red-900">Error</h3>
        <p className="text-red-700 text-sm mt-1">{message}</p>
      </div>
    </div>
  )
}

export default ErrorMessage
