import React, { useState } from 'react'
import { uploadTelemetry } from '../services/api'
import SuccessMessage from '../components/SuccessMessage'
import ErrorMessage from '../components/ErrorMessage'
import LoadingSpinner from '../components/LoadingSpinner'
import { Upload, AlertCircle } from 'lucide-react'

function TelemetryUpload() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      if (selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile)
        setError(null)
      } else {
        setError('Please select a valid CSV file')
        setFile(null)
      }
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await uploadTelemetry(file)
      setSuccess(`${response.data.message} - Metadata: ${JSON.stringify(response.data.metadata)}`)
      setFile(null)
      document.querySelector('input[type="file"]').value = ''
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload telemetry')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Upload Telemetry</h1>
        <p className="text-gray-600 mt-2">Import RaceBox CSV data for analysis</p>
      </div>

      <div className="card">
        <div className="space-y-6">
          <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 bg-blue-50 text-center">
            <Upload className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Drag and drop your CSV file, or click to browse</p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="file-input"
            />
            <label htmlFor="file-input" className="btn btn-primary">
              Choose File
            </label>
            {file && (
              <p className="text-green-600 font-medium mt-4">✓ {file.name} selected</p>
            )}
          </div>

          {error && <ErrorMessage message={error} icon={<AlertCircle className="w-5 h-5" />} />}
          {success && <SuccessMessage message={success} />}

          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                Uploading...
              </span>
            ) : (
              'Upload Telemetry'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default TelemetryUpload
