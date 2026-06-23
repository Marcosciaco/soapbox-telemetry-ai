import React from 'react'
import { CheckCircle } from 'lucide-react'

function SuccessMessage({ message }) {
  return (
    <div className="card bg-green-50 border-l-4 border-green-600 flex items-start gap-4">
      <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
      <div>
        <h3 className="font-semibold text-green-900">Success</h3>
        <p className="text-green-700 text-sm mt-1">{message}</p>
      </div>
    </div>
  )
}

export default SuccessMessage
