"""RaceBox telemetry CSV parser and data validation."""

import pandas as pd
from datetime import datetime
from typing import Dict, List, Optional
import logging

logger = logging.getLogger(__name__)


class TelemetryParser:
    """Parse and validate RaceBox telemetry CSV files."""

    REQUIRED_COLUMNS = [
        'Time', 'Latitude', 'Longitude', 'Altitude', 'Speed',
        'GForceX', 'GForceY', 'GForceZ', 'Lap',
        'GyroX', 'GyroY', 'GyroZ'
    ]

    SAMPLE_INTERVAL_MS = 40

    def __init__(self):
        self.df = None
        self.metadata = {}

    def parse_csv(self, filepath: str) -> pd.DataFrame:
        """Parse RaceBox CSV file."""
        try:
            self.df = pd.read_csv(filepath, skiprows=6)
            logger.info(f"Loaded CSV: {filepath}")
        except FileNotFoundError:
            raise FileNotFoundError(f"File not found: {filepath}")
        except Exception as e:
            raise ValueError(f"Error parsing CSV: {str(e)}")

        self._validate_columns()
        self._process_timestamps()
        self._process_coordinates()
        self._process_speeds()
        self._process_gforce()
        self._process_gyro()
        self._calculate_derived_metrics()

        logger.info(f"Parsed {len(self.df)} records")
        return self.df

    def _validate_columns(self) -> None:
        missing = [col for col in self.REQUIRED_COLUMNS if col not in self.df.columns]
        if missing:
            raise ValueError(f"Missing required columns: {missing}")

    def _process_timestamps(self) -> None:
        self.df['Time'] = pd.to_datetime(self.df['Time'])
        self.df['elapsed_seconds'] = (
            self.df['Time'] - self.df['Time'].iloc[0]
        ).dt.total_seconds()

    def _process_coordinates(self) -> None:
        assert (-90 <= self.df['Latitude']).all() and (self.df['Latitude'] <= 90).all()
        assert (-180 <= self.df['Longitude']).all() and (self.df['Longitude'] <= 180).all()
        logger.info("GPS coordinates validated")

    def _process_speeds(self) -> None:
        self.df['Speed'] = self.df['Speed'].clip(lower=0)
        self.df['Acceleration'] = self.df['Speed'].diff() / (self.SAMPLE_INTERVAL_MS / 1000)

    def _process_gforce(self) -> None:
        self.df['GForce_Magnitude'] = (
            (self.df['GForceX'] ** 2 + self.df['GForceY'] ** 2 + self.df['GForceZ'] ** 2) ** 0.5
        )
        self.df['GForce_Lateral'] = self.df['GForceX'].abs()
        self.df['GForce_Longitudinal'] = self.df['GForceY'].abs()

    def _process_gyro(self) -> None:
        self.df['Gyro_Magnitude'] = (
            (self.df['GyroX'] ** 2 + self.df['GyroY'] ** 2 + self.df['GyroZ'] ** 2) ** 0.5
        )

    def _calculate_derived_metrics(self) -> None:
        from haversine import haversine
        distances = []
        for i in range(len(self.df)):
            if i == 0:
                distances.append(0)
            else:
                lat1, lon1 = self.df.loc[i-1, ['Latitude', 'Longitude']]
                lat2, lon2 = self.df.loc[i, ['Latitude', 'Longitude']]
                dist = haversine((lat1, lon1), (lat2, lon2)) * 1000
                distances.append(dist)
        self.df['Distance_Delta_m'] = distances
        self.df['Distance_Total_m'] = self.df['Distance_Delta_m'].cumsum()
        self.df['Is_Braking'] = self.df['Acceleration'] < -0.5
        self.df['Is_Accelerating'] = self.df['Acceleration'] > 0.5
        self.df['Is_Cornering'] = self.df['GForce_Lateral'] > 0.5

    def get_metadata(self) -> Dict:
        if self.df is None:
            return {}
        return {
            'start_time': str(self.df['Time'].iloc[0]),
            'end_time': str(self.df['Time'].iloc[-1]),
            'duration_seconds': float(self.df['elapsed_seconds'].iloc[-1]),
            'num_records': len(self.df),
            'num_laps': int(self.df['Lap'].max()),
            'max_speed': float(self.df['Speed'].max()),
            'max_gforce': float(self.df['GForce_Magnitude'].max()),
            'avg_speed': float(self.df['Speed'].mean()),
        }
