"""Telemetry performance analysis and metrics calculation."""

import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from enum import Enum
import logging

logger = logging.getLogger(__name__)


class TurnType(Enum):
    STRAIGHT = "straight"
    GENTLE = "gentle"
    MODERATE = "moderate"
    SHARP = "sharp"
    HAIRPIN = "hairpin"


@dataclass
class PerformanceMetrics:
    max_speed: float
    avg_speed: float
    max_acceleration: float
    max_deceleration: float
    peak_gforce: float
    peak_lateral_gforce: float
    peak_longitudinal_gforce: float
    avg_gforce: float
    total_distance_m: float
    elapsed_time_s: float
    braking_zones: int
    acceleration_zones: int
    cornering_zones: int


@dataclass
class LapMetrics:
    lap_number: int
    lap_time_s: float
    max_speed: float
    avg_speed: float
    distance_m: float
    peak_gforce: float
    num_turns: int


class PerformanceAnalyzer:
    """Analyze telemetry data for performance insights."""

    def __init__(self, df: pd.DataFrame):
        self.df = df
        self.laps = self._segment_laps()

    def _segment_laps(self) -> Dict[int, pd.DataFrame]:
        laps = {}
        for lap_num in sorted(self.df['Lap'].unique()):
            laps[int(lap_num)] = self.df[self.df['Lap'] == lap_num].reset_index(drop=True)
        return laps

    def get_overall_metrics(self) -> PerformanceMetrics:
        return PerformanceMetrics(
            max_speed=float(self.df['Speed'].max()),
            avg_speed=float(self.df['Speed'].mean()),
            max_acceleration=float(self.df['Acceleration'].max()),
            max_deceleration=float(self.df['Acceleration'].min()),
            peak_gforce=float(self.df['GForce_Magnitude'].max()),
            peak_lateral_gforce=float(self.df['GForce_Lateral'].max()),
            peak_longitudinal_gforce=float(self.df['GForce_Longitudinal'].max()),
            avg_gforce=float(self.df['GForce_Magnitude'].mean()),
            total_distance_m=float(self.df['Distance_Total_m'].iloc[-1]),
            elapsed_time_s=float(self.df['elapsed_seconds'].iloc[-1]),
            braking_zones=int(self.df['Is_Braking'].sum()),
            acceleration_zones=int(self.df['Is_Accelerating'].sum()),
            cornering_zones=int(self.df['Is_Cornering'].sum()),
        )

    def get_lap_metrics(self, lap_num: int) -> LapMetrics:
        if lap_num not in self.laps:
            raise ValueError(f"Lap {lap_num} not found")
        lap_df = self.laps[lap_num]
        turns = self._detect_turns(lap_df)
        return LapMetrics(
            lap_number=lap_num,
            lap_time_s=float(lap_df['elapsed_seconds'].iloc[-1] - lap_df['elapsed_seconds'].iloc[0]),
            max_speed=float(lap_df['Speed'].max()),
            avg_speed=float(lap_df['Speed'].mean()),
            distance_m=float(lap_df['Distance_Total_m'].iloc[-1]),
            peak_gforce=float(lap_df['GForce_Magnitude'].max()),
            num_turns=len(turns),
        )

    def _detect_turns(self, lap_df: pd.DataFrame) -> List[Dict]:
        turns = []
        in_turn = False
        turn_start = None
        peak_gforce = 0
        for idx, row in lap_df.iterrows():
            if row['Is_Cornering']:
                if not in_turn:
                    in_turn = True
                    turn_start = idx
                    peak_gforce = row['GForce_Lateral']
                else:
                    peak_gforce = max(peak_gforce, row['GForce_Lateral'])
            else:
                if in_turn:
                    in_turn = False
                    turn_duration = idx - turn_start
                    turn_type = self._classify_turn(peak_gforce)
                    turns.append({
                        'start_idx': turn_start,
                        'end_idx': idx,
                        'duration': turn_duration,
                        'peak_gforce': peak_gforce,
                        'type': turn_type.value,
                    })
        return turns

    def _classify_turn(self, peak_gforce: float) -> TurnType:
        if peak_gforce < 0.3:
            return TurnType.STRAIGHT
        elif peak_gforce < 0.5:
            return TurnType.GENTLE
        elif peak_gforce < 0.8:
            return TurnType.MODERATE
        elif peak_gforce < 1.2:
            return TurnType.SHARP
        else:
            return TurnType.HAIRPIN

    def get_braking_zones(self, lap_num: Optional[int] = None) -> pd.DataFrame:
        df = self.laps[lap_num] if lap_num else self.df
        braking = df[df['Is_Braking']].copy()
        braking['Deceleration_Rate'] = -braking['Acceleration']
        return braking[['Time', 'Speed', 'Deceleration_Rate', 'Latitude', 'Longitude']].reset_index(drop=True)

    def get_acceleration_zones(self, lap_num: Optional[int] = None) -> pd.DataFrame:
        df = self.laps[lap_num] if lap_num else self.df
        accel = df[df['Is_Accelerating']].copy()
        return accel[['Time', 'Speed', 'Acceleration', 'Latitude', 'Longitude']].reset_index(drop=True)

    def find_best_lap(self) -> Tuple[int, float]:
        best_lap = None
        best_time = float('inf')
        for lap_num, lap_df in self.laps.items():
            lap_time = lap_df['elapsed_seconds'].iloc[-1] - lap_df['elapsed_seconds'].iloc[0]
            if lap_time < best_time:
                best_time = lap_time
                best_lap = lap_num
        return best_lap, best_time
