"""Tire pressure optimization with min/max constraints."""

import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
import logging
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler

logger = logging.getLogger(__name__)


@dataclass
class PressureRecommendation:
    recommended_pressure: float
    min_pressure: float
    max_pressure: float
    confidence: float
    reasoning: str
    factors: Dict[str, float]
    warning: Optional[str] = None


@dataclass
class RunSetup:
    run_id: str
    tire_pressure: float
    ambient_temp: float
    track_temp: float
    humidity: float
    lap_time: float
    track_type: str
    date: str


@dataclass
class PressureLimits:
    absolute_min: float
    absolute_max: float
    recommended_min: float
    recommended_max: float
    
    def validate(self, pressure: float) -> Tuple[bool, Optional[str]]:
        if pressure < self.absolute_min:
            return False, f"CRITICAL: Pressure {pressure} PSI below minimum {self.absolute_min} PSI"
        if pressure > self.absolute_max:
            return False, f"CRITICAL: Pressure {pressure} PSI exceeds maximum {self.absolute_max} PSI"
        warning = None
        if pressure < self.recommended_min:
            warning = f"WARNING: Below recommended minimum {self.recommended_min} PSI"
        if pressure > self.recommended_max:
            warning = f"WARNING: Exceeds recommended maximum {self.recommended_max} PSI"
        return True, warning


class TireOptimizer:
    """Optimize tire pressure based on conditions and performance data."""

    BASE_PRESSURES = {
        'asphalt': 45.0,
        'concrete': 46.0,
        'mixed': 45.5,
        'technical': 44.0,
        'high_speed': 46.5,
    }

    TEMP_COEFFICIENT = 0.03
    HUMIDITY_FACTOR = 0.02

    DEFAULT_PRESSURE_LIMITS = {
        'asphalt': PressureLimits(35.0, 55.0, 42.0, 50.0),
        'concrete': PressureLimits(36.0, 56.0, 43.0, 51.0),
        'technical': PressureLimits(34.0, 52.0, 40.0, 48.0),
        'high_speed': PressureLimits(38.0, 58.0, 45.0, 53.0),
        'mixed': PressureLimits(35.0, 55.0, 42.0, 50.0),
    }

    def __init__(self, custom_limits: Optional[Dict[str, PressureLimits]] = None):
        self.historical_runs: List[RunSetup] = []
        self.model = None
        self.scaler = StandardScaler()
        self.is_trained = False
        self.pressure_limits = custom_limits or self.DEFAULT_PRESSURE_LIMITS
        logger.info(f"Initialized with {len(self.pressure_limits)} track types")

    def set_pressure_limits(self, track_type: str, limits: PressureLimits) -> None:
        self.pressure_limits[track_type] = limits
        logger.info(f"Updated pressure limits for {track_type}")

    def get_pressure_limits(self, track_type: str) -> PressureLimits:
        return self.pressure_limits.get(track_type, self.DEFAULT_PRESSURE_LIMITS['asphalt'])

    def add_historical_run(self, setup: RunSetup) -> None:
        self.historical_runs.append(setup)
        logger.info(f"Added run: {setup.run_id}")

    def train_model(self) -> bool:
        if len(self.historical_runs) < 3:
            logger.warning("Need at least 3 runs for model training")
            return False
        X = np.array([[r.tire_pressure, r.ambient_temp, r.track_temp, r.humidity] for r in self.historical_runs])
        y = np.array([r.lap_time for r in self.historical_runs])
        X_scaled = self.scaler.fit_transform(X)
        self.model = RandomForestRegressor(n_estimators=10, max_depth=5, random_state=42)
        self.model.fit(X_scaled, y)
        self.is_trained = True
        logger.info("Model trained successfully")
        return True

    def get_pressure_recommendation(
        self,
        ambient_temp: float,
        track_temp: float,
        humidity: float,
        track_type: str = 'asphalt',
        use_model: bool = True
    ) -> PressureRecommendation:
        base_pressure = self.BASE_PRESSURES.get(track_type, 45.0)
        temp_adjustment = (track_temp - 25) * self.TEMP_COEFFICIENT
        humidity_adjustment = -(humidity - 60) * self.HUMIDITY_FACTOR / 100
        recommended = base_pressure + temp_adjustment + humidity_adjustment
        factors = {'base_pressure': base_pressure, 'temperature_adjustment': temp_adjustment, 'humidity_adjustment': humidity_adjustment}
        confidence = 0.8 if (use_model and self.is_trained) else 0.6
        limits = self.get_pressure_limits(track_type)
        clamped_recommended = np.clip(recommended, limits.recommended_min, limits.recommended_max)
        min_pressure = max(clamped_recommended - 1.5, limits.recommended_min)
        max_pressure = min(clamped_recommended + 1.5, limits.recommended_max)
        is_valid, warning = limits.validate(clamped_recommended)
        reasoning = f"Base: {base_pressure} PSI. Temp adjustment: {temp_adjustment:+.2f}. Humidity adjustment: {humidity_adjustment:+.2f}."
        return PressureRecommendation(
            recommended_pressure=round(clamped_recommended, 2),
            min_pressure=round(min_pressure, 2),
            max_pressure=round(max_pressure, 2),
            confidence=confidence,
            reasoning=reasoning,
            factors=factors,
            warning=warning
        )

    def get_pressure_constraints_summary(self) -> Dict:
        summary = {}
        for track_type, limits in self.pressure_limits.items():
            summary[track_type] = {
                'absolute_min': limits.absolute_min,
                'absolute_max': limits.absolute_max,
                'recommended_min': limits.recommended_min,
                'recommended_max': limits.recommended_max,
            }
        return summary
