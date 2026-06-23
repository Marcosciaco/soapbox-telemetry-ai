import React from 'react'
import { Loader } from 'lucide-react'

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      <p className="text-gray-600 mt-4">Loading...</p>
    </div>
  )
}

export default LoadingSpinner
