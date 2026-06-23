"""Weight optimization based on track elevation."""

import requests
from typing import Dict, Optional
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)


@dataclass
class WeightRecommendation:
    track_elevation_m: float
    current_weight_kg: float
    optimal_weight_kg: float
    weight_adjustment_g: float
    air_density_factor: float
    reasoning: str


class WeightCalculator:
    """Calculate optimal weight based on track conditions."""

    AIR_DENSITY_SEA_LEVEL = 1.225
    TEMP_LAPSE_RATE = 6.5

    TRACK_TYPE_FACTORS = {
        'technical': 0.90,
        'mixed': 0.95,
        'asphalt': 1.0,
        'concrete': 1.02,
        'high_speed': 1.05,
        'circuit': 1.03,
    }

    def __init__(self):
        pass

    def get_elevation(self, latitude: float, longitude: float) -> float:
        """Get track elevation from Open-Elevation API (free)."""
        try:
            url = f"https://api.open-elevation.com/api/v1/lookup?locations={latitude},{longitude}"
            response = requests.get(url, timeout=5)
            response.raise_for_status()
            data = response.json()
            elevation = data['results'][0]['elevation']
            logger.info(f"Retrieved elevation: {elevation}m")
            return elevation
        except Exception as e:
            logger.error(f"Failed to get elevation: {str(e)}")
            raise

    def calculate_air_density(self, elevation_m: float, ambient_temp_c: float = 15.0) -> float:
        """Calculate air density at given elevation."""
        temp_k = 273.15 + ambient_temp_c - (self.TEMP_LAPSE_RATE * elevation_m / 1000)
        temp_k = max(temp_k, 250)
        pressure_factor = (1 - (elevation_m / 1000) * 0.12) ** 5.255
        air_density = self.AIR_DENSITY_SEA_LEVEL * pressure_factor * (288.15 / temp_k)
        return air_density

    def calculate_optimal_weight(
        self,
        track_latitude: float,
        track_longitude: float,
        current_weight_kg: float,
        track_type: str = 'asphalt',
        ambient_temp_c: float = 15.0
    ) -> WeightRecommendation:
        """Calculate optimal weight for track conditions."""
        try:
            elevation = self.get_elevation(track_latitude, track_longitude)
        except:
            elevation = 0.0
        
        air_density = self.calculate_air_density(elevation, ambient_temp_c)
        air_density_sea_level = self.calculate_air_density(0, ambient_temp_c)
        air_density_factor = air_density / air_density_sea_level
        track_factor = self.TRACK_TYPE_FACTORS.get(track_type, 1.0)
        optimal_weight = current_weight_kg * air_density_factor * track_factor
        weight_adjustment = optimal_weight - current_weight_kg
        
        reasoning = f"Elevation: {elevation:.0f}m. Air density: {air_density_factor:.1%} of sea level. Track type: {track_type}."
        
        return WeightRecommendation(
            track_elevation_m=elevation,
            current_weight_kg=current_weight_kg,
            optimal_weight_kg=round(optimal_weight, 2),
            weight_adjustment_g=round(weight_adjustment * 1000, 0),
            air_density_factor=round(air_density_factor, 4),
            reasoning=reasoning
        )
