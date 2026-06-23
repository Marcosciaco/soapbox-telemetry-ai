import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import TelemetryUpload from './pages/TelemetryUpload'
import TireOptimizer from './pages/TireOptimizer'
import WeightCalculator from './pages/WeightCalculator'
import LapAnalysis from './pages/LapAnalysis'
import ModelTraining from './pages/ModelTraining'

function App() {
  return (
    <Router>
      <Navbar />
      <main className="container mx-auto p-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<TelemetryUpload />} />
          <Route path="/tire" element={<TireOptimizer />} />
          <Route path="/weight" element={<WeightCalculator />} />
          <Route path="/laps" element={<LapAnalysis />} />
          <Route path="/training" element={<ModelTraining />} />
        </Routes>
      </main>
    </Router>
  )
}

export default App
