# Soapbox Telemetry AI Dashboard

React frontend for telemetry analysis and optimization.

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server (runs on port 3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Features

### 📊 Dashboard
- Real-time performance metrics
- Max/avg speed, G-force analysis
- Braking zone detection

### 📤 Telemetry Upload
- CSV file upload
- Automatic data parsing
- Metadata extraction

### 🛞 Tire Optimizer
- Dynamic pressure recommendations
- Temperature and humidity compensation
- Track type-specific constraints
- Confidence scoring

### ⚖️ Weight Calculator
- Altitude-based calculations
- Air density compensation
- Track type factors
- Performance simulation

### 📈 Lap Analysis
- Per-lap metrics
- Braking zone visualization
- Speed profiles
- Consistency tracking

### 🧠 Model Training
- Historical run management
- ML model training
- Performance optimization
- Data accumulation

## Environment Variables

Create `.env.local` from `.env.example`:

```
VITE_API_URL=http://localhost:8000
```

## Project Structure

```
src/
  ├── components/       UI components (cards, spinners, etc.)
  ├── pages/           Page components (Dashboard, Upload, etc.)
  ├── services/        API client
  ├── App.jsx          Main app with routing
  ├── main.jsx         Entry point
  └── index.css        Tailwind styles
```

## API Integration

The frontend connects to the FastAPI backend at `http://localhost:8000`.

### Available Endpoints

- `POST /api/telemetry/upload` - Upload CSV telemetry
- `GET /api/analysis/metrics` - Get overall metrics
- `GET /api/analysis/laps` - List lap data
- `GET /api/analysis/braking` - Get braking zones
- `POST /api/optimize/tire-pressure` - Get pressure recommendation
- `GET /api/optimize/pressure-limits` - Get pressure constraints
- `POST /api/optimize/weight` - Calculate optimal weight
- `POST /api/historical-run/add` - Add historical run
- `POST /api/model/train` - Train ML model

## Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **Axios** - HTTP client
- **React Router** - Navigation
