# Soapbox Telemetry AI Analysis Tool

Comprehensive AI-powered telemetry analysis system for soapbox racing. Analyze performance, optimize tire pressure with min/max constraints, calculate ideal weight based on track elevation, and improve lap times.

## ✨ Features

### 🏁 Core Analytics
- **Telemetry Parsing**: Automated RaceBox CSV import and processing
- **Performance Analysis**: Lap comparison, acceleration profiles, G-force analysis
- **Track Mapping**: GPS-based track visualization and turn identification
- **Segment Analysis**: Cornering, braking, and acceleration zones
- **Turn Detection**: Automatic classification (straight, gentle, moderate, sharp, hairpin)

### 🛞 Tire Pressure Optimization
- Dynamic tire pressure recommendations based on temperature, humidity, track conditions
- **Min/Max Pressure Constraints**: Safety limits by track type
- Weather-aware adjustments
- ML model learns from your historical data

### ⚖️ Weight Optimization
- Altitude-based weight calculations using Open-Elevation API (free)
- Air density compensation for elevation
- Track-type specific recommendations
- Performance simulation

### 📱 Race Day Features
- Real-time telemetry streaming
- Quick setup configuration
- Live recommendations
- Offline-first mobile app
- Post-race analysis & export

## 🚀 Quick Start

```bash
# Clone and setup
git clone https://github.com/Marcosciaco/soapbox-telemetry-ai.git
cd soapbox-telemetry-ai
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run API
python backend/app.py
# Opens at http://localhost:8000
# API docs at http://localhost:8000/docs
```

## 📊 API Examples

```bash
# Upload telemetry
curl -X POST -F "file=@data.csv" http://localhost:8000/api/telemetry/upload

# Get metrics
curl http://localhost:8000/api/analysis/metrics

# Get tire pressure recommendation
curl -X POST http://localhost:8000/api/optimize/tire-pressure \
  -H "Content-Type: application/json" \
  -d '{"ambient_temp": 25, "track_temp": 35, "humidity": 60, "track_type": "asphalt"}'

# Calculate optimal weight
curl -X POST http://localhost:8000/api/optimize/weight \
  -H "Content-Type: application/json" \
  -d '{"track_latitude": 44.73, "track_longitude": 10.08, "current_weight_kg": 32.0}'
```

## 📋 Key Features

### Tire Pressure with Min/Max Constraints
- **Absolute Limits**: Hard safety boundaries (e.g., 35-55 PSI)
- **Recommended Range**: Optimal operating window (e.g., 42-50 PSI)
- **Customizable by Track Type**: Different limits for asphalt, technical, high-speed tracks
- **Automatic Validation**: Warnings when recommendations outside recommended range

### Weight Optimization Algorithm
```
Optimal = Current × Air Density Factor × Track Type Factor

Air Density Factor = 1 - (elevation_m / 1000) × 0.035
Track Type Factor: 0.90 (technical) to 1.05 (high-speed)
```

### Performance Analysis
- Braking zone identification
- Acceleration zone analysis
- Turn classification and metrics
- Lap comparison and consistency tracking
- G-force profiling

## 📁 Project Structure

```
backend/
  ├── telemetry_parser.py       # CSV parsing
  ├── performance_analyzer.py   # Analysis & metrics
  ├── tire_optimizer.py         # Pressure with constraints
  ├── weight_calculator.py      # Weight optimization
  └── app.py                    # FastAPI server

frontend/                       # React dashboard
mobile/                         # React Native app
data/sample_runs/               # Example CSVs
tests/                          # Unit tests
```

## 🔧 Configuration

```python
# Customize pressure limits
from backend.tire_optimizer import TireOptimizer, PressureLimits

optimizer = TireOptimizer()
limits = PressureLimits(
    absolute_min=40.0,
    absolute_max=50.0,
    recommended_min=43.0,
    recommended_max=48.0
)
optimizer.set_pressure_limits('custom_track', limits)
```

## 📚 Documentation

- Full API docs: http://localhost:8000/docs (Swagger)
- ReDoc: http://localhost:8000/redoc

## 🛣️ Roadmap

- [x] Telemetry parser
- [x] Performance analyzer
- [x] Weight calculator
- [x] Tire pressure with constraints
- [ ] Live streaming
- [ ] Neural network models
- [ ] Cloud sync
- [ ] Video overlay

## 📄 License

MIT License - See LICENSE file

## 🏁

Go fast. Optimize smart. Race hard.
