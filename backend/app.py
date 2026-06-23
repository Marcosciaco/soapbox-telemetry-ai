"""FastAPI application for telemetry analysis."""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import logging
import tempfile

from telemetry_parser import TelemetryParser
from performance_analyzer import PerformanceAnalyzer
from tire_optimizer import TireOptimizer, RunSetup
from weight_calculator import WeightCalculator

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Soapbox Telemetry AI",
    description="AI analysis tool for soapbox racing",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

parser = TelemetryParser()
analyzer = None
tire_optimizer = TireOptimizer()
weight_calc = WeightCalculator()


class PressureRequest(BaseModel):
    ambient_temp: float
    track_temp: float
    humidity: float
    track_type: str = "asphalt"


class WeightRequest(BaseModel):
    track_latitude: float
    track_longitude: float
    current_weight_kg: float
    track_type: str = "asphalt"
    ambient_temp_c: float = 15.0


class HistoricalRunRequest(BaseModel):
    run_id: str
    tire_pressure: float
    ambient_temp: float
    track_temp: float
    humidity: float
    lap_time: float
    track_type: str
    date: str


@app.get("/")
async def root():
    return {"message": "Soapbox Telemetry AI", "version": "0.1.0", "status": "running"}


@app.post("/api/telemetry/upload")
async def upload_telemetry(file: UploadFile = File(...)):
    """Upload and parse telemetry CSV file."""
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".csv") as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name

        global analyzer
        df = parser.parse_csv(tmp_path)
        analyzer = PerformanceAnalyzer(df)
        metadata = parser.get_metadata()

        return {"status": "success", "message": f"Parsed {len(df)} records", "metadata": metadata}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/analysis/metrics")
async def get_metrics():
    """Get overall performance metrics."""
    if analyzer is None:
        raise HTTPException(status_code=400, detail="No telemetry data loaded")
    metrics = analyzer.get_overall_metrics()
    return {
        "max_speed": metrics.max_speed,
        "avg_speed": metrics.avg_speed,
        "peak_gforce": metrics.peak_gforce,
        "braking_zones": metrics.braking_zones,
        "acceleration_zones": metrics.acceleration_zones,
    }


@app.get("/api/analysis/laps")
async def get_lap_list():
    """Get list of available laps."""
    if analyzer is None:
        raise HTTPException(status_code=400, detail="No telemetry data loaded")
    laps = []
    for lap_num in sorted(analyzer.laps.keys()):
        metrics = analyzer.get_lap_metrics(lap_num)
        laps.append({"lap_number": metrics.lap_number, "lap_time_s": metrics.lap_time_s, "max_speed": metrics.max_speed})
    return {"laps": laps}


@app.post("/api/optimize/tire-pressure")
async def get_pressure_recommendation(request: PressureRequest):
    """Get tire pressure recommendation."""
    try:
        rec = tire_optimizer.get_pressure_recommendation(
            ambient_temp=request.ambient_temp,
            track_temp=request.track_temp,
            humidity=request.humidity,
            track_type=request.track_type,
        )
        return {
            "recommended_pressure": rec.recommended_pressure,
            "min_pressure": rec.min_pressure,
            "max_pressure": rec.max_pressure,
            "confidence": rec.confidence,
            "reasoning": rec.reasoning,
            "warning": rec.warning,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/optimize/pressure-limits")
async def get_pressure_limits():
    """Get all pressure constraints."""
    return tire_optimizer.get_pressure_constraints_summary()


@app.post("/api/optimize/weight")
async def get_weight_recommendation(request: WeightRequest):
    """Get optimal weight calculation."""
    try:
        rec = weight_calc.calculate_optimal_weight(
            track_latitude=request.track_latitude,
            track_longitude=request.track_longitude,
            current_weight_kg=request.current_weight_kg,
            track_type=request.track_type,
            ambient_temp_c=request.ambient_temp_c,
        )
        return {
            "track_elevation_m": rec.track_elevation_m,
            "optimal_weight_kg": rec.optimal_weight_kg,
            "weight_adjustment_g": rec.weight_adjustment_g,
            "air_density_factor": rec.air_density_factor,
            "reasoning": rec.reasoning,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/analysis/braking")
async def get_braking_zones(lap_num: Optional[int] = None):
    """Get braking zone analysis."""
    if analyzer is None:
        raise HTTPException(status_code=400, detail="No telemetry data loaded")
    braking_df = analyzer.get_braking_zones(lap_num)
    return braking_df.to_dict(orient='records')


@app.post("/api/historical-run/add")
async def add_historical_run(request: HistoricalRunRequest):
    """Add historical run for model training."""
    try:
        setup = RunSetup(
            run_id=request.run_id,
            tire_pressure=request.tire_pressure,
            ambient_temp=request.ambient_temp,
            track_temp=request.track_temp,
            humidity=request.humidity,
            lap_time=request.lap_time,
            track_type=request.track_type,
            date=request.date,
        )
        tire_optimizer.add_historical_run(setup)
        return {"status": "success", "message": f"Added run {request.run_id}"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/model/train")
async def train_model():
    """Train tire pressure model."""
    success = tire_optimizer.train_model()
    if success:
        return {"status": "success", "message": "Model trained"}
    return {"status": "error", "message": "Not enough data"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
